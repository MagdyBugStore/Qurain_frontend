import { useCallback, useEffect, useRef, useState } from 'react';
import { getTestSocket, disconnectTestSocket } from '../../lib/testSocket';

export type LogEntry = {
  id: number;
  time: string;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
};

export type PeerState = {
  connectionState: RTCPeerConnectionState;
  iceConnectionState: RTCIceConnectionState;
  signalingState: RTCSignalingState;
};

export type PeerEntry = {
  peerId: string;
  remoteStream: MediaStream;
  state: PeerState;
};

type PeerInternal = PeerEntry & { pc: RTCPeerConnection };

type CandidateCounts = { host: number; srflx: number; relay: number; prflx: number };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const viteEnv: any = (import.meta as any).env || {};
const TURN_SECRET = viteEnv.VITE_TURN_SECRET || '';

const ICE_SERVERS: RTCIceServer[] = [
  { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] },
  ...(TURN_SECRET
    ? [
        {
          urls: [
            'turn:209.38.135.65:3478?transport=udp',
            'turn:209.38.135.65:3478?transport=tcp',
          ],
          username: 'qurain',
          credential: TURN_SECRET,
        },
      ]
    : []),
];

let _logId = 0;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function candidateTypeLabel(type: string | null | undefined): string {
  switch (type) {
    case 'host':  return 'host (direct LAN)';
    case 'srflx': return 'srflx (STUN/public IP)';
    case 'relay': return 'relay (TURN)';
    case 'prflx': return 'prflx (peer-reflexive)';
    default:      return type ?? 'unknown';
  }
}

function parseCandidateType(sdpLine: string): string {
  const m = /\btyp\s+(\w+)/.exec(sdpLine);
  return m ? m[1] : 'unknown';
}

async function detectConnectionPath(pc: RTCPeerConnection): Promise<string> {
  try {
    const stats = await pc.getStats();
    for (const report of stats.values()) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const r = report as any;
      if (r.type === 'candidate-pair' && r.nominated && r.state === 'succeeded') {
        const local = stats.get(r.localCandidateId) as any;
        const remote = stats.get(r.remoteCandidateId) as any;
        const lt = local?.candidateType ?? '?';
        const rt = remote?.candidateType ?? '?';
        if (lt === 'relay' || rt === 'relay') {
          return `relay / TURN  (local: ${lt} | remote: ${rt})`;
        }
        if (lt === 'srflx' || rt === 'srflx') {
          return `STUN / public IP  (local: ${lt} | remote: ${rt})`;
        }
        return `direct / LAN  (local: ${lt} | remote: ${rt})`;
      }
    }
  } catch {
    // stats not available yet — non-fatal
  }
  return 'unknown';
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useTestRoomWebRTC(roomId: string) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [localStreamReady, setLocalStreamReady] = useState(false);
  const [peers, setPeers] = useState<PeerEntry[]>([]);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);

  const localStreamRef = useRef<MediaStream | null>(null);
  const peersRef = useRef<Map<string, PeerInternal>>(new Map());
  const candidateCountsRef = useRef<Map<string, CandidateCounts>>(new Map());
  const joinedRef = useRef(false);

  // ─── Logging ──────────────────────────────────────────────────────────────
  const log = useCallback((message: string, level: LogEntry['level'] = 'info') => {
    const entry: LogEntry = {
      id: ++_logId,
      time: new Date().toLocaleTimeString('en-US', { hour12: false }),
      level,
      message,
    };
    console.log(`[TestRoom] [${level.toUpperCase()}] ${message}`);
    setLogs((prev) => [...prev.slice(-299), entry]);
  }, []);

  // ─── Sync peer list to state ───────────────────────────────────────────────
  const syncPeers = useCallback(() => {
    setPeers([...peersRef.current.values()].map(({ pc: _pc, ...rest }) => rest));
  }, []);

  const updatePeerState = useCallback((peerId: string, pc: RTCPeerConnection) => {
    const entry = peersRef.current.get(peerId);
    if (!entry) return;
    entry.state = {
      connectionState: pc.connectionState,
      iceConnectionState: pc.iceConnectionState,
      signalingState: pc.signalingState,
    };
    syncPeers();
  }, [syncPeers]);

  // ─── Create one RTCPeerConnection per remote peer ─────────────────────────
  const createPeer = useCallback((peerId: string, isInitiator: boolean) => {
    if (peersRef.current.has(peerId)) return peersRef.current.get(peerId)!;

    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    const remoteStream = new MediaStream();
    const short = peerId.slice(0, 8);

    const hasTurn = TURN_SECRET.length > 0;
    log(`Peer ${short} — setting up connection  [TURN ${hasTurn ? 'enabled ✓' : 'disabled ✗'}]`);

    // Init candidate counter for this peer
    candidateCountsRef.current.set(peerId, { host: 0, srflx: 0, relay: 0, prflx: 0 });

    // ── ICE candidate generated (outgoing) ───────────────────────────────────
    pc.onicecandidate = (e) => {
      if (!e.candidate) return;
      const type = e.candidate.type ?? parseCandidateType(e.candidate.candidate);
      const counts = candidateCountsRef.current.get(peerId)!;
      if (type in counts) counts[type as keyof CandidateCounts]++;
      const label = candidateTypeLabel(type);
      log(`  → ICE candidate sent to ${short}: ${label}`);
      getTestSocket().emit('test-room:ice', { to: peerId, candidate: e.candidate });
    };

    // ── ICE gathering ─────────────────────────────────────────────────────────
    pc.onicegatheringstatechange = () => {
      if (pc.iceGatheringState === 'gathering') {
        log(`ICE gathering started for peer ${short}`);
      } else if (pc.iceGatheringState === 'complete') {
        const counts = candidateCountsRef.current.get(peerId) ?? { host: 0, srflx: 0, relay: 0, prflx: 0 };
        const total = counts.host + counts.srflx + counts.relay + counts.prflx;
        const turnLine = counts.relay > 0
          ? `${counts.relay} relay (TURN) ✓`
          : 'no TURN candidates ✗';
        log(
          `ICE gathering complete for peer ${short} — ` +
          `${total} candidates: ${counts.host} host | ${counts.srflx} srflx | ${turnLine}`,
          counts.relay > 0 ? 'success' : 'warn',
        );
      }
    };

    // ── Remote track received ─────────────────────────────────────────────────
    pc.ontrack = (e) => {
      remoteStream.addTrack(e.track);
      log(`Remote ${e.track.kind} track received from peer ${short}`, 'success');
      syncPeers();
    };

    // ── Connection state ──────────────────────────────────────────────────────
    pc.onconnectionstatechange = () => {
      updatePeerState(peerId, pc);
      switch (pc.connectionState) {
        case 'connecting':
          log(`Connecting to peer ${short}…`);
          break;
        case 'connected':
          detectConnectionPath(pc).then((path) => {
            const isRelay = path.startsWith('relay');
            log(
              `Connected to peer ${short} — via ${path}`,
              'success',
            );
            if (!isRelay) {
              log(`  ℹ Direct path in use — TURN was not needed for ${short}`);
            } else {
              log(`  ✓ TURN relay is active for ${short} — mobile/symmetric NAT traversed`);
            }
          });
          break;
        case 'disconnected':
          log(`Peer ${short} — connection dropped (network change or timeout)`, 'warn');
          break;
        case 'failed':
          log(`Connection failed for peer ${short} — no viable ICE path found`, 'error');
          if (!hasTurn) {
            log(`  ✗ TURN is not configured — peers behind symmetric NAT will always fail`, 'error');
          }
          break;
        case 'closed':
          log(`Connection closed for peer ${short}`);
          break;
      }
    };

    // ── ICE connection state ──────────────────────────────────────────────────
    pc.oniceconnectionstatechange = () => {
      updatePeerState(peerId, pc);
      switch (pc.iceConnectionState) {
        case 'checking':
          log(`ICE checking: testing candidate pairs for peer ${short}`);
          break;
        case 'connected':
          log(`ICE connected for peer ${short}`);
          break;
        case 'completed':
          log(`ICE completed for peer ${short} — best path locked in`, 'success');
          break;
        case 'disconnected':
          log(`ICE disconnected for peer ${short} — may recover`, 'warn');
          break;
        case 'failed':
          log(`ICE failed for peer ${short} — all candidate pairs exhausted`, 'error');
          break;
      }
    };

    // ── Signaling state ───────────────────────────────────────────────────────
    pc.onsignalingstatechange = () => {
      updatePeerState(peerId, pc);
    };

    // Add local tracks so the remote peer receives our media
    localStreamRef.current?.getTracks().forEach((track) => {
      if (localStreamRef.current) pc.addTrack(track, localStreamRef.current);
    });

    const entry: PeerInternal = {
      peerId,
      pc,
      remoteStream,
      state: {
        connectionState: pc.connectionState,
        iceConnectionState: pc.iceConnectionState,
        signalingState: pc.signalingState,
      },
    };
    peersRef.current.set(peerId, entry);
    syncPeers();

    if (isInitiator) {
      log(`Creating offer for peer ${short} (we are the initiator)`);
      pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true })
        .then((offer) => pc.setLocalDescription(offer).then(() => offer))
        .then((offer) => {
          getTestSocket().emit('test-room:offer', { to: peerId, sdp: offer });
          log(`Offer sent to peer ${short}`);
        })
        .catch((e) => log(`Error creating offer for peer ${short}: ${(e as Error).message}`, 'error'));
    }

    return entry;
  }, [log, syncPeers, updatePeerState]);

  // ─── Tear down one peer ────────────────────────────────────────────────────
  const removePeer = useCallback((peerId: string) => {
    const entry = peersRef.current.get(peerId);
    if (!entry) return;
    entry.pc.close();
    peersRef.current.delete(peerId);
    candidateCountsRef.current.delete(peerId);
    log(`Peer ${peerId.slice(0, 8)} left — connection closed`, 'warn');
    syncPeers();
  }, [log, syncPeers]);

  // ─── Main join ────────────────────────────────────────────────────────────
  const join = useCallback(async () => {
    if (joinedRef.current) return;

    // 1. Log TURN config status
    if (TURN_SECRET) {
      log('TURN server configured ✓ — relay candidates will be included');
    } else {
      log('TURN server NOT configured ✗ — connections behind symmetric NAT will fail', 'warn');
    }

    // 2. Get local media
    if (!navigator.mediaDevices?.getUserMedia) {
      log(
        'Camera/mic unavailable — browser requires HTTPS (or localhost) for media access',
        'error',
      );
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      localStreamRef.current = stream;
      setLocalStreamReady(true);
      log('Local media acquired (camera + microphone)');
    } catch (e) {
      log(`Failed to acquire camera/mic: ${(e as Error).message}`, 'error');
      return;
    }

    // 3. Connect socket
    const socket = getTestSocket();

    socket.on('connect', () => {
      log(`Signaling socket connected (id: ${socket.id})`, 'success');
      setIsConnected(true);
      socket.emit('test-room:join', { roomId });
      log(`Joined room: ${roomId}`);
    });

    socket.on('disconnect', () => {
      log('Signaling socket disconnected', 'warn');
      setIsConnected(false);
    });

    socket.on('connect_error', (e) => {
      log(`Signaling socket error: ${e.message}`, 'error');
    });

    // 4. Existing participants — we send offers
    socket.on('test-room:participants', ({ participants }: { participants: string[] }) => {
      if (participants.length === 0) {
        log('Room is empty — waiting for others to join');
      } else {
        log(`Room has ${participants.length} existing peer${participants.length > 1 ? 's' : ''}: [${participants.map((p) => p.slice(0, 8)).join(', ')}]`);
        participants.forEach((peerId) => createPeer(peerId, true));
      }
    });

    // 5. New peer joined — they will send us an offer
    socket.on('test-room:peer-joined', ({ peerId }: { peerId: string }) => {
      log(`New peer joined: ${peerId.slice(0, 8)} — waiting for their offer`);
      createPeer(peerId, false);
    });

    // 6. Receive offer
    socket.on('test-room:offer', async ({ from, sdp }: { from: string; sdp: RTCSessionDescriptionInit }) => {
      const short = from.slice(0, 8);
      log(`Offer received from peer ${short} — starting answer`);
      let entry = peersRef.current.get(from);
      if (!entry) entry = createPeer(from, false);
      const { pc } = entry;
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('test-room:answer', { to: from, sdp: answer });
        log(`Answer sent to peer ${short}`);
      } catch (e) {
        log(`Error answering offer from peer ${short}: ${(e as Error).message}`, 'error');
      }
    });

    // 7. Receive answer
    socket.on('test-room:answer', async ({ from, sdp }: { from: string; sdp: RTCSessionDescriptionInit }) => {
      const short = from.slice(0, 8);
      log(`Answer received from peer ${short}`);
      const entry = peersRef.current.get(from);
      if (!entry) {
        log(`No peer entry for ${short} when answer arrived`, 'warn');
        return;
      }
      const { pc } = entry;
      if (pc.signalingState !== 'have-local-offer') {
        log(`Ignoring stale answer from peer ${short} (signaling: ${pc.signalingState})`, 'warn');
        return;
      }
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        log(`Signaling complete with peer ${short} — ICE negotiation in progress`);
      } catch (e) {
        log(`Error applying answer from peer ${short}: ${(e as Error).message}`, 'error');
      }
    });

    // 8. Receive ICE candidate
    socket.on('test-room:ice', async ({ from, candidate }: { from: string; candidate: RTCIceCandidateInit }) => {
      const short = from.slice(0, 8);
      const type = parseCandidateType(candidate.candidate ?? '');
      const label = candidateTypeLabel(type);
      log(`  ← ICE candidate from ${short}: ${label}`);
      const entry = peersRef.current.get(from);
      if (!entry) return;
      try {
        await entry.pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch {
        // occasional duplicate — safe to ignore
      }
    });

    // 9. Peer left
    socket.on('test-room:peer-left', ({ peerId }: { peerId: string }) => {
      log(`Peer ${peerId.slice(0, 8)} disconnected from room`, 'warn');
      removePeer(peerId);
    });

    if (socket.connected) {
      log(`Signaling socket already connected (id: ${socket.id})`, 'success');
      setIsConnected(true);
      socket.emit('test-room:join', { roomId });
      log(`Joined room: ${roomId}`);
    }

    joinedRef.current = true;

    window.addEventListener('beforeunload', () => {
      getTestSocket().emit('test-room:leave', { roomId });
    });
  }, [roomId, log, createPeer, removePeer]);

  // ─── Leave ────────────────────────────────────────────────────────────────
  const leave = useCallback(() => {
    peersRef.current.forEach((entry) => entry.pc.close());
    peersRef.current.clear();
    candidateCountsRef.current.clear();
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    disconnectTestSocket();
    setIsConnected(false);
    setLocalStreamReady(false);
    joinedRef.current = false;
    setPeers([]);
    log('Left room — all connections closed');
  }, [log]);

  // ─── Media toggles ────────────────────────────────────────────────────────
  const toggleMic = useCallback((on?: boolean) => {
    const next = typeof on === 'boolean' ? on : !isMicOn;
    localStreamRef.current?.getAudioTracks().forEach((t) => (t.enabled = next));
    setIsMicOn(next);
    log(`Microphone ${next ? 'unmuted' : 'muted'}`);
  }, [isMicOn, log]);

  const toggleVideo = useCallback((on?: boolean) => {
    const next = typeof on === 'boolean' ? on : !isVideoOn;
    localStreamRef.current?.getVideoTracks().forEach((t) => (t.enabled = next));
    setIsVideoOn(next);
    log(`Camera ${next ? 'on' : 'off'}`);
  }, [isVideoOn, log]);

  // ─── Cleanup on unmount ───────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (joinedRef.current) leave();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    logs,
    isConnected,
    localStreamReady,
    localStream: localStreamRef,
    peers,
    isMicOn,
    isVideoOn,
    join,
    leave,
    toggleMic,
    toggleVideo,
  };
}

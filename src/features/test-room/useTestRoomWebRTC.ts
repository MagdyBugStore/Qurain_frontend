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

const ICE_SERVERS: RTCIceServer[] = [
  { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] },
];

let _logId = 0;

export function useTestRoomWebRTC(roomId: string) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [localStreamReady, setLocalStreamReady] = useState(false);
  const [peers, setPeers] = useState<PeerEntry[]>([]);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);

  const localStreamRef = useRef<MediaStream | null>(null);
  const peersRef = useRef<Map<string, PeerInternal>>(new Map());
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
    setLogs((prev) => [...prev.slice(-199), entry]);
  }, []);

  // ─── Sync peer list to state ───────────────────────────────────────────────
  const syncPeers = useCallback(() => {
    setPeers(
      [...peersRef.current.values()].map(({ pc: _pc, ...rest }) => rest),
    );
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

    pc.onicecandidate = (e) => {
      if (!e.candidate) return;
      log(`ICE candidate generated for peer ${short}`);
      getTestSocket().emit('test-room:ice', { to: peerId, candidate: e.candidate });
    };

    pc.onicegatheringstatechange = () => {
      log(`ICE gathering state [${short}]: ${pc.iceGatheringState}`);
    };

    pc.ontrack = (e) => {
      remoteStream.addTrack(e.track);
      log(`Remote stream attached from peer ${short}`, 'success');
      syncPeers();
    };

    pc.onconnectionstatechange = () => {
      log(`Connection state changed [${short}]: ${pc.connectionState}`);
      updatePeerState(peerId, pc);
      if (pc.connectionState === 'connected') {
        log(`Peer connected: ${short}`, 'success');
      } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        log(`Peer disconnected: ${short}`, 'warn');
      }
    };

    pc.oniceconnectionstatechange = () => {
      log(`ICE connection state changed [${short}]: ${pc.iceConnectionState}`);
      updatePeerState(peerId, pc);
    };

    pc.onsignalingstatechange = () => {
      log(`Signaling state [${short}]: ${pc.signalingState}`);
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
      log(`Creating offer for peer ${short}`);
      pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true })
        .then((offer) => pc.setLocalDescription(offer).then(() => offer))
        .then((offer) => {
          getTestSocket().emit('test-room:offer', { to: peerId, sdp: offer });
          log(`Offer sent to peer ${short}`);
        })
        .catch((e) => log(`Error creating offer for ${short}: ${e.message}`, 'error'));
    }

    return entry;
  }, [log, syncPeers, updatePeerState]);

  // ─── Tear down one peer ────────────────────────────────────────────────────
  const removePeer = useCallback((peerId: string) => {
    const entry = peersRef.current.get(peerId);
    if (!entry) return;
    entry.pc.close();
    peersRef.current.delete(peerId);
    log(`Peer disconnected: ${peerId.slice(0, 8)}`, 'warn');
    syncPeers();
  }, [log, syncPeers]);

  // ─── Main join ────────────────────────────────────────────────────────────
  const join = useCallback(async () => {
    if (joinedRef.current) return;
    log('Page loaded');

    // 1. Get local media — requires a secure context (HTTPS or localhost)
    if (!navigator.mediaDevices?.getUserMedia) {
      log(
        'Camera/mic unavailable: browser requires HTTPS (or localhost) to access media devices. ' +
        'This page is served over plain HTTP — set up HTTPS on your server.',
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
      log(`Error acquiring media: ${(e as Error).message}`, 'error');
      return;
    }

    // 2. Connect socket
    const socket = getTestSocket();

    socket.on('connect', () => {
      log(`Socket connected: ${socket.id}`, 'success');
      setIsConnected(true);

      // 3. Join the test room
      socket.emit('test-room:join', { roomId });
      log(`Joined room: ${roomId}`);
    });

    socket.on('disconnect', () => {
      log('Socket disconnected', 'warn');
      setIsConnected(false);
    });

    socket.on('connect_error', (e) => {
      log(`Socket connection error: ${e.message}`, 'error');
    });

    // 4. Receive existing participants — we initiate offers to each
    socket.on('test-room:participants', ({ participants }: { participants: string[] }) => {
      log(`Participants received: [${participants.map((p) => p.slice(0, 8)).join(', ')}] (${participants.length} peer${participants.length !== 1 ? 's' : ''})`);
      participants.forEach((peerId) => {
        log(`Creating offer for existing peer ${peerId.slice(0, 8)}`);
        createPeer(peerId, true);
      });
    });

    // 5. New peer joined — they will initiate an offer to us
    socket.on('test-room:peer-joined', ({ peerId }: { peerId: string }) => {
      log(`New peer joined: ${peerId.slice(0, 8)}`);
      createPeer(peerId, false);
    });

    // 6. Receive offer from a peer
    socket.on('test-room:offer', async ({ from, sdp }: { from: string; sdp: RTCSessionDescriptionInit }) => {
      log(`Received offer from peer ${from.slice(0, 8)}`);
      let entry = peersRef.current.get(from);
      if (!entry) {
        entry = createPeer(from, false);
      }
      const { pc } = entry;
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('test-room:answer', { to: from, sdp: answer });
        log(`Sending answer to peer ${from.slice(0, 8)}`);
      } catch (e) {
        log(`Error handling offer from ${from.slice(0, 8)}: ${(e as Error).message}`, 'error');
      }
    });

    // 7. Receive answer to our offer
    socket.on('test-room:answer', async ({ from, sdp }: { from: string; sdp: RTCSessionDescriptionInit }) => {
      log(`Received answer from peer ${from.slice(0, 8)}`);
      const entry = peersRef.current.get(from);
      if (!entry) {
        log(`No peer entry for ${from.slice(0, 8)} when answer arrived`, 'warn');
        return;
      }
      const { pc } = entry;
      if (pc.signalingState !== 'have-local-offer') {
        log(`Ignoring stale answer from ${from.slice(0, 8)} (signalingState=${pc.signalingState})`, 'warn');
        return;
      }
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      } catch (e) {
        log(`Error handling answer from ${from.slice(0, 8)}: ${(e as Error).message}`, 'error');
      }
    });

    // 8. Receive ICE candidate
    socket.on('test-room:ice', async ({ from, candidate }: { from: string; candidate: RTCIceCandidateInit }) => {
      log(`ICE candidate received from peer ${from.slice(0, 8)}`);
      const entry = peersRef.current.get(from);
      if (!entry) return;
      try {
        await entry.pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch {
        // occasional duplicate candidate — safe to ignore
      }
    });

    // 9. Peer left
    socket.on('test-room:peer-left', ({ peerId }: { peerId: string }) => {
      log(`Peer left: ${peerId.slice(0, 8)}`, 'warn');
      removePeer(peerId);
    });

    if (socket.connected) {
      // Socket was already connected (re-join after hot reload etc.)
      log(`Socket already connected: ${socket.id}`, 'success');
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
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    disconnectTestSocket();
    setIsConnected(false);
    setLocalStreamReady(false);
    joinedRef.current = false;
    setPeers([]);
    log('Left room, all connections closed');
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

import { useCallback, useEffect, useRef, useState } from 'react';
import { getSocket } from '../../../../lib/socket';

type UseWebRTCOptions = {
  audio?: boolean;
  video?: boolean;
};

export function useWebRTC(roomId: string | undefined, options: UseWebRTCOptions = { audio: true, video: true }) {
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [hasRemoteParticipant, setHasRemoteParticipant] = useState(false);
  const [isMicOn, setIsMicOn] = useState(!!options.audio);
  const [isVideoOn, setIsVideoOn] = useState(!!options.video);
  const [localStreamReady, setLocalStreamReady] = useState(false);
  const [remoteStreamReady, setRemoteStreamReady] = useState(false);

  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const joinedRef = useRef<boolean>(false);
  const makingOfferRef = useRef<boolean>(false);
  const ignoreOfferRef = useRef<boolean>(false);
  const settingRemoteAnswerRef = useRef<boolean>(false);

  const ensureLocalStream = useCallback(async () => {
    if (localStreamRef.current) return localStreamRef.current;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: options.audio !== false,
        video: options.video !== false,
      });
      // Apply initial states
      stream.getAudioTracks().forEach((t) => (t.enabled = !!options.audio));
      stream.getVideoTracks().forEach((t) => (t.enabled = !!options.video));
      localStreamRef.current = stream;
      setIsMicOn(!!options.audio);
      setIsVideoOn(!!options.video);
      setLocalStreamReady(true);
      return stream;
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to access camera/microphone';
      setError(message);
      throw e;
    }
  }, [options.audio, options.video]);

  const createPeerConnection = useCallback(() => {
    if (pcRef.current) return pcRef.current;
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] },
      ],
    });
    pc.onicecandidate = (event) => {
      if (event.candidate && roomId) {
        const socket = getSocket();
        socket.emit('webrtc-ice-candidate', {
          roomId,
          candidate: event.candidate,
        });
      }
    };
    pc.ontrack = (event) => {
      setHasRemoteParticipant(true);
      if (!remoteStreamRef.current) {
        remoteStreamRef.current = new MediaStream();
      }
      remoteStreamRef.current.addTrack(event.track);
      setRemoteStreamReady(true);
    };
    pcRef.current = pc;
    return pc;
  }, [roomId]);

  const join = useCallback(async () => {
    if (!roomId) {
      setError('Missing room id');
      return;
    }
    if (joinedRef.current) return;
    setHasRemoteParticipant(false);

    const socket = getSocket();
    await ensureLocalStream();
    const pc = createPeerConnection();

    // Add local tracks
    localStreamRef.current?.getTracks().forEach((track) => {
      if (localStreamRef.current) {
        pc.addTrack(track, localStreamRef.current);
      }
    });

    // Socket handlers
    const onOffer = async ({ sdp }: { from: string; sdp: RTCSessionDescriptionInit }) => {
      try {
        setHasRemoteParticipant(true);
        const offerCollision = makingOfferRef.current || pc.signalingState !== 'stable';
        ignoreOfferRef.current = offerCollision;
        if (ignoreOfferRef.current) {
          return;
        }
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('webrtc-answer', { roomId, sdp: answer });
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed handling offer');
      }
    };

    const onAnswer = async ({ sdp }: { from: string; sdp: RTCSessionDescriptionInit }) => {
      try {
        setHasRemoteParticipant(true);
        if (ignoreOfferRef.current) return;
        const readyForAnswer =
          pc.signalingState === 'have-local-offer' || settingRemoteAnswerRef.current;
        if (!readyForAnswer) {
          // Ignore stale/duplicated answers arriving after stable state.
          return;
        }
        settingRemoteAnswerRef.current = true;
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed handling answer');
      } finally {
        settingRemoteAnswerRef.current = false;
      }
    };

    const onIce = async ({ candidate }: { from: string; candidate: RTCIceCandidateInit }) => {
      try {
        setHasRemoteParticipant(true);
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        // Ignore occasional "candidate already added" errors
      }
    };

    socket.on('webrtc-offer', onOffer);
    socket.on('webrtc-answer', onAnswer);
    socket.on('webrtc-ice-candidate', onIce);

    // Join room and try to initiate
    socket.emit('join-room', roomId);
    setIsConnected(true);
    joinedRef.current = true;

    // Create and send offer (simple 1:1 approach)
    try {
      makingOfferRef.current = true;
      const offer = await pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true });
      await pc.setLocalDescription(offer);
      socket.emit('webrtc-offer', { roomId, sdp: offer });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed creating offer');
    } finally {
      makingOfferRef.current = false;
    }

    // Cleanup on unload
    const handleBeforeUnload = () => {
      socket.emit('leave-room', roomId);
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      socket.off('webrtc-offer', onOffer);
      socket.off('webrtc-answer', onAnswer);
      socket.off('webrtc-ice-candidate', onIce);
    };
  }, [roomId, ensureLocalStream, createPeerConnection]);

  const leave = useCallback(() => {
    const socket = getSocket();
    if (roomId) socket.emit('leave-room', roomId);
    pcRef.current?.close();
    pcRef.current = null;
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    remoteStreamRef.current = null;
    setIsConnected(false);
    setHasRemoteParticipant(false);
    setLocalStreamReady(false);
    setRemoteStreamReady(false);
    joinedRef.current = false;
    makingOfferRef.current = false;
    ignoreOfferRef.current = false;
    settingRemoteAnswerRef.current = false;
  }, [roomId]);

  const toggleMic = useCallback((on?: boolean) => {
    const next = typeof on === 'boolean' ? on : !isMicOn;
    localStreamRef.current?.getAudioTracks().forEach((t) => (t.enabled = next));
    setIsMicOn(next);
  }, [isMicOn]);

  const toggleVideo = useCallback((on?: boolean) => {
    const next = typeof on === 'boolean' ? on : !isVideoOn;
    localStreamRef.current?.getVideoTracks().forEach((t) => (t.enabled = next));
    setIsVideoOn(next);
  }, [isVideoOn]);

  useEffect(() => {
    return () => {
      // Ensure cleanup if component unmounts
      if (pcRef.current) {
        leave();
      }
    };
  }, [leave]);

  return {
    error,
    isConnected,
    hasRemoteParticipant,
    isMicOn,
    isVideoOn,
    localStreamReady,
    remoteStreamReady,
    localStream: localStreamRef,
    remoteStream: remoteStreamRef,
    join,
    leave,
    toggleMic,
    toggleVideo,
  };
}


import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useWebRTC } from '../../hooks/useWebRTC';

type Props = {
  roomId: string;
  counterpartName?: string;
  counterpartAvatar?: string;
};

export function RoomCall({ roomId, counterpartName, counterpartAvatar }: Props) {
  const {
    error,
    isConnected,
    hasRemoteParticipant,
    isMicOn,
    isVideoOn,
    localStream,
    remoteStream,
    join,
    leave,
    toggleMic,
    toggleVideo,
  } = useWebRTC(roomId, { audio: true, video: true });

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const frequencyDataRef = useRef<Uint8Array | null>(null);
  const rafRef = useRef<number | null>(null);
  const [remoteAudioLevel, setRemoteAudioLevel] = useState(0);

  useEffect(() => {
    let mounted = true;
    let cleanup: (() => void) | undefined;
    void join().then((result) => {
      if (!mounted) return;
      cleanup = result;
    });
    return () => {
      mounted = false;
      if (cleanup) cleanup();
      leave();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  useEffect(() => {
    if (localVideoRef.current && localStream.current) {
      localVideoRef.current.srcObject = localStream.current;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream.current) {
      remoteVideoRef.current.srcObject = remoteStream.current;
    }
  }, [remoteStream]);

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 40;

    const stopAnalyzer = async () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      if (audioContextRef.current) {
        await audioContextRef.current.close();
        audioContextRef.current = null;
      }
      analyserRef.current = null;
      frequencyDataRef.current = null;
      setRemoteAudioLevel(0);
    };

    const startAnalyzer = async (stream: MediaStream) => {
      const AudioContextCtor = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextCtor) return;

      const context = new AudioContextCtor();
      const source = context.createMediaStreamSource(stream);
      const analyser = context.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.75;
      source.connect(analyser);

      const bins = new Uint8Array(analyser.frequencyBinCount);
      audioContextRef.current = context;
      analyserRef.current = analyser;
      frequencyDataRef.current = bins;

      const tick = () => {
        if (cancelled || !analyserRef.current || !frequencyDataRef.current) return;
        analyserRef.current.getByteFrequencyData(frequencyDataRef.current);
        const avg =
          frequencyDataRef.current.reduce((sum, value) => sum + value, 0) /
          Math.max(1, frequencyDataRef.current.length * 255);
        setRemoteAudioLevel(avg);
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();
    };

    const waitForRemoteAudio = async () => {
      if (cancelled) return;
      const stream = remoteStream.current;
      const hasAudio = !!stream?.getAudioTracks()?.some((track) => track.readyState === 'live');
      if (stream && hasAudio) {
        await startAnalyzer(stream);
        return;
      }
      attempts += 1;
      if (attempts < maxAttempts) {
        setTimeout(waitForRemoteAudio, 250);
      }
    };

    void stopAnalyzer().then(() => {
      if (isConnected) {
        void waitForRemoteAudio();
      }
    });

    return () => {
      cancelled = true;
      void stopAnalyzer();
    };
  }, [isConnected, remoteStream, roomId]);

  const remotePulse = remoteAudioLevel > 0.05;
  const localPulse = isMicOn;
  const waveBars = useMemo(
    () =>
      [0.7, 1.1, 1.4, 1, 0.8].map((factor, index) => {
        const level = Math.min(1, remoteAudioLevel * (2 + factor));
        const minHeight = 8;
        const maxHeight = 28;
        const height = minHeight + Math.round(level * maxHeight);
        return { id: index, height };
      }),
    [remoteAudioLevel]
  );

  return (
    <div className="relative w-full min-h-[calc(100vh-170px)] rounded-2xl overflow-hidden bg-[#202124] text-white">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,#3a3f45_0%,#202124_45%)] opacity-80" />

      <div className="relative h-full flex items-center justify-center p-6 sm:p-10">
        <div className="relative w-full max-w-[820px] aspect-video rounded-3xl border border-white/10 overflow-hidden bg-[#2b2c30] shadow-2xl">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <div className="relative">
              {remotePulse ? (
                <>
                  <span className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
                  <span className="absolute -inset-2 rounded-full border border-primary/40 animate-pulse" />
                </>
              ) : null}
              <div className="relative size-28 sm:size-32 rounded-full overflow-hidden border-4 border-white/30 shadow-xl bg-black/30 backdrop-blur-md">
                {counterpartAvatar ? (
                  <img src={counterpartAvatar} alt={counterpartName || 'المستخدم'} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-5xl text-white/80">person</span>
                  </div>
                )}
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white text-center">
              {counterpartName || 'المعلم / الطالب'}
            </h2>
            <div className="flex items-end gap-1 h-8">
              {waveBars.map((bar) => (
                <span
                  key={bar.id}
                  className="w-1.5 rounded-full bg-primary transition-all duration-100"
                  style={{ height: `${bar.height}px` }}
                />
              ))}
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 border border-white/20 text-xs sm:text-sm">
              <span className={`size-2 rounded-full ${hasRemoteParticipant ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
              <span>{hasRemoteParticipant ? 'متصل الآن' : 'بانتظار الاتصال'}</span>
            </div>
          </div>

          <div className="absolute bottom-4 end-4 text-xs bg-black/55 px-2.5 py-1 rounded-full border border-white/15">
            {counterpartName || 'Participant'}
          </div>
        </div>

        <div className="absolute top-5 start-5 w-36 sm:w-44 aspect-video rounded-xl overflow-hidden border border-white/20 bg-black shadow-xl">
          <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          {!isVideoOn ? (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
              <span className="material-symbols-outlined text-white/80">videocam_off</span>
            </div>
          ) : null}
          <div className="absolute bottom-2 start-2 text-[11px] bg-black/60 px-2 py-0.5 rounded-full border border-white/20">
            أنت
          </div>
          {localPulse ? <span className="absolute top-2 end-2 size-2 rounded-full bg-primary animate-ping" /> : null}
        </div>
      </div>

      <div className="absolute bottom-5 inset-x-0 px-4">
        <div className="mx-auto w-fit flex items-center justify-center gap-3 bg-black/55 border border-white/10 rounded-2xl px-3 py-2 backdrop-blur-md">
          <button
            type="button"
            onClick={() => toggleMic()}
            className={`size-12 rounded-full flex items-center justify-center transition-colors ${
              isMicOn ? 'bg-[#3c4043] text-white hover:bg-[#4c5156]' : 'bg-red-600 text-white hover:bg-red-700'
            }`}
            title={isMicOn ? 'كتم الميكروفون' : 'تشغيل الميكروفون'}
          >
            <span className="material-symbols-outlined">{isMicOn ? 'mic' : 'mic_off'}</span>
          </button>
          <button
            type="button"
            onClick={() => toggleVideo()}
            className={`size-12 rounded-full flex items-center justify-center transition-colors ${
              isVideoOn ? 'bg-[#3c4043] text-white hover:bg-[#4c5156]' : 'bg-red-600 text-white hover:bg-red-700'
            }`}
            title={isVideoOn ? 'إيقاف الكاميرا' : 'تشغيل الكاميرا'}
          >
            <span className="material-symbols-outlined">{isVideoOn ? 'videocam' : 'videocam_off'}</span>
          </button>
          <button
            type="button"
            onClick={() => leave()}
            className="h-12 px-5 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold transition-colors"
          >
            إنهاء
          </button>
        </div>
      </div>

      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-xs sm:text-sm bg-black/50 border border-white/10 px-3 py-1.5 rounded-full">
        {error ? `خطأ: ${error}` : hasRemoteParticipant ? 'جودة الاتصال جيدة' : 'جاري الاتصال...'}
      </div>
    </div>
  );
}


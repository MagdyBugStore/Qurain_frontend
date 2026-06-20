'use client'

import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTestRoomWebRTC, type LogEntry, type PeerEntry } from '../../../features/test-room/useTestRoomWebRTC';

// ─── Video tile ───────────────────────────────────────────────────────────────
function VideoTile({
  stream,
  label,
  muted = false,
  state,
}: {
  stream: MediaStream | null;
  label: string;
  muted?: boolean;
  state?: PeerEntry['state'];
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (ref.current && stream) ref.current.srcObject = stream;
  }, [stream]);

  const connColor = !state
    ? 'bg-blue-500'
    : state.connectionState === 'connected'
    ? 'bg-green-500'
    : state.connectionState === 'failed' || state.connectionState === 'disconnected'
    ? 'bg-red-500'
    : 'bg-yellow-500';

  return (
    <div className="relative rounded-xl overflow-hidden bg-gray-900 border border-white/10 aspect-video">
      <video ref={ref} autoPlay playsInline muted={muted} className="w-full h-full object-cover" />
      <div className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-black/60 px-2 py-0.5 rounded-full text-xs text-white">
        <span className={`size-2 rounded-full ${connColor}`} />
        {label}
      </div>
      {state && (
        <div className="absolute top-2 right-2 text-[10px] bg-black/70 px-2 py-1 rounded-lg text-white/80 leading-tight space-y-0.5">
          <div>conn: <span className="text-white">{state.connectionState}</span></div>
          <div>ice: <span className="text-white">{state.iceConnectionState}</span></div>
          <div>sig: <span className="text-white">{state.signalingState}</span></div>
        </div>
      )}
    </div>
  );
}

// ─── Log panel ───────────────────────────────────────────────────────────────
function LogPanel({ logs, onClear }: { logs: LogEntry[]; onClear: () => void }) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    if (autoScroll) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs, autoScroll]);

  const levelColor: Record<LogEntry['level'], string> = {
    info: 'text-gray-300',
    warn: 'text-yellow-400',
    error: 'text-red-400',
    success: 'text-green-400',
  };

  return (
    <div className="flex flex-col h-full bg-gray-950 rounded-xl border border-white/10 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 shrink-0">
        <span className="text-xs font-mono text-gray-400 font-semibold">Debug Console</span>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1 text-xs text-gray-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              className="accent-green-500"
            />
            auto-scroll
          </label>
          <button
            onClick={onClear}
            className="text-xs text-gray-500 hover:text-gray-200 transition-colors"
          >
            clear
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2 font-mono text-[11px] space-y-0.5">
        {logs.length === 0 && (
          <div className="text-gray-600 italic p-2">No logs yet…</div>
        )}
        {logs.map((entry) => (
          <div key={entry.id} className={`flex gap-2 ${levelColor[entry.level]}`}>
            <span className="text-gray-600 shrink-0">{entry.time}</span>
            <span>[TestRoom]</span>
            <span className="break-all">{entry.message}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function TestRoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const effectiveRoomId = roomId || 'debug-room';

  const {
    logs,
    isConnected,
    localStreamReady,
    localStream,
    peers,
    isMicOn,
    isVideoOn,
    join,
    leave,
    toggleMic,
    toggleVideo,
  } = useTestRoomWebRTC(effectiveRoomId);

  const [displayLogs, setDisplayLogs] = useState<LogEntry[]>([]);
  const [hasJoined, setHasJoined] = useState(false);
  const [showLogs, setShowLogs] = useState(true);

  // Mirror hook logs into local state (allows clear)
  useEffect(() => {
    setDisplayLogs(logs);
  }, [logs]);

  const handleJoin = async () => {
    setHasJoined(true);
    await join();
  };

  const handleLeave = () => {
    leave();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col" dir="ltr">
      {/* Header */}
      <header className="border-b border-white/10 px-4 py-3 flex items-center gap-4 shrink-0">
        <div className="flex items-center gap-2">
          <span className={`size-2.5 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-gray-600'}`} />
          <span className="text-sm font-semibold text-white">WebRTC Test Room</span>
        </div>
        <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-sm font-mono">
          <span className="text-gray-400">room:</span>
          <span className="text-green-400">{effectiveRoomId}</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-gray-400">
          <span className="text-gray-600">participants:</span>
          <span className="text-white font-semibold">{peers.length + (localStreamReady ? 1 : 0)}</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-gray-400">
          <span className="text-gray-600">socket:</span>
          <span className={isConnected ? 'text-green-400' : 'text-gray-600'}>
            {isConnected ? 'connected' : 'disconnected'}
          </span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setShowLogs((v) => !v)}
            className="px-3 py-1.5 text-xs bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
          >
            {showLogs ? 'Hide Logs' : 'Show Logs'}
          </button>
          <a
            href={window.location.href}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 text-xs bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
          >
            Open in new tab ↗
          </a>
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Videos area */}
        <div className="flex-1 flex flex-col p-4 gap-4 overflow-y-auto min-w-0">
          {/* Join prompt */}
          {!hasJoined && (
            <div className="flex flex-col items-center justify-center h-full gap-6">
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold">WebRTC Debug Room</h1>
                <p className="text-gray-400 text-sm max-w-md">
                  Open this URL in multiple browser tabs or windows. All users who open the same URL will
                  automatically connect to each other via WebRTC.
                </p>
                <p className="text-gray-500 text-xs font-mono bg-white/5 border border-white/10 rounded-lg px-3 py-2 mt-2 inline-block">
                  {window.location.href}
                </p>
              </div>
              <button
                onClick={handleJoin}
                className="px-8 py-3 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-xl transition-colors text-sm"
              >
                Join Room
              </button>
            </div>
          )}

          {/* Video grid */}
          {hasJoined && (
            <>
              <div
                className={`grid gap-3 ${
                  peers.length === 0
                    ? 'grid-cols-1 max-w-xl mx-auto w-full'
                    : peers.length === 1
                    ? 'grid-cols-1 sm:grid-cols-2'
                    : peers.length <= 3
                    ? 'grid-cols-2'
                    : 'grid-cols-2 sm:grid-cols-3'
                }`}
              >
                {/* Local video */}
                <VideoTile
                  stream={localStream.current}
                  label="You (local)"
                  muted
                />

                {/* Remote peers */}
                {peers.map((peer) => (
                  <VideoTile
                    key={peer.peerId}
                    stream={peer.remoteStream}
                    label={`Peer ${peer.peerId.slice(0, 8)}`}
                    state={peer.state}
                  />
                ))}
              </div>

              {peers.length === 0 && (
                <div className="text-center py-6 text-gray-500 text-sm">
                  Waiting for others to join… Share the URL above to invite participants.
                </div>
              )}
            </>
          )}
        </div>

        {/* Log panel */}
        {showLogs && (
          <div className="w-80 xl:w-96 shrink-0 border-l border-white/10 p-3 flex flex-col overflow-hidden">
            <LogPanel
              logs={displayLogs}
              onClear={() => setDisplayLogs([])}
            />
          </div>
        )}
      </div>

      {/* Controls bar */}
      {hasJoined && (
        <div className="border-t border-white/10 px-4 py-3 flex items-center justify-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => toggleMic()}
            className={`size-11 rounded-full flex items-center justify-center transition-colors ${
              isMicOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'
            }`}
            title={isMicOn ? 'Mute' : 'Unmute'}
          >
            <span className="material-symbols-outlined text-xl">{isMicOn ? 'mic' : 'mic_off'}</span>
          </button>
          <button
            type="button"
            onClick={() => toggleVideo()}
            className={`size-11 rounded-full flex items-center justify-center transition-colors ${
              isVideoOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'
            }`}
            title={isVideoOn ? 'Turn off camera' : 'Turn on camera'}
          >
            <span className="material-symbols-outlined text-xl">{isVideoOn ? 'videocam' : 'videocam_off'}</span>
          </button>
          <button
            type="button"
            onClick={handleLeave}
            className="px-5 h-11 rounded-full bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors"
          >
            Leave
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * useRoom Hook
 * Main hook for room state management
 * NOTE: Firestore removed - this hook is now a placeholder
 */

import { useState, useEffect } from 'react';
import type { RoomState, RoomStatus, ViewMode, WaitingRoomState } from '../../domain/entities/Room';

export function useRoom(sessionId: string | undefined) {
  const [room, setRoom] = useState<RoomState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }

    console.warn('useRoom: Firestore removed, room functionality disabled');
    setRoom(null);
    setLoading(false);
    setError('Room functionality requires backend API - Firestore removed');
  }, [sessionId]);

  const updateStatus = async (
    status: RoomStatus,
    additionalData?: { viewMode?: ViewMode; waitingRoomState?: WaitingRoomState }
  ) => {
    console.warn('useRoom.updateStatus: Firestore removed, operation disabled');
    setError('Room status update requires backend API - Firestore removed');
  };

  return {
    room,
    loading,
    error,
    updateStatus,
  };
}

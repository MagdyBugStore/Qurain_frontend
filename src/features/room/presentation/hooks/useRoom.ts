/**
 * useRoom Hook
 * Main hook for room state management
 */

import { useState, useEffect } from 'react';
import { RoomService } from '../../application/services/roomService';
import { RoomRepository } from '../../../../infrastructure/firebase/repositories/RoomRepository';
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

    const repository = new RoomRepository();
    const service = new RoomService(repository);

    // Initialize room if it doesn't exist
    service
      .initializeRoom(sessionId)
      .then((roomState) => {
        setRoom(roomState);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error initializing room:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize room');
        setLoading(false);
      });

    // Subscribe to room changes
    const unsubscribe = repository.subscribeToRoom(sessionId, (roomState) => {
      setRoom(roomState);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [sessionId]);

  const updateStatus = async (
    status: RoomStatus,
    additionalData?: { viewMode?: ViewMode; waitingRoomState?: WaitingRoomState }
  ) => {
    if (!sessionId) return;

    const repository = new RoomRepository();
    const service = new RoomService(repository);

    try {
      await service.updateRoomStatus(sessionId, status, additionalData);
    } catch (err) {
      console.error('Error updating room status:', err);
      setError(err instanceof Error ? err.message : 'Failed to update room status');
    }
  };

  return {
    room,
    loading,
    error,
    updateStatus,
  };
}

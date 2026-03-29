/**
 * useRoom Hook
 * Main hook for room state management (via backend API)
 */

import { useState, useEffect, useCallback } from 'react';
import type { RoomState, RoomStatus, ViewMode, WaitingRoomState } from '../../domain/entities/Room';
import { RoomService } from '../../../../services/roomService';

export function useRoom(roomId: string | undefined) {
  const [room, setRoom] = useState<RoomState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const service = new RoomService();

    const load = async () => {
      if (!roomId) {
        setLoading(false);
        setError('Missing room id');
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const info = await service.getRoomInfo(roomId);
        if (!active) return;
        // Map minimal backend response to RoomState shape
        const now = new Date();
        const mapped: RoomState = {
          id: info.id,
          sessionId: info.sessionId || roomId,
          status: (info.status as RoomStatus) || 'technical_check',
          participants: Array.isArray(info.participants) ? (info.participants as any) : [],
          createdAt: now,
          updatedAt: now,
        };
        setRoom(mapped);
      } catch (e) {
        if (!active) return;
        const message = e instanceof Error ? e.message : 'Failed to load room info';
        setError(message);
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, [roomId]);

  const updateStatus = useCallback(
    async (
      status: RoomStatus,
      _additionalData?: { viewMode?: ViewMode; waitingRoomState?: WaitingRoomState }
    ) => {
      if (!roomId) {
        setError('Missing room id');
        return;
      }
      try {
        setError(null);
        const service = new RoomService();
        // For now, treat any status change to 'waiting' or 'live' as "join room"
        if (status === 'waiting' || status === 'live' || status === 'technical_check') {
          await service.joinRoom(roomId);
        }
        if (status === 'ended') {
          await service.leaveRoom(roomId);
        }
        // Update local state optimistically
        setRoom((prev) =>
          prev
            ? {
                ...prev,
                status,
                updatedAt: new Date(),
              }
            : prev
        );
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Failed to update room status';
        setError(message);
      }
    },
    [roomId]
  );

  return {
    room,
    loading,
    error,
    updateStatus,
  };
}

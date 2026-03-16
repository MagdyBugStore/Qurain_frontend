/**
 * Room Repository Interface
 * Defines data access operations for room entities
 */

import type { RoomState } from '../entities/Room';

export interface IRoomRepository {
  /**
   * Get room state by session ID
   */
  getRoomBySessionId(sessionId: string): Promise<RoomState | null>;

  /**
   * Create a new room state
   */
  createRoom(room: Omit<RoomState, 'id' | 'createdAt' | 'updatedAt'>): Promise<RoomState>;

  /**
   * Update room state
   */
  updateRoom(roomId: string, updates: Partial<RoomState>): Promise<void>;

  /**
   * Subscribe to room state changes
   */
  subscribeToRoom(
    sessionId: string,
    callback: (room: RoomState | null) => void
  ): () => void;

  /**
   * Update participant state in room
   */
  updateParticipant(
    roomId: string,
    participantId: string,
    updates: Partial<RoomState['participants'][0]>
  ): Promise<void>;
}

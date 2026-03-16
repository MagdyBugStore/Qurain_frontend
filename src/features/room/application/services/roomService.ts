/**
 * Room Service
 * Business logic for room management
 */

import type { IRoomRepository } from '../../domain/interfaces/IRoomRepository';
import type {
  RoomState,
  RoomStatus,
  DeviceCheck,
  TechnicalCheckResult,
  ViewMode,
  WaitingRoomState,
} from '../../domain/entities/Room';

export class RoomService {
  constructor(private repository: IRoomRepository) {}

  /**
   * Get room state for a session
   */
  async getRoomState(sessionId: string): Promise<RoomState | null> {
    return this.repository.getRoomBySessionId(sessionId);
  }

  /**
   * Initialize room for a session
   */
  async initializeRoom(sessionId: string): Promise<RoomState> {
    const existingRoom = await this.repository.getRoomBySessionId(sessionId);
    if (existingRoom) {
      return existingRoom;
    }

    const newRoom: Omit<RoomState, 'id' | 'createdAt' | 'updatedAt'> = {
      sessionId,
      status: 'technical_check',
      participants: [],
    };

    return this.repository.createRoom(newRoom);
  }

  /**
   * Update room status
   */
  async updateRoomStatus(
    sessionId: string,
    status: RoomStatus,
    additionalData?: {
      viewMode?: ViewMode;
      waitingRoomState?: WaitingRoomState;
    }
  ): Promise<void> {
    const room = await this.repository.getRoomBySessionId(sessionId);
    if (!room) {
      throw new Error('Room not found');
    }

    const updates: Partial<RoomState> = {
      status,
      updatedAt: new Date(),
      ...additionalData,
    };

    if (status === 'live' && additionalData?.viewMode) {
      updates.viewMode = additionalData.viewMode;
    }

    if (status === 'waiting' && additionalData?.waitingRoomState) {
      updates.waitingRoomState = additionalData.waitingRoomState;
    }

    await this.repository.updateRoom(room.id, updates);
  }

  /**
   * Save technical check results
   */
  async saveTechnicalCheck(
    sessionId: string,
    checkResult: TechnicalCheckResult
  ): Promise<void> {
    const room = await this.repository.getRoomBySessionId(sessionId);
    if (!room) {
      throw new Error('Room not found');
    }

    const deviceCheck: DeviceCheck = {
      camera: checkResult.camera,
      microphone: checkResult.microphone,
      internet: checkResult.internet,
      cameraDevice: checkResult.cameraDevice,
      microphoneDevice: checkResult.microphoneDevice,
      internetSpeed: checkResult.internetSpeed,
    };

    const updates: Partial<RoomState> = {
      deviceCheck,
      status: checkResult.allPassed ? 'waiting' : 'technical_check',
      updatedAt: new Date(),
    };

    await this.repository.updateRoom(room.id, updates);
  }

  /**
   * Add participant to room
   */
  async addParticipant(
    sessionId: string,
    participant: RoomState['participants'][0]
  ): Promise<void> {
    const room = await this.repository.getRoomBySessionId(sessionId);
    if (!room) {
      throw new Error('Room not found');
    }

    const updatedParticipants = [...room.participants, participant];
    await this.repository.updateRoom(room.id, {
      participants: updatedParticipants,
      updatedAt: new Date(),
    });
  }

  /**
   * Update participant state
   */
  async updateParticipantState(
    sessionId: string,
    participantId: string,
    updates: Partial<RoomState['participants'][0]>
  ): Promise<void> {
    const room = await this.repository.getRoomBySessionId(sessionId);
    if (!room) {
      throw new Error('Room not found');
    }

    await this.repository.updateParticipant(room.id, participantId, updates);
  }

  /**
   * Start live session
   */
  async startLiveSession(sessionId: string, viewMode: ViewMode = 'whiteboard'): Promise<void> {
    await this.updateRoomStatus(sessionId, 'live', { viewMode });
  }

  /**
   * End session
   */
  async endSession(sessionId: string): Promise<void> {
    await this.updateRoomStatus(sessionId, 'ended');
  }
}

/**
 * Room Repository Implementation
 * Firebase implementation of IRoomRepository
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { COLLECTIONS } from '../../../constants/firebaseCollections';
import type { IRoomRepository } from '../../../features/room/domain/interfaces/IRoomRepository';
import type { RoomState } from '../../../features/room/domain/entities/Room';

export class RoomRepository implements IRoomRepository {
  private getCollection() {
    return collection(db, COLLECTIONS.SESSIONS);
  }

  async getRoomBySessionId(sessionId: string): Promise<RoomState | null> {
    try {
      const sessionRef = doc(db, COLLECTIONS.SESSIONS, sessionId);
      const sessionDoc = await getDoc(sessionRef);

      if (!sessionDoc.exists()) {
        return null;
      }

      const sessionData = sessionDoc.data();
      
      // Room state is stored as part of session document
      // In a real implementation, you might have a separate rooms collection
      if (sessionData.roomState) {
        return {
          id: sessionId,
          ...sessionData.roomState,
          createdAt: sessionData.roomState.createdAt?.toDate() || new Date(),
          updatedAt: sessionData.roomState.updatedAt?.toDate() || new Date(),
        } as RoomState;
      }

      return null;
    } catch (error) {
      console.error('Error getting room by session ID:', error);
      throw error;
    }
  }

  async createRoom(room: Omit<RoomState, 'id' | 'createdAt' | 'updatedAt'>): Promise<RoomState> {
    try {
      const sessionRef = doc(db, COLLECTIONS.SESSIONS, room.sessionId);
      const sessionDoc = await getDoc(sessionRef);

      if (!sessionDoc.exists()) {
        throw new Error('Session not found');
      }

      const roomState: RoomState = {
        id: room.sessionId,
        ...room,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await updateDoc(sessionRef, {
        roomState: {
          ...roomState,
          createdAt: Timestamp.fromDate(roomState.createdAt),
          updatedAt: Timestamp.fromDate(roomState.updatedAt),
        },
      });

      return roomState;
    } catch (error) {
      console.error('Error creating room:', error);
      throw error;
    }
  }

  async updateRoom(roomId: string, updates: Partial<RoomState>): Promise<void> {
    try {
      const sessionRef = doc(db, COLLECTIONS.SESSIONS, roomId);
      
      const updateData: any = {
        'roomState.updatedAt': serverTimestamp(),
      };

      if (updates.status !== undefined) {
        updateData['roomState.status'] = updates.status;
      }
      if (updates.viewMode !== undefined) {
        updateData['roomState.viewMode'] = updates.viewMode;
      }
      if (updates.waitingRoomState !== undefined) {
        updateData['roomState.waitingRoomState'] = updates.waitingRoomState;
      }
      if (updates.deviceCheck !== undefined) {
        updateData['roomState.deviceCheck'] = updates.deviceCheck;
      }
      if (updates.participants !== undefined) {
        updateData['roomState.participants'] = updates.participants;
      }
      if (updates.startTime !== undefined) {
        updateData['roomState.startTime'] = Timestamp.fromDate(updates.startTime);
      }
      if (updates.endTime !== undefined) {
        updateData['roomState.endTime'] = Timestamp.fromDate(updates.endTime);
      }

      await updateDoc(sessionRef, updateData);
    } catch (error) {
      console.error('Error updating room:', error);
      throw error;
    }
  }

  subscribeToRoom(
    sessionId: string,
    callback: (room: RoomState | null) => void
  ): () => void {
    const sessionRef = doc(db, COLLECTIONS.SESSIONS, sessionId);

    return onSnapshot(
      sessionRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          callback(null);
          return;
        }

        const sessionData = snapshot.data();
        if (sessionData.roomState) {
          const roomState: RoomState = {
            id: sessionId,
            ...sessionData.roomState,
            createdAt: sessionData.roomState.createdAt?.toDate() || new Date(),
            updatedAt: sessionData.roomState.updatedAt?.toDate() || new Date(),
          };
          callback(roomState);
        } else {
          callback(null);
        }
      },
      (error) => {
        console.error('Error subscribing to room:', error);
        callback(null);
      }
    );
  }

  async updateParticipant(
    roomId: string,
    participantId: string,
    updates: Partial<RoomState['participants'][0]>
  ): Promise<void> {
    try {
      const room = await this.getRoomBySessionId(roomId);
      if (!room) {
        throw new Error('Room not found');
      }

      const updatedParticipants = room.participants.map((p) =>
        p.id === participantId ? { ...p, ...updates } : p
      );

      await this.updateRoom(roomId, { participants: updatedParticipants });
    } catch (error) {
      console.error('Error updating participant:', error);
      throw error;
    }
  }
}

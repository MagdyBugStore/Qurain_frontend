/**
 * Room Domain Entity
 * Represents a video session room state
 */

export type RoomStatus = 'technical_check' | 'waiting' | 'live' | 'ended';
export type CheckStatus = 'checking' | 'passed' | 'failed';
export type ViewMode = 'mushaf' | 'whiteboard';
export type WaitingRoomState = 'default' | 'tutor_late';

export interface DeviceCheck {
  camera: CheckStatus;
  microphone: CheckStatus;
  internet: CheckStatus;
  cameraDevice?: string;
  microphoneDevice?: string;
  internetSpeed?: number; // Mbps
}

export interface RoomParticipant {
  id: string;
  name: string;
  photo?: string;
  isMuted: boolean;
  isVideoOff: boolean;
  isOnline: boolean;
  role: 'student' | 'teacher';
}

export interface RoomState {
  id: string;
  sessionId: string;
  status: RoomStatus;
  viewMode?: ViewMode;
  deviceCheck?: DeviceCheck;
  waitingRoomState?: WaitingRoomState;
  participants: RoomParticipant[];
  startTime?: Date;
  endTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface TechnicalCheckResult {
  camera: CheckStatus;
  microphone: CheckStatus;
  internet: CheckStatus;
  cameraDevice?: string;
  microphoneDevice?: string;
  internetSpeed?: number;
  allPassed: boolean;
}

/**
 * Room Feature Public API
 * Exports all public interfaces, types, and components
 */

// Domain
export type {
  RoomStatus,
  CheckStatus,
  ViewMode,
  WaitingRoomState,
  DeviceCheck,
  RoomParticipant,
  RoomState,
  TechnicalCheckResult,
} from './domain/entities/Room';

export type { IRoomRepository } from './domain/interfaces/IRoomRepository';

// Application
export { RoomService } from './application/services/roomService';
export { DeviceCheckService } from './application/services/deviceCheckService';

// Presentation
export { useRoom } from './presentation/hooks/useRoom';
export { useDeviceCheck } from './presentation/hooks/useDeviceCheck';
export { TechnicalCheck } from './presentation/components/TechnicalCheck/TechnicalCheck';

// Infrastructure
// NOTE: RoomRepository removed (Firestore removed)

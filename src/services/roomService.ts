import { apiClient } from '../lib/apiClient';

type JoinResponse = {
  room: {
    id: string;
    joinToken?: string;
    joinUrl?: string;
  };
};

type GetInfoResponse = {
  room: {
    id: string;
    sessionId?: string;
    participants?: unknown[];
    status?: string;
    title?: string;
  };
};

type CreateRoomBody = {
  sessionId: string;
  title?: string;
};

export class RoomService {
  async createRoom(sessionId: string, title?: string) {
    const data = await apiClient.post<GetInfoResponse>('/rooms/create', {
      sessionId,
      title,
    } as CreateRoomBody);
    return data.room;
  }

  async getRoomInfo(roomId: string) {
    const data = await apiClient.get<GetInfoResponse>(`/rooms/${encodeURIComponent(roomId)}`);
    return data.room;
  }

  async joinRoom(roomId: string) {
    const data = await apiClient.post<JoinResponse>(`/rooms/${encodeURIComponent(roomId)}/join`);
    return data.room;
  }

  async leaveRoom(roomId: string) {
    await apiClient.post(`/rooms/${encodeURIComponent(roomId)}/leave`);
  }
}


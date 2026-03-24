import { apiClient } from '../lib/apiClient';
import type { UserProfile } from '../models/UserModel';

interface GetMeResponse {
  user: {
    id: string;
    email: string;
    phone?: string;
    fullName?: string;
    role: 'student' | 'teacher' | 'admin';
    preferredLanguage?: string;
    avatar?: string;
    goals?: string[];
    ageGroup?: string | null;
    level?: string | null;
    learningGoal?: string[];
    completed?: boolean;
    profileCompletedAt?: string | null;
  };
}

export const userApi = {
  async getMe(): Promise<GetMeResponse['user']> {
    const data = await apiClient.get<GetMeResponse>('/users/me');
    return data.user;
  },

  async updateMe(updates: Partial<UserProfile>): Promise<GetMeResponse['user']> {
    const data = await apiClient.patch<GetMeResponse>('/users/me', updates);
    return data.user;
  },
};


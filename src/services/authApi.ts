import { apiClient, setToken } from '../lib/apiClient';

interface AuthUser {
  id: string;
  email: string;
  phone?: string;
  fullName?: string;
  role: 'student' | 'teacher' | 'admin';
}

interface AuthResponse {
  user: AuthUser;
  token: string;
}

export const authApi = {
  async login(emailOrPhone: string, password: string): Promise<AuthUser> {
    const data = await apiClient.post<AuthResponse>('/auth/login', {
      email: emailOrPhone,
      password,
    });
    setToken(data.token);
    return data.user;
  },

  async loginWithGoogle(payload: {
    email: string;
    fullName?: string;
    photoURL?: string | null;
  }): Promise<AuthUser> {
    const data = await apiClient.post<AuthResponse>('/auth/login/google', payload);
    setToken(data.token);
    return data.user;
  },

  async registerStudent(payload: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
  }): Promise<AuthUser> {
    const data = await apiClient.post<AuthResponse>('/auth/register-student', payload);
    setToken(data.token);
    return data.user;
  },

  async registerTeacher(payload: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
  }): Promise<AuthUser> {
    const data = await apiClient.post<AuthResponse>('/auth/register-teacher', payload);
    setToken(data.token);
    return data.user;
  },

  logout() {
    setToken(null);
  },
};


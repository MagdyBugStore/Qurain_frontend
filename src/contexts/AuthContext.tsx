import React from 'react';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { authApi } from '../services/authApi';
import { loadTokenFromStorage } from '../lib/apiClient';
import { userApi } from '../services/userApi';
import { useUserStore } from '../store/useUserStore';
import type { UserProfile } from '../models/UserModel';
import { isProfileComplete } from '../models/UserModel';

interface BackendUser {
  id: string;
  email: string;
  avatar: string;
  role: 'student' | 'teacher' | 'admin';
  fullName?: string;
}

interface AuthContextType {
  user: BackendUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  login: (emailOrPhone: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  saveUserProfile: (profile: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<BackendUser | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Use user store for profile management
  const { 
    userProfile, 
    fetchUserProfile, 
    saveUserProfile: saveProfileToStore,
    subscribeToUserProfile,
    clearUserProfile 
  } = useUserStore();

  // Initialize from stored JWT token and backend user
  useEffect(() => {
    const init = async () => {
      try {
        const existingToken = loadTokenFromStorage();
        
        if (!existingToken) {
          clearUserProfile();
          setUser(null);
          setLoading(false);
          return;
        }

        const backendUser = await userApi.getMe();
        
        setUser({
          id: backendUser.id,
          email: backendUser.email,
          role: backendUser.role,
          fullName: backendUser.fullName,
          // avatar قد لا يكون معرفاً في نوع AuthUser، لذلك نستخدم any هنا لتفادي خطأ الـ type
          avatar: (backendUser as any).avatar || '',
        });
        await fetchUserProfile();
      } catch (error) {
        console.error('Error initializing auth:', error);
        
        clearUserProfile();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    void init();
  }, [fetchUserProfile, clearUserProfile]);

  // ملاحظة:
  // منطق إعادة التوجيه في حالة عدم اكتمال الملف الشخصي تم نقله إلى الصفحات/الهوكس
  // لتجنّب استخدام window.location المباشر داخل الـ Context

  const login = async (emailOrPhone: string, password: string) => {
    setLoading(true);
    try {
      const backendUser = await authApi.login(emailOrPhone, password);
      
      setUser({
        id: backendUser.id,
        email: backendUser.email,
        role: backendUser.role,
        fullName: backendUser.fullName,
        avatar: (backendUser as any).avatar || '',
      });
      await fetchUserProfile();
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    authApi.logout();
    clearUserProfile();
    setUser(null);
  };

  const saveUserProfile = async (profile: Partial<UserProfile>) => {
    if (!user) {
      throw new Error('User must be authenticated to save profile');
    }
    await saveProfileToStore(profile);
  };

  const value = {
    user,
    userProfile,
    loading,
    login,
    logout,
    saveUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    // During Vite HMR, hooks can run in a brief window before providers remount.
    // Return a safe fallback in dev to avoid crashing the app during refresh.
    const isLikelyDevHost =
      typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1');

    if (isLikelyDevHost) {
      return {
        user: null,
        userProfile: null,
        loading: true,
        login: async () => {
          throw new Error('AuthProvider not ready yet');
        },
        logout: async () => {
          throw new Error('AuthProvider not ready yet');
        },
        saveUserProfile: async () => {
          throw new Error('AuthProvider not ready yet');
        },
      } satisfies AuthContextType;
    }
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

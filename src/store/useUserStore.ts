import { create } from 'zustand';
import { userApi } from '../services/userApi';
import { UserProfile, isProfileComplete } from '../models/UserModel';

interface UserStoreState {
  // State - الحالة
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  
  // Actions - الإجراءات
  fetchUserProfile: () => Promise<void>;
  saveUserProfile: (profile: Partial<UserProfile>) => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  // لا يوجد اشتراك لحظي الآن؛ يمكن إضافة WebSocket أو polling لاحقاً
  subscribeToUserProfile: () => (() => void) | null;
  clearUserProfile: () => void;
  isProfileComplete: () => boolean;
}

export const useUserStore = create<UserStoreState>((set, get) => ({
  // Initial state - الحالة الأولية
  userProfile: null,
  loading: false,
  error: null,

  /**
  * Fetch user profile from backend
  * جلب ملف المستخدم من الـ Backend
  */
  fetchUserProfile: async () => {
    set({ loading: true, error: null });
    
    try {
      const backendUser = await userApi.getMe();
      const currentProfile = get().userProfile;

      const profile: UserProfile = {
        ...(currentProfile || {}),
        uid: backendUser.id,
        email: backendUser.email,
        firstName: backendUser.fullName?.split(' ')[0] || '',
        lastName: backendUser.fullName?.split(' ').slice(1).join(' ') || '',
        displayName: backendUser.fullName,
        photoURL: backendUser.avatar,
        accountType: backendUser.role,
        goals: backendUser.goals || currentProfile?.goals || [],
        ageGroup: backendUser.ageGroup ?? currentProfile?.ageGroup ?? null,
        level: backendUser.level ?? currentProfile?.level ?? null,
        learningGoal: backendUser.learningGoal || currentProfile?.learningGoal || [],
        completed: backendUser.completed ?? currentProfile?.completed ?? false,
        profileCompletedAt:
          backendUser.profileCompletedAt ?? currentProfile?.profileCompletedAt ?? undefined,
        createdAt: undefined,
        updatedAt: undefined,
      };

      set({
        userProfile: profile,
        loading: false,
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      set({ 
        error: (error as Error).message || 'Failed to fetch user profile',
        loading: false 
      });
    }
  },

  /**
  * Save user profile to backend
  * حفظ ملف المستخدم في الـ Backend
  */
  saveUserProfile: async (profile: Partial<UserProfile>) => {
    set({ loading: true, error: null });
    
    try {
      const currentProfile = get().userProfile;

      const merged: UserProfile = {
        ...(currentProfile || {
          uid: '',
          email: '',
          firstName: '',
          lastName: '',
          accountType: null,
        }),
        ...profile,
      };

      const updatedBackendUser = await userApi.updateMe(merged);

      const normalized: UserProfile = {
        ...(currentProfile || {}),
        ...profile,
        uid: updatedBackendUser.id,
        email: updatedBackendUser.email,
        firstName: updatedBackendUser.fullName?.split(' ')[0] || '',
        lastName: updatedBackendUser.fullName?.split(' ').slice(1).join(' ') || '',
        displayName: updatedBackendUser.fullName,
        photoURL: updatedBackendUser.avatar,
        accountType: updatedBackendUser.role,
        goals: updatedBackendUser.goals || merged.goals || currentProfile?.goals || [],
        ageGroup: updatedBackendUser.ageGroup ?? merged.ageGroup ?? currentProfile?.ageGroup ?? null,
        level: updatedBackendUser.level ?? merged.level ?? currentProfile?.level ?? null,
        learningGoal:
          updatedBackendUser.learningGoal ||
          merged.learningGoal ||
          currentProfile?.learningGoal ||
          [],
        completed: updatedBackendUser.completed ?? merged.completed ?? currentProfile?.completed ?? false,
        profileCompletedAt:
          updatedBackendUser.profileCompletedAt ??
          merged.profileCompletedAt ??
          currentProfile?.profileCompletedAt ??
          undefined,
      };

      set({ 
        userProfile: normalized,
        loading: false 
      });
    } catch (error) {
      console.error('Error saving user profile:', error);
      set({ 
        error: (error as Error).message || 'Failed to save user profile',
        loading: false 
      });
      throw error;
    }
  },

  /**
  * Update user profile in backend
  * تحديث ملف المستخدم في الـ Backend
  */
  updateUserProfile: async (updates: Partial<UserProfile>) => {
    set({ loading: true, error: null });
    
    try {
      const currentProfile = get().userProfile;
      const updatedBackendUser = await userApi.updateMe(updates);

      const normalized: UserProfile = {
        ...(currentProfile || {}),
        ...updates,
        uid: updatedBackendUser.id,
        email: updatedBackendUser.email,
        firstName: updatedBackendUser.fullName?.split(' ')[0] || '',
        lastName: updatedBackendUser.fullName?.split(' ').slice(1).join(' ') || '',
        displayName: updatedBackendUser.fullName,
        photoURL: updatedBackendUser.avatar,
        accountType: updatedBackendUser.role,
        goals: updatedBackendUser.goals || currentProfile?.goals || [],
        ageGroup: updatedBackendUser.ageGroup ?? currentProfile?.ageGroup ?? null,
        level: updatedBackendUser.level ?? currentProfile?.level ?? null,
        learningGoal: updatedBackendUser.learningGoal || currentProfile?.learningGoal || [],
        completed: updatedBackendUser.completed ?? currentProfile?.completed ?? false,
        profileCompletedAt:
          updatedBackendUser.profileCompletedAt ?? currentProfile?.profileCompletedAt ?? undefined,
      };

      set({
        userProfile: normalized,
        loading: false,
      });
    } catch (error) {
      console.error('Error updating user profile:', error);
      set({ 
        error: (error as Error).message || 'Failed to update user profile',
        loading: false 
      });
      throw error;
    }
  },

  /**
  * Subscribe to real-time updates of user profile
  * حالياً غير مدعوم؛ نعيد دالة إلغاء فارغة
  */
  subscribeToUserProfile: () => {
    return () => {};
  },

  /**
   * Clear user profile from store
   * مسح ملف المستخدم من المتجر
   */
  clearUserProfile: () => {
    set({ 
      userProfile: null,
      error: null,
      loading: false 
    });
  },

  /**
   * Check if current user profile is complete
   * التحقق من اكتمال ملف المستخدم الحالي
   */
  isProfileComplete: () => {
    const profile = get().userProfile;
    return isProfileComplete(profile);
  },
}));

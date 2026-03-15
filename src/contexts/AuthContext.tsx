import React from "react";
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { 
  signInWithPopup, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User
} from 'firebase/auth';
import { auth, googleProvider, appleProvider } from '../config/firebase';
import { TeacherService } from '../services/teacherService';
import { useUserStore } from '../store/useUserStore';
import type { UserProfile } from '../models/UserModel';
import { isProfileComplete } from '../models/UserModel';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<User>;
  signInWithApple: () => Promise<User>;
  signOut: () => Promise<void>;
  saveUserProfile: (profile: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Use user store for profile management
  const { 
    userProfile, 
    fetchUserProfile, 
    saveUserProfile: saveProfileToStore,
    subscribeToUserProfile,
    clearUserProfile 
  } = useUserStore();

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Subscribe to real-time profile updates
        // الاشتراك في التحديثات الفورية للملف
        unsubscribeProfile = subscribeToUserProfile(currentUser);
        
        // Also fetch profile once to ensure it's loaded
        // أيضاً جلب الملف مرة واحدة للتأكد من تحميله
        try {
          await fetchUserProfile(currentUser);
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        // Clear profile when user signs out
        // مسح الملف عند تسجيل الخروج
        if (unsubscribeProfile) {
          unsubscribeProfile();
          unsubscribeProfile = null;
        }
        clearUserProfile();
      }
      
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) {
        unsubscribeProfile();
      }
    };
  }, [fetchUserProfile, subscribeToUserProfile, clearUserProfile]);

  // Check if user has profile data and redirect if incomplete
  // التحقق من وجود بيانات المستخدم وإعادة التوجيه إذا كانت غير مكتملة
  useEffect(() => {
    if (!user || loading) return;

    // Check if user has profile data in Firebase
    // التحقق من وجود بيانات المستخدم في Firebase
    if (!userProfile || !isProfileComplete(userProfile)) {
      // Get current path to avoid redirect loop
      // الحصول على المسار الحالي لتجنب حلقة إعادة التوجيه
      const currentPath = window.location.pathname;
      
      // Only redirect if not already on personal-info, login, teacher-application, teachers, or profile pages
      // إعادة التوجيه فقط إذا لم يكن المستخدم في صفحة personal-info أو login أو teacher-application أو صفحات المعلمين/البروفايل بالفعل
      if (
        currentPath !== '/personal-info' && 
        currentPath !== '/login' && 
        !currentPath.startsWith('/teacher-application') &&
        !currentPath.startsWith('/student-profile') &&
        !currentPath.startsWith('/teacher-profile') &&
        !currentPath.startsWith('/profile') &&
        // Allow public teachers listing and detail pages without forcing profile completion
        !currentPath.startsWith('/teachers')
      ) {
        // Check if user is a teacher and has submitted application
        // التحقق من أن المستخدم معلم وقد أرسل طلب
        const checkTeacherApplication = async () => {
          if (userProfile?.accountType === 'teacher') {
            try {
              // Check if user has submitted a teacher application
              // التحقق من أن المستخدم قد أرسل طلب معلم
              const teacherService = new TeacherService();
              const application = await teacherService.getTeacherApplication(user.uid);
              
              if (!application) {
                // No application found, redirect to teacher application
                // لم يتم العثور على طلب، إعادة التوجيه إلى صفحة طلب المعلم
                window.location.href = '/teacher-application';
                return;
              }
            } catch (error) {
              console.error('Error checking teacher application:', error);
              // On error, still redirect to teacher application
              // في حالة الخطأ، إعادة التوجيه إلى صفحة طلب المعلم
              window.location.href = '/teacher-application';
              return;
            }
          }
          
          // For students or if teacher has submitted application, redirect to personal-info
          // للطلاب أو إذا كان المعلم قد أرسل الطلب، إعادة التوجيه إلى personal-info
          window.location.href = '/personal-info';
        };
        
        checkTeacherApplication();
      }
    }
  }, [user, userProfile, loading]);

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (error) {
      console.error('Google sign-in error:', error);
      throw error;
    }
  };

  const signInWithApple = async () => {
    try {
      const result = await signInWithPopup(auth, appleProvider);
      return result.user;
    } catch (error) {
      console.error('Apple sign-in error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      clearUserProfile();
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const saveUserProfile = async (profile: Partial<UserProfile>) => {
    if (user) {
      await saveProfileToStore(user, profile);
    } else {
      throw new Error('User must be authenticated to save profile');
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    signInWithGoogle,
    signInWithApple,
    signOut,
    saveUserProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

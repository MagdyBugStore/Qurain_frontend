/**
 * Firebase User Store - متجر بيانات المستخدم من Firestore
 * يدير جميع عمليات قراءة وكتابة بيانات المستخدم من/إلى Firestore
 */

import { create } from 'zustand';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  onSnapshot,
  type DocumentData,
  type FirestoreError
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { UserProfile, createDefaultUserProfile, isProfileComplete } from '../models/UserModel';
import type { User } from 'firebase/auth';

interface UserStoreState {
  // State - الحالة
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  
  // Actions - الإجراءات
  fetchUserProfile: (user: User) => Promise<void>;
  saveUserProfile: (user: User, profile: Partial<UserProfile>) => Promise<void>;
  updateUserProfile: (user: User, updates: Partial<UserProfile>) => Promise<void>;
  subscribeToUserProfile: (user: User) => (() => void) | null;
  clearUserProfile: () => void;
  isProfileComplete: () => boolean;
}

export const useUserStore = create<UserStoreState>((set, get) => ({
  // Initial state - الحالة الأولية
  userProfile: null,
  loading: false,
  error: null,

  /**
   * Fetch user profile from Firestore
   * جلب ملف المستخدم من Firestore
   */
  fetchUserProfile: async (user: User) => {
    set({ loading: true, error: null });
    
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);
      
      if (userDocSnap.exists()) {
        const data = userDocSnap.data() as UserProfile;
        
        // Update old accounts: sync photoURL and displayName from Firebase Auth if missing
        // تحديث الحسابات القديمة: مزامنة photoURL و displayName من Firebase Auth إذا كانت مفقودة
        const needsUpdate = 
          (!data.photoURL && user.photoURL) || 
          (!data.displayName && user.displayName) ||
          (data.photoURL !== user.photoURL && user.photoURL) ||
          (data.displayName !== user.displayName && user.displayName);
        
        if (needsUpdate) {
          const updates: Partial<UserProfile> = {
            ...(user.photoURL && { photoURL: user.photoURL }),
            ...(user.displayName && { displayName: user.displayName }),
            updatedAt: new Date(),
          };
          
          await updateDoc(userDocRef, updates);
          
          set({ 
            userProfile: {
              ...data,
              ...updates,
              uid: user.uid,
            },
            loading: false 
          });
        } else {
          set({ 
            userProfile: {
              ...data,
              uid: user.uid,
            },
            loading: false 
          });
        }
      } else {
        // Create default profile if doesn't exist
        // إنشاء ملف افتراضي إذا لم يكن موجوداً
        const defaultProfile = createDefaultUserProfile(
          user.uid,
          user.email || '',
          user.displayName || undefined
        );
        
        // Include photoURL from Firebase Auth
        // تضمين photoURL من Firebase Auth
        if (user.photoURL) {
          defaultProfile.photoURL = user.photoURL;
        }
        
        await setDoc(userDocRef, defaultProfile);
        set({ 
          userProfile: defaultProfile,
          loading: false 
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      set({ 
        error: (error as FirestoreError).message || 'Failed to fetch user profile',
        loading: false 
      });
    }
  },

  /**
   * Save user profile to Firestore (create or update)
   * حفظ ملف المستخدم في Firestore (إنشاء أو تحديث)
   */
  saveUserProfile: async (user: User, profile: Partial<UserProfile>) => {
    set({ loading: true, error: null });
    
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const currentProfile = get().userProfile;
      
      const profileData: UserProfile = {
        ...currentProfile,
        ...profile,
        uid: user.uid,
        email: user.email || profile.email || currentProfile?.email || '',
        // Always sync photoURL and displayName from Firebase Auth if available
        // دائماً مزامنة photoURL و displayName من Firebase Auth إذا كانت متاحة
        ...(user.photoURL && { photoURL: user.photoURL }),
        ...(user.displayName && { displayName: user.displayName }),
        updatedAt: new Date(),
      } as UserProfile;
      
      // If profile doesn't exist, create it
      // إذا لم يكن الملف موجوداً، قم بإنشائه
      if (!currentProfile) {
        profileData.createdAt = new Date();
        await setDoc(userDocRef, profileData);
      } else {
        // Otherwise, update it
        // وإلا، قم بتحديثه
        await updateDoc(userDocRef, profileData);
      }
      
      set({ 
        userProfile: profileData,
        loading: false 
      });
    } catch (error) {
      console.error('Error saving user profile:', error);
      set({ 
        error: (error as FirestoreError).message || 'Failed to save user profile',
        loading: false 
      });
      throw error;
    }
  },

  /**
   * Update user profile in Firestore
   * تحديث ملف المستخدم في Firestore
   */
  updateUserProfile: async (user: User, updates: Partial<UserProfile>) => {
    set({ loading: true, error: null });
    
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const updateData = {
        ...updates,
        updatedAt: new Date(),
      };
      
      await updateDoc(userDocRef, updateData);
      
      const currentProfile = get().userProfile;
      set({ 
        userProfile: currentProfile ? { ...currentProfile, ...updateData } : null,
        loading: false 
      });
    } catch (error) {
      console.error('Error updating user profile:', error);
      set({ 
        error: (error as FirestoreError).message || 'Failed to update user profile',
        loading: false 
      });
      throw error;
    }
  },

  /**
   * Subscribe to real-time updates of user profile
   * الاشتراك في التحديثات الفورية لملف المستخدم
   */
  subscribeToUserProfile: (user: User) => {
    try {
      const userDocRef = doc(db, 'users', user.uid);
      
      const unsubscribe = onSnapshot(
        userDocRef,
        async (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile;
            
            // Update old accounts: sync photoURL and displayName from Firebase Auth if missing
            // تحديث الحسابات القديمة: مزامنة photoURL و displayName من Firebase Auth إذا كانت مفقودة
            const needsUpdate = 
              (!data.photoURL && user.photoURL) || 
              (!data.displayName && user.displayName) ||
              (data.photoURL !== user.photoURL && user.photoURL) ||
              (data.displayName !== user.displayName && user.displayName);
            
            if (needsUpdate) {
              const updates: Partial<UserProfile> = {
                ...(user.photoURL && { photoURL: user.photoURL }),
                ...(user.displayName && { displayName: user.displayName }),
                updatedAt: new Date(),
              };
              
              try {
                await updateDoc(userDocRef, updates);
              } catch (updateError) {
                console.error('Error updating profile in subscription:', updateError);
              }
            }
            
            set({ 
              userProfile: {
                ...data,
                ...(needsUpdate && {
                  ...(user.photoURL && { photoURL: user.photoURL }),
                  ...(user.displayName && { displayName: user.displayName }),
                }),
                uid: user.uid,
              },
              loading: false 
            });
          } else {
            // Create default profile if doesn't exist
            // إنشاء ملف افتراضي إذا لم يكن موجوداً
            const defaultProfile = createDefaultUserProfile(
              user.uid,
              user.email || '',
              user.displayName || undefined
            );
            
            // Include photoURL from Firebase Auth
            // تضمين photoURL من Firebase Auth
            if (user.photoURL) {
              defaultProfile.photoURL = user.photoURL;
            }
            
            setDoc(userDocRef, defaultProfile).then(() => {
              set({ 
                userProfile: defaultProfile,
                loading: false 
              });
            });
          }
        },
        (error) => {
          console.error('Error in user profile subscription:', error);
          set({ 
            error: error.message || 'Failed to subscribe to user profile',
            loading: false 
          });
        }
      );
      
      return unsubscribe;
    } catch (error) {
      console.error('Error setting up user profile subscription:', error);
      set({ 
        error: (error as Error).message || 'Failed to set up subscription',
        loading: false 
      });
      return null;
    }
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

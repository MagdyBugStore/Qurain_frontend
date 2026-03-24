/**
 * User Model - نموذج بيانات المستخدم
 * يحتوي على جميع الحقول المطلوبة لملف المستخدم
 */

import type { TeacherApplication } from '../shared/types/teacher.types';

export type AccountType = 'student' | 'teacher' | 'admin' | null;

export interface UserProfile {
  // Basic Information - المعلومات الأساسية
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  photoURL?: string;
  // Backend role (student / teacher / admin) - دور المستخدم في نظام Qurain
  role?: 'student' | 'teacher' | 'admin';
  
  // Account Type - نوع الحساب
  accountType: AccountType;
  
  // Student Profile Data - بيانات ملف الطالب
  goals?: string[]; // الأهداف التعليمية
  ageGroup?: string | null; // الفئة العمرية
  level?: string | null; // المستوى
  learningGoal?: string[]; // الأهداف التعليمية (يمكن اختيار أكثر من هدف)
  
  // Profile Completion Status - حالة اكتمال الملف
  completed?: boolean; // هل تم اكتمال الملف
  profileCompletedAt?: Date | string; // تاريخ اكتمال الملف
  
  // Timestamps - الطوابع الزمنية
  createdAt?: Date | string;
  updatedAt?: Date | string;
  
  // Additional fields - حقول إضافية
  [key: string]: any;
}

/**
 * Helper function to check if user profile is complete
 * دالة مساعدة للتحقق من اكتمال ملف المستخدم
 * 
 * @param profile - User profile data
 * @param teacherApplication - Optional teacher application data (required for teachers to be fully complete)
 */
export function isProfileComplete(
  profile: UserProfile | null,
  teacherApplication?: TeacherApplication | null
): boolean {
  if (!profile) return false;

  // Explicit completion flag should always short-circuit completion checks.
  if (profile.completed === true) return true;
  
  // Check if required fields are filled
  // التحقق من وجود الحقول المطلوبة
  if (profile.accountType === 'student') {
    return !!(
      profile.firstName &&
      profile.lastName &&
      profile.email &&
      profile.goals &&
      profile.goals.length > 0 &&
      profile.ageGroup &&
      profile.level
    );
  }
  
  if (profile.accountType === 'teacher') {
    // Basic profile fields
    const hasBasicInfo = !!(
      profile.firstName &&
      profile.lastName &&
      profile.email
    );
    
    if (!hasBasicInfo) return false;
    
    // If teacherApplication is provided, check all required teacher fields
    if (teacherApplication) {
      return !!(
        teacherApplication.fullName &&
        teacherApplication.email &&
        teacherApplication.phone &&
        teacherApplication.countryCode &&
        teacherApplication.gender &&
        teacherApplication.nationality &&
        teacherApplication.yearsOfExperience !== undefined &&
        teacherApplication.yearsOfExperience >= 0 &&
        teacherApplication.educationLevel &&
        teacherApplication.bio &&
        teacherApplication.bio.trim().length >= 30 && // Bio must be at least 30 characters
        teacherApplication.subjects &&
        teacherApplication.subjects.length > 0 &&
        teacherApplication.hourlyRate &&
        teacherApplication.hourlyRate > 0 &&
        teacherApplication.currency &&
        teacherApplication.languages &&
        teacherApplication.languages.length > 0
      );
    }
    
    // If no teacherApplication provided, only check basic info
    // This allows backward compatibility but is less strict
    return hasBasicInfo;
  }

  if (profile.accountType === 'admin') {
    return true;
  }
  
  return false;
}

/**
 * Helper function to create a default user profile
 * دالة مساعدة لإنشاء ملف مستخدم افتراضي
 */
export function createDefaultUserProfile(uid: string, email: string, displayName?: string): UserProfile {
  const nameParts = displayName?.split(' ') || [];
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';
  
  return {
    uid,
    email,
    firstName,
    lastName,
    displayName: displayName || '',
    accountType: null,
    completed: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

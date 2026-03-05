/**
 * User Model - نموذج بيانات المستخدم
 * يحتوي على جميع الحقول المطلوبة لملف المستخدم
 */

export type AccountType = 'student' | 'teacher' | null;

export interface UserProfile {
  // Basic Information - المعلومات الأساسية
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  photoURL?: string;
  
  // Account Type - نوع الحساب
  accountType: AccountType;
  
  // Student Profile Data - بيانات ملف الطالب
  goals?: string[]; // الأهداف التعليمية
  ageGroup?: string | null; // الفئة العمرية
  level?: string | null; // المستوى
  budget?: number; // الميزانية
  learningGoal?: string | null; // الهدف التعليمي
  
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
 */
export function isProfileComplete(profile: UserProfile | null): boolean {
  if (!profile) return false;
  
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
      profile.level &&
      profile.budget !== undefined
    );
  }
  
  if (profile.accountType === 'teacher') {
    return !!(
      profile.firstName &&
      profile.lastName &&
      profile.email
    );
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

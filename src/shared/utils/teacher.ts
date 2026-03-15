/**
 * Teacher utility functions
 * Helper functions for teacher data transformation
 */

import { TeacherApplication, TeacherProfile, Qualification } from '../types/teacher.types';

/**
 * Get teacher display name from profile and application
 */
export function getTeacherDisplayName(
  profile?: TeacherProfile | null,
  application?: TeacherApplication | null
): string {
  if (profile?.displayName) {
    return profile.displayName;
  }
  
  if (profile?.firstName || profile?.lastName) {
    const name = `${profile.firstName || ''} ${profile.lastName || ''}`.trim();
    if (name) return name;
  }
  
  if (application?.fullName) {
    return application.fullName;
  }
  
  return 'المعلم';
}

/**
 * Get teacher title based on experience
 */
export function getTeacherTitle(application?: TeacherApplication | null): string {
  if (application?.yearsOfExperience) {
    return `مدرس قرآن كريم وتجويد بخبرة ${application.yearsOfExperience} عاماً`;
  }
  return 'مدرس قرآن كريم وتجويد';
}

/**
 * Get teacher specialization from subjects
 */
export function getTeacherSpecialization(application?: TeacherApplication | null): string {
  if (application?.subjects && application.subjects.length > 0) {
    return application.subjects.join(' و ');
  }
  return 'التجويد والقراءات';
}

/**
 * Get teacher profile image URL
 */
export function getTeacherImageUrl(profile?: TeacherProfile | null): string {
  if (profile?.photoURL && profile.photoURL.trim() !== '') {
    return profile.photoURL;
  }
  return '/no-image.png';
}

/**
 * Get qualifications from application
 * Returns qualifications stored in the application document
 */
export function getTeacherQualifications(application?: TeacherApplication | null): Qualification[] {
  if (!application) {
    return [];
  }
  
  // Return qualifications from application if they exist
  return (application as any).qualifications || [];
}

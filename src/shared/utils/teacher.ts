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
 * Generate qualifications from education level
 * TODO: This should be fetched from a separate collection in the future
 */
export function getTeacherQualifications(application?: TeacherApplication | null): Qualification[] {
  if (!application?.educationLevel) {
    return [];
  }
  
  // Mock qualifications - should be replaced with actual data from database
  return [
    {
      title: application.educationLevel,
      institution: 'الأزهر الشريف',
      year: '2010',
    },
    {
      title: 'بكالوريوس الدراسات الإسلامية والعربية',
      institution: 'جامعة الأزهر',
      year: '2008',
    },
    {
      title: 'دورة في طرق تدريس اللغة العربية لغير الناطقين بها',
      institution: 'معهد تعليم اللغة العربية',
      year: '2012',
    },
  ];
}

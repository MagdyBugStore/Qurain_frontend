/**
 * Teacher Domain Entity
 * Core business entity representing a teacher
 */

import type { TeacherApplication, TeacherProfile } from '../../../../shared/types/teacher.types';

export interface Teacher {
  id: string;
  userId: string;
  application: TeacherApplication;
  profile: TeacherProfile;
}

export interface TeacherPersonalInfo {
  teachingStyle: string;
  sessionContent: string;
  introVideo: string;
}

/**
 * Hook for managing personal info business logic
 */

import { useState } from 'react';
import { TeacherService } from '../../../services/teacherService';
import type { TeacherApplication } from '../../../shared/types/teacher.types';

export interface PersonalInfoData {
  bio?: string;
  teachingStyle?: string;
  sessionContent?: string;
  introVideo?: string;
}

export function usePersonalInfo(application: TeacherApplication | null) {
  const [saving, setSaving] = useState(false);
  const [personalInfo, setPersonalInfo] = useState<PersonalInfoData>({
    bio: application?.bio || '',
    teachingStyle: application?.teachingStyle || '',
    sessionContent: application?.sessionContent || '',
    introVideo: application?.introVideo || '',
  });

  const savePersonalInfo = async () => {
    if (!application?.id) return;

    setSaving(true);
    try {
      const teacherService = new TeacherService();
      await teacherService.updatePersonalInfo(application.id, personalInfo);
      return { success: true };
    } catch (error) {
      console.error('Error saving personal info:', error);
      return { success: false, error };
    } finally {
      setSaving(false);
    }
  };

  return {
    personalInfo,
    setPersonalInfo,
    savePersonalInfo,
    saving,
  };
}

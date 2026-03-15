/**
 * Hook for managing qualifications CRUD operations
 */

import { useState, useCallback, useEffect } from 'react';
import { TeacherService } from '../../../services/teacherService';
import type { TeacherApplication, Qualification } from '../../../shared/types/teacher.types';

export interface UseQualificationsReturn {
  qualifications: Qualification[];
  addQualification: () => void;
  updateQualification: (index: number, field: keyof Qualification, value: string) => void;
  deleteQualification: (index: number) => void;
  saveQualifications: (onSuccess?: () => void, onError?: (error: string) => void) => Promise<void>;
  saving: boolean;
  setQualifications: (qualifications: Qualification[]) => void;
}

export function useQualifications(teacherApplication: TeacherApplication | null) {
  const [qualifications, setQualifications] = useState<Qualification[]>([]);
  const [saving, setSaving] = useState(false);

  // Initialize qualifications from teacher application data
  useEffect(() => {
    // Qualifications are loaded from useTeacherProfileData hook
    // This effect will be triggered when qualifications prop changes
  }, []);

  const addQualification = useCallback(() => {
    setQualifications([...qualifications, { title: '', institution: '', year: '' }]);
  }, [qualifications]);

  const updateQualification = useCallback((index: number, field: keyof Qualification, value: string) => {
    const updated = [...qualifications];
    updated[index] = { ...updated[index], [field]: value };
    setQualifications(updated);
  }, [qualifications]);

  const deleteQualification = useCallback((index: number) => {
    setQualifications(qualifications.filter((_, i) => i !== index));
  }, [qualifications]);

  const saveQualifications = useCallback(async (
    onSuccess?: () => void,
    onError?: (error: string) => void
  ) => {
    if (!teacherApplication?.id) {
      onError?.('Cannot save: missing teacherApplication.id');
      return;
    }

    setSaving(true);
    try {
      const teacherService = new TeacherService();
      await teacherService.saveQualifications(teacherApplication.id, qualifications);
      onSuccess?.();
    } catch (error) {
      console.error('Error saving qualifications:', error);
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ أثناء حفظ المؤهلات';
      onError?.(errorMessage);
    } finally {
      setSaving(false);
    }
  }, [qualifications, teacherApplication]);

  return {
    qualifications,
    addQualification,
    updateQualification,
    deleteQualification,
    saveQualifications,
    saving,
    setQualifications,
  };
}

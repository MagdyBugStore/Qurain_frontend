/**
 * Hook for managing benefits CRUD operations
 */

import { useState, useCallback, useEffect } from 'react';
import { TeacherService } from '../../../services/teacherService';
import type { TeacherApplication } from '../../../shared/types/teacher.types';
import type { Benefit } from '../types';
import { parseBenefitsFromJSON, stringifyBenefits } from '../utils/dataParsing';
import { validateBenefits, hasEmptyBenefits } from '../utils/validation';

export interface UseBenefitsReturn {
  benefits: Benefit[];
  addBenefit: () => void;
  updateBenefit: (index: number, field: 'title' | 'subject', value: string) => void;
  deleteBenefit: (index: number) => void;
  saveBenefits: (onSuccess?: () => void, onError?: (error: string) => void) => Promise<void>;
  saving: boolean;
  setBenefits: (benefits: Benefit[]) => void;
}

const MAX_BENEFITS = 3;

export function useBenefits(teacherApplication: TeacherApplication | null) {
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [saving, setSaving] = useState(false);

  // Initialize benefits from teacher application
  useEffect(() => {
    if (teacherApplication?.teachingStyle) {
      const parsed = parseBenefitsFromJSON(teacherApplication.teachingStyle);
      setBenefits(parsed);
    } else {
      setBenefits([]);
    }
  }, [teacherApplication?.teachingStyle]);

  const addBenefit = useCallback(() => {
    if (benefits.length >= MAX_BENEFITS) {
      throw new Error('يمكن إضافة ثلاث فوائد كحد أقصى');
    }

    if (hasEmptyBenefits(benefits)) {
      throw new Error('يرجى إكمال الفوائد الحالية قبل إضافة فائدة جديدة');
    }

    setBenefits([...benefits, { title: '', subject: '' }]);
  }, [benefits]);

  const updateBenefit = useCallback((index: number, field: 'title' | 'subject', value: string) => {
    const updated = [...benefits];
    updated[index] = { ...updated[index], [field]: value };
    setBenefits(updated);
  }, [benefits]);

  const deleteBenefit = useCallback((index: number) => {
    setBenefits(benefits.filter((_, i) => i !== index));
  }, [benefits]);

  const saveBenefits = useCallback(async (
    onSuccess?: () => void,
    onError?: (error: string) => void
  ) => {
    if (!teacherApplication?.id) {
      onError?.('Cannot save: missing teacherApplication.id');
      return;
    }

    const validation = validateBenefits(benefits);
    if (!validation.isValid) {
      onError?.(validation.error || 'Validation failed');
      return;
    }

    // Filter out empty benefits before saving
    const validBenefits = benefits.filter(b => b.title.trim() && b.subject.trim());
    setSaving(true);

    try {
      const teacherService = new TeacherService();
      const currentSessionContent = teacherApplication.sessionContent || '';
      const currentIntroVideo = teacherApplication.introVideo || '';
      const benefitsJson = stringifyBenefits(validBenefits);

      await teacherService.updatePersonalInfo(teacherApplication.id, {
        teachingStyle: benefitsJson,
        sessionContent: currentSessionContent,
        introVideo: currentIntroVideo,
      });

      setBenefits(validBenefits);
      onSuccess?.();
    } catch (error) {
      console.error('Error saving benefits:', error);
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ أثناء حفظ الفوائد';
      onError?.(errorMessage);
    } finally {
      setSaving(false);
    }
  }, [benefits, teacherApplication]);

  return {
    benefits,
    addBenefit,
    updateBenefit,
    deleteBenefit,
    saveBenefits,
    saving,
    setBenefits,
  };
}

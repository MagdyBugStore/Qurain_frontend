/**
 * useSavePersonalInfo Hook
 * Handles saving teacher personal information
 */

import { useState } from 'react';
import { TeacherRepository } from '../../../../infrastructure/firebase/repositories/TeacherRepository';
import { SavePersonalInfo } from '../../application/use-cases/SavePersonalInfo';
import type { PersonalInfoData } from '../../application/use-cases/SavePersonalInfo';

export function useSavePersonalInfo() {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const save = async (applicationId: string, data: PersonalInfoData) => {
    try {
      setSaving(true);
      setError(null);
      
      const repository = new TeacherRepository();
      const useCase = new SavePersonalInfo(repository);
      await useCase.execute(applicationId, data);
    } catch (err) {
      console.error('Error saving personal info:', err);
      setError(err instanceof Error ? err : new Error('Failed to save personal info'));
      throw err;
    } finally {
      setSaving(false);
    }
  };

  return { save, saving, error };
}

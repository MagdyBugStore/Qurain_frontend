/**
 * useSaveQualifications Hook
 * Handles saving teacher qualifications
 */

import { useState } from 'react';
import { TeacherRepository } from '../../../../infrastructure/firebase/repositories/TeacherRepository';
import { SaveQualifications } from '../../application/use-cases/SaveQualifications';
import type { Qualification } from '../../domain/entities/Qualification';

export function useSaveQualifications() {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const save = async (applicationId: string, qualifications: Qualification[]) => {
    try {
      setSaving(true);
      setError(null);
      
      const repository = new TeacherRepository();
      const useCase = new SaveQualifications(repository);
      await useCase.execute(applicationId, qualifications);
    } catch (err) {
      console.error('Error saving qualifications:', err);
      setError(err instanceof Error ? err : new Error('Failed to save qualifications'));
      throw err;
    } finally {
      setSaving(false);
    }
  };

  return { save, saving, error };
}

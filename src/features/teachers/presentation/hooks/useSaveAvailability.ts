/**
 * useSaveAvailability Hook
 * Handles saving teacher availability schedule
 */

import { useState } from 'react';
import { TeacherRepository } from '../../../../infrastructure/firebase/repositories/TeacherRepository';
import { SaveAvailability } from '../../application/use-cases/SaveAvailability';
import type { Availability } from '../../domain/entities/Availability';

export function useSaveAvailability() {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const save = async (availability: Availability) => {
    try {
      setSaving(true);
      setError(null);
      
      const repository = new TeacherRepository();
      const useCase = new SaveAvailability(repository);
      await useCase.execute(availability);
    } catch (err) {
      console.error('Error saving availability:', err);
      setError(err instanceof Error ? err : new Error('Failed to save availability'));
      throw err;
    } finally {
      setSaving(false);
    }
  };

  return { save, saving, error };
}

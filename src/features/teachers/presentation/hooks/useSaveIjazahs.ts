/**
 * useSaveIjazahs Hook
 * Handles saving teacher ijazahs
 */

import { useState } from 'react';
// Firestore removed - TeacherRepository deleted
import { SaveIjazahs } from '../../application/use-cases/SaveIjazahs';
import type { Ijazah } from '../../domain/entities/Ijazah';

export function useSaveIjazahs() {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const save = async (teacherId: string, ijazahs: Ijazah[]) => {
    try {
      setSaving(true);
      setError(null);
      
      // Firestore removed - use backend API instead
      throw new Error('TeacherRepository removed - use backend API instead');
    } catch (err) {
      console.error('Error saving ijazahs:', err);
      setError(err instanceof Error ? err : new Error('Failed to save ijazahs'));
      throw err;
    } finally {
      setSaving(false);
    }
  };

  return { save, saving, error };
}

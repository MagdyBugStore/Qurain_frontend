/**
 * useSaveQualifications Hook
 * Handles saving teacher qualifications
 */

import { useState } from 'react';
// Firestore removed - TeacherRepository deleted
import { SaveQualifications } from '../../application/use-cases/SaveQualifications';
import type { Qualification } from '../../domain/entities/Qualification';

export function useSaveQualifications() {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const save = async (applicationId: string, qualifications: Qualification[]) => {
    try {
      setSaving(true);
      setError(null);
      
      // Firestore removed - use backend API instead
      throw new Error('TeacherRepository removed - use backend API instead');
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

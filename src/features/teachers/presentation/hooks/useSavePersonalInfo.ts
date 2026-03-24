/**
 * useSavePersonalInfo Hook
 * Handles saving teacher personal information
 */

import { useState } from 'react';
// Firestore removed - TeacherRepository deleted
import { SavePersonalInfo } from '../../application/use-cases/SavePersonalInfo';
import type { PersonalInfoData } from '../../application/use-cases/SavePersonalInfo';

export function useSavePersonalInfo() {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const save = async (applicationId: string, data: PersonalInfoData) => {
    try {
      setSaving(true);
      setError(null);
      
      // Firestore removed - use backend API instead
      throw new Error('TeacherRepository removed - use backend API instead');
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

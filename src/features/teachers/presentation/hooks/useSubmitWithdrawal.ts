/**
 * useSubmitWithdrawal Hook
 * Handles withdrawal request submission
 */

import { useState } from 'react';
// Firestore removed - TeacherRepository deleted
import { SubmitWithdrawal } from '../../application/use-cases/SubmitWithdrawal';
import type { WithdrawalData } from '../../application/use-cases/SubmitWithdrawal';

export function useSubmitWithdrawal() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const submit = async (data: WithdrawalData) => {
    try {
      setSubmitting(true);
      setError(null);
      
      // Firestore removed - use backend API instead
      throw new Error('TeacherRepository removed - use backend API instead');
    } catch (err) {
      console.error('Error submitting withdrawal:', err);
      setError(err instanceof Error ? err : new Error('Failed to submit withdrawal'));
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  return { submit, submitting, error };
}

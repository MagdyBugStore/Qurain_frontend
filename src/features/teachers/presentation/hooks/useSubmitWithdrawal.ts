/**
 * useSubmitWithdrawal Hook
 * Handles withdrawal request submission
 */

import { useState } from 'react';
import { TeacherRepository } from '../../../../infrastructure/firebase/repositories/TeacherRepository';
import { SubmitWithdrawal } from '../../application/use-cases/SubmitWithdrawal';
import type { WithdrawalData } from '../../application/use-cases/SubmitWithdrawal';

export function useSubmitWithdrawal() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const submit = async (data: WithdrawalData) => {
    try {
      setSubmitting(true);
      setError(null);
      
      const repository = new TeacherRepository();
      const useCase = new SubmitWithdrawal(repository);
      return await useCase.execute(data);
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

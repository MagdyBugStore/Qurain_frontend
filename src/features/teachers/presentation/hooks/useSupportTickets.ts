/**
 * useSupportTickets Hook
 * Handles support ticket operations
 */

import { useState } from 'react';
// Firestore removed - TeacherRepository deleted
import { CreateSupportTicket } from '../../application/use-cases/CreateSupportTicket';
import { AddTicketReply } from '../../application/use-cases/AddTicketReply';
import type { SupportTicketData } from '../../application/use-cases/CreateSupportTicket';
import type { ReplyData } from '../../application/use-cases/AddTicketReply';

export function useSupportTickets() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createTicket = async (data: SupportTicketData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Firestore removed - use backend API instead
      throw new Error('TeacherRepository removed - use backend API instead');
    } catch (err) {
      console.error('Error creating support ticket:', err);
      setError(err instanceof Error ? err : new Error('Failed to create ticket'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addReply = async (data: ReplyData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Firestore removed - use backend API instead
      throw new Error('TeacherRepository removed - use backend API instead');
    } catch (err) {
      console.error('Error adding ticket reply:', err);
      setError(err instanceof Error ? err : new Error('Failed to add reply'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createTicket, addReply, loading, error };
}

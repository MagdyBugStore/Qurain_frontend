/**
 * Hook for managing support tickets business logic
 */

import { useState, useEffect } from 'react';
import { SupportService } from '../../../services/supportService';

export interface NewTicketData {
  subject: string;
  message: string;
  category: 'technical' | 'billing' | 'account' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export function useSupport(userId: string | null, userName: string) {
  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);
  const [newTicket, setNewTicket] = useState<NewTicketData>({
    subject: '',
    message: '',
    category: 'technical',
    priority: 'medium',
  });
  const [replyMessage, setReplyMessage] = useState('');

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchTickets = () => {
      setLoading(true);
      try {
        const supportService = new SupportService();
        const unsubscribe = supportService.subscribeToSupportTickets(userId, (ticketsData) => {
          setTickets(ticketsData);
          setLoading(false);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('Error fetching tickets:', error);
        setLoading(false);
      }
    };

    const cleanup = fetchTickets();
    return cleanup;
  }, [userId]);

  const createTicket = async () => {
    if (!userId) return { success: false, error: 'User ID is required' };

    if (!newTicket.subject || !newTicket.message) {
      return { success: false, error: 'يرجى إدخال جميع البيانات المطلوبة' };
    }

    setSaving(true);
    try {
      const supportService = new SupportService();
      const ticketId = await supportService.createTicket({
        userId,
        userName,
        subject: newTicket.subject,
        message: newTicket.message,
        category: newTicket.category,
        priority: newTicket.priority,
      });

      setShowNewTicketForm(false);
      setNewTicket({ subject: '', message: '', category: 'technical', priority: 'medium' });

      // Refresh tickets
      const ticketsData = await supportService.getSupportTickets(userId, 10);
      setTickets(ticketsData);

      return { success: true, ticketId };
    } catch (error) {
      console.error('Error creating ticket:', error);
      return { success: false, error: 'حدث خطأ أثناء إنشاء التذكرة' };
    } finally {
      setSaving(false);
    }
  };

  const addReply = async (ticketId: string) => {
    if (!replyMessage.trim()) {
      return { success: false, error: 'الرسالة لا يمكن أن تكون فارغة' };
    }

    setSaving(true);
    try {
      const supportService = new SupportService();
      await supportService.addReply(ticketId, {
        message: replyMessage,
        sender: 'user',
        senderName: userName,
      });

      setReplyMessage('');

      // Refresh selected ticket
      const updatedTicket = await supportService.getSupportTicket(ticketId);
      if (updatedTicket) {
        setSelectedTicket(updatedTicket);
      }

      return { success: true };
    } catch (error) {
      console.error('Error adding reply:', error);
      return { success: false, error: 'حدث خطأ أثناء إرسال الرد' };
    } finally {
      setSaving(false);
    }
  };

  return {
    tickets,
    selectedTicket,
    setSelectedTicket,
    loading,
    saving,
    showNewTicketForm,
    setShowNewTicketForm,
    newTicket,
    setNewTicket,
    replyMessage,
    setReplyMessage,
    createTicket,
    addReply,
  };
}

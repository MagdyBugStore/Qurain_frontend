/**
 * Support Service
 * Business logic layer for support ticket operations
 */

import { TeacherRepository } from '../infrastructure/firebase/repositories/TeacherRepository';
import type { SupportTicket, TicketReply } from '../features/teachers/domain/entities/SupportTicket';
import type { Unsubscribe } from 'firebase/firestore';

export interface CreateTicketData {
  userId: string;
  userName: string;
  subject: string;
  message: string;
  category: 'technical' | 'billing' | 'account' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface ReplyData {
  message: string;
  sender: 'user' | 'admin';
  senderName: string;
}

export class SupportService {
  private repository: TeacherRepository;

  constructor() {
    this.repository = new TeacherRepository();
  }

  /**
   * Get support tickets for a user
   */
  async getSupportTickets(userId: string, limit: number = 10): Promise<SupportTicket[]> {
    try {
      return await this.repository.getSupportTickets(userId, limit);
    } catch (error) {
      console.error('Error getting support tickets:', error);
      throw error;
    }
  }

  /**
   * Subscribe to real-time support tickets updates
   */
  subscribeToSupportTickets(
    userId: string,
    callback: (tickets: SupportTicket[]) => void
  ): Unsubscribe {
    try {
      return this.repository.subscribeToSupportTickets(userId, callback);
    } catch (error) {
      console.error('Error subscribing to support tickets:', error);
      throw error;
    }
  }

  /**
   * Get a single support ticket by ID
   */
  async getSupportTicket(ticketId: string): Promise<SupportTicket | null> {
    try {
      return await this.repository.getSupportTicket(ticketId);
    } catch (error) {
      console.error('Error getting support ticket:', error);
      throw error;
    }
  }

  /**
   * Create a new support ticket
   */
  async createTicket(data: CreateTicketData): Promise<string> {
    try {
      if (!data.subject || !data.message) {
        throw new Error('يرجى إدخال جميع البيانات المطلوبة');
      }

      return await this.repository.createSupportTicket({
        userId: data.userId,
        userName: data.userName,
        subject: data.subject,
        message: data.message,
        category: data.category,
        priority: data.priority,
        status: 'open',
      });
    } catch (error) {
      console.error('Error creating support ticket:', error);
      throw error;
    }
  }

  /**
   * Add a reply to a support ticket
   */
  async addReply(ticketId: string, reply: ReplyData): Promise<void> {
    try {
      if (!reply.message.trim()) {
        throw new Error('الرسالة لا يمكن أن تكون فارغة');
      }

      await this.repository.addTicketReply(ticketId, {
        message: reply.message,
        sender: reply.sender,
        senderName: reply.senderName,
      });
    } catch (error) {
      console.error('Error adding ticket reply:', error);
      throw error;
    }
  }

  /**
   * Update ticket status
   */
  async updateTicketStatus(ticketId: string, status: SupportTicket['status']): Promise<void> {
    try {
      await this.repository.updateTicketStatus(ticketId, status);
    } catch (error) {
      console.error('Error updating ticket status:', error);
      throw error;
    }
  }
}

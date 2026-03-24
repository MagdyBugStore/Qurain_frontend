/**
 * Support Service
 * Business logic layer for support ticket operations
 * NOTE: Firestore removed - this service is now a placeholder
 */

import type { SupportTicket, TicketReply } from '../features/teachers/domain/entities/SupportTicket';

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
  constructor() {
    // Firestore removed
  }

  /**
   * Get support tickets for a user
   */
  async getSupportTickets(userId: string, limit: number = 10): Promise<SupportTicket[]> {
    console.warn('SupportService.getSupportTickets: Firestore removed, returning empty array');
    return [];
  }

  /**
   * Subscribe to real-time support tickets updates
   */
  subscribeToSupportTickets(
    userId: string,
    callback: (tickets: SupportTicket[]) => void
  ): () => void {
    console.warn('SupportService.subscribeToSupportTickets: Firestore removed, returning no-op unsubscribe');
    callback([]);
    return () => {}; // No-op unsubscribe
  }

  /**
   * Get a single support ticket by ID
   */
  async getSupportTicket(ticketId: string): Promise<SupportTicket | null> {
    console.warn('SupportService.getSupportTicket: Firestore removed, returning null');
    return null;
  }

  /**
   * Create a new support ticket
   */
  async createTicket(data: CreateTicketData): Promise<string> {
    throw new Error('SupportService.createTicket: Firestore removed - use backend API instead');
  }

  /**
   * Add a reply to a support ticket
   */
  async addReply(ticketId: string, reply: ReplyData): Promise<void> {
    throw new Error('SupportService.addReply: Firestore removed - use backend API instead');
  }

  /**
   * Update ticket status
   */
  async updateTicketStatus(ticketId: string, status: SupportTicket['status']): Promise<void> {
    throw new Error('SupportService.updateTicketStatus: Firestore removed - use backend API instead');
  }
}

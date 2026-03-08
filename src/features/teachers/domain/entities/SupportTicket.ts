/**
 * Support Ticket Domain Entity
 */

export type TicketCategory = 'technical' | 'billing' | 'account' | 'other';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface TicketReply {
  id: string;
  message: string;
  sender: 'user' | 'admin';
  senderName: string;
  createdAt: any;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  subject: string;
  message: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  replies: TicketReply[];
  createdAt: any;
  updatedAt: any;
}

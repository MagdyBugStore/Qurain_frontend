/**
 * Add Ticket Reply Use Case
 * Adds a reply to a support ticket
 */

import type { ITeacherRepository } from '../../domain/interfaces/ITeacherRepository';
import type { TicketReply } from '../../domain/entities/SupportTicket';

export interface ReplyData {
  ticketId: string;
  message: string;
  sender: 'user' | 'admin';
  senderName: string;
}

export class AddTicketReply {
  constructor(private repository: ITeacherRepository) {}

  async execute(data: ReplyData): Promise<void> {
    await this.repository.addTicketReply(data.ticketId, {
      message: data.message,
      sender: data.sender,
      senderName: data.senderName,
    });
  }
}

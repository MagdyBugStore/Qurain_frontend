/**
 * Create Support Ticket Use Case
 * Creates a new support ticket
 */

import type { ITeacherRepository } from '../../domain/interfaces/ITeacherRepository';
import type { SupportTicket } from '../../domain/entities/SupportTicket';

export interface SupportTicketData {
  userId: string;
  userName: string;
  subject: string;
  message: string;
  category: SupportTicket['category'];
  priority: SupportTicket['priority'];
}

export class CreateSupportTicket {
  constructor(private repository: ITeacherRepository) {}

  async execute(data: SupportTicketData): Promise<string> {
    return await this.repository.createSupportTicket({
      userId: data.userId,
      userName: data.userName,
      subject: data.subject,
      message: data.message,
      category: data.category,
      priority: data.priority,
      status: 'open',
    });
  }
}

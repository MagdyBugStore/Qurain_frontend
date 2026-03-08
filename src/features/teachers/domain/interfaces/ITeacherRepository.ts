/**
 * Teacher Repository Interface
 * Defines contract for teacher data access
 */

import type { TeacherApplication, TeacherProfile, Review } from '../../../../shared/types/teacher.types';
import type { Qualification } from '../entities/Qualification';
import type { Ijazah } from '../entities/Ijazah';
import type { Availability } from '../entities/Availability';
import type { Wallet, WithdrawalRequest } from '../entities/Wallet';
import type { SupportTicket } from '../entities/SupportTicket';

export interface ITeacherRepository {
  // Teacher Application
  findApplicationByUserId(userId: string): Promise<TeacherApplication | null>;
  findApprovedByUserId(userId: string): Promise<TeacherApplication | null>;
  findAllApproved(): Promise<TeacherApplication[]>;
  updateApplication(applicationId: string, data: Partial<TeacherApplication>): Promise<void>;
  
  // User Profile
  getUserProfile(userId: string): Promise<TeacherProfile | null>;
  
  // Qualifications
  getQualifications(teacherId: string): Promise<Qualification[]>;
  saveQualifications(applicationId: string, qualifications: Qualification[]): Promise<void>;
  
  // Ijazahs
  getIjazahs(teacherId: string): Promise<Ijazah[]>;
  saveIjazah(ijazah: Omit<Ijazah, 'id'>): Promise<string>;
  updateIjazah(ijazahId: string, data: Partial<Ijazah>): Promise<void>;
  deleteIjazah(ijazahId: string): Promise<void>;
  
  // Availability
  getAvailability(teacherId: string): Promise<Availability | null>;
  saveAvailability(availability: Availability): Promise<void>;
  
  // Reviews & Ratings
  getTeacherReviews(teacherId: string): Promise<Review[]>;
  getTeacherRating(teacherId: string): Promise<{ rating: number; count: number }>;
  
  // Wallet
  getWallet(teacherId: string): Promise<Wallet | null>;
  getTransactions(teacherId: string, limit?: number): Promise<Wallet['transactions']>;
  getWithdrawalRequests(teacherId: string, limit?: number): Promise<WithdrawalRequest[]>;
  createWithdrawalRequest(request: Omit<WithdrawalRequest, 'id' | 'createdAt'>): Promise<string>;
  updateWalletBalance(teacherId: string, newBalance: number): Promise<void>;
  
  // Support Tickets
  getSupportTickets(userId: string, limit?: number): Promise<SupportTicket[]>;
  getSupportTicket(ticketId: string): Promise<SupportTicket | null>;
  createSupportTicket(ticket: Omit<SupportTicket, 'id' | 'replies' | 'createdAt' | 'updatedAt'>): Promise<string>;
  addTicketReply(ticketId: string, reply: Omit<SupportTicket['replies'][0], 'id' | 'createdAt'>): Promise<void>;
  updateTicketStatus(ticketId: string, status: SupportTicket['status']): Promise<void>;
}

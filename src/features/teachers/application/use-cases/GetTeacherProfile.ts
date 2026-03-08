/**
 * Get Teacher Profile Use Case
 * Fetches complete teacher profile data including application, profile, ratings, etc.
 */

import type { ITeacherRepository } from '../../domain/interfaces/ITeacherRepository';
import type { TeacherApplication, TeacherProfile } from '../../../../shared/types/teacher.types';
import type { Qualification } from '../../domain/entities/Qualification';
import type { Ijazah } from '../../domain/entities/Ijazah';
import type { Availability } from '../../domain/entities/Availability';
import type { Wallet } from '../../domain/entities/Wallet';
import type { SupportTicket } from '../../domain/entities/SupportTicket';

export interface TeacherProfileData {
  application: TeacherApplication | null;
  profile: TeacherProfile | null;
  rating: number;
  reviewsCount: number;
  qualifications: Qualification[];
  ijazahs: Ijazah[];
  availability: Availability | null;
  wallet: Wallet | null;
  supportTickets: SupportTicket[];
}

export class GetTeacherProfile {
  constructor(private repository: ITeacherRepository) {}

  async execute(userId: string): Promise<TeacherProfileData> {
    // Fetch teacher application
    const application = await this.repository.findApplicationByUserId(userId);
    
    if (!application) {
      // Return empty profile if no application found
      const profile = await this.repository.getUserProfile(userId);
      return {
        application: null,
        profile,
        rating: 0,
        reviewsCount: 0,
        qualifications: [],
        ijazahs: [],
        availability: null,
        wallet: null,
        supportTickets: [],
      };
    }

    const teacherId = application.userId || application.id;

    // Fetch all data in parallel
    const [
      profile,
      { rating, count: reviewsCount },
      qualifications,
      ijazahs,
      availability,
      wallet,
      supportTickets,
    ] = await Promise.all([
      this.repository.getUserProfile(teacherId),
      this.repository.getTeacherRating(teacherId),
      this.repository.getQualifications(teacherId),
      this.repository.getIjazahs(teacherId),
      this.repository.getAvailability(teacherId),
      this.repository.getWallet(teacherId),
      this.repository.getSupportTickets(userId, 10),
    ]);

    // Enhance wallet with transactions and withdrawals
    let enhancedWallet = wallet;
    if (wallet) {
      const [transactions, withdrawalRequests] = await Promise.all([
        this.repository.getTransactions(teacherId, 10),
        this.repository.getWithdrawalRequests(teacherId, 10),
      ]);
      enhancedWallet = {
        ...wallet,
        transactions,
        withdrawalRequests,
      };
    }

    return {
      application,
      profile: profile || null,
      rating,
      reviewsCount,
      qualifications,
      ijazahs,
      availability,
      wallet: enhancedWallet,
      supportTickets,
    };
  }
}

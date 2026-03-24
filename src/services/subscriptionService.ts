/**
 * Subscription Service
 * Business logic layer for student/teacher subscriptions
 * Uses backend API
 */

import { apiClient } from '../lib/apiClient';

export type SubscriptionStatus = 'active' | 'pending' | 'cancelled';

export interface StudentSubscription {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  teacherId: string;
  teacherName: string;
  planId: 'starter' | 'premium' | 'elite';
  planLabel: string;
  sessionsPerMonth: number;
  weeklyFrequency: string;
  durationMinutes: number;
  weeklySlots: Array<{ dayIndex: number; time: string }>;
  monthlyPrice: number;
  currency: string;
  status: SubscriptionStatus;
  startDate?: Date;
  nextRenewalDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export class SubscriptionService {
  constructor() {}

  /**
   * Get set of booked weekly slots for a teacher from active subscriptions
   */
  async getBookedSlotsForTeacher(teacherId: string): Promise<Set<string>> {
    if (!teacherId) return new Set();

    const data = await apiClient.get<{ bookedSlots: string[] }>(
      `/payments/subscriptions/teacher/${teacherId}/booked-slots`
    );
    return new Set(data.bookedSlots || []);
  }

  /**
   * Get latest active subscription for a student
   */
  async getActiveSubscriptionForStudent(
    _studentId: string
  ): Promise<StudentSubscription | null> {
    const subscriptions = await this.getAllSubscriptions({ status: 'active' });
    return subscriptions[0] || null;
  }

  /**
   * Get all subscriptions with optional filters
   */
  async getAllSubscriptions(
    filters?: {
      status?: SubscriptionStatus;
      teacherId?: string;
      studentId?: string;
    }
  ): Promise<StudentSubscription[]> {
    const data = await apiClient.get<{ subscriptions: StudentSubscription[] }>(
      '/payments/subscriptions/me'
    );

    let subscriptions = data.subscriptions || [];

    if (filters?.status) {
      subscriptions = subscriptions.filter((item) => item.status === filters.status);
    }
    if (filters?.teacherId) {
      subscriptions = subscriptions.filter((item) => item.teacherId === filters.teacherId);
    }
    if (filters?.studentId) {
      subscriptions = subscriptions.filter((item) => item.studentId === filters.studentId);
    }

    return subscriptions;
  }

  /**
   * Update subscription status
   */
  async updateSubscriptionStatus(
    subscriptionId: string,
    status: SubscriptionStatus
  ): Promise<void> {
    throw new Error('SubscriptionService.updateSubscriptionStatus: Firestore removed - use backend API instead');
  }

  /**
   * Delete a subscription and all related sessions
   */
  async deleteSubscription(subscriptionId: string): Promise<void> {
    throw new Error('SubscriptionService.deleteSubscription: Firestore removed - use backend API instead');
  }
}

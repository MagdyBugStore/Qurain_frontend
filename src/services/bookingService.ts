/**
 * Booking Service
 * Business logic layer for booking operations
 * NOTE: Firestore removed - this service is now a placeholder
 */

import { TeacherService } from './teacherService';
import { TEACHER_APPLICATION_STATUS } from '../constants/status';
import { apiClient } from '../lib/apiClient';

export type PlanId = 'starter' | 'premium' | 'elite';

export interface WeeklySlot {
  dayIndex: number;
  time: string;
}

export interface SubscriptionData {
  studentId: string;
  studentName: string;
  studentEmail: string;
  teacherId: string;
  teacherName: string;
  planId: PlanId;
  planLabel: string;
  sessionsPerMonth: number;
  weeklyFrequency: string;
  durationMinutes: number;
  weeklySlots: WeeklySlot[];
  monthlyPrice: number;
  currency: string;
  status: 'active' | 'pending' | 'cancelled';
  startDate: Date;
  nextRenewalDate: Date;
}

export class BookingService {
  private teacherService: TeacherService;

  constructor() {
    this.teacherService = new TeacherService();
  }

  /**
   * Get teacher data for booking
   */
  async getTeacherForBooking(teacherId: string) {
    try {
      return await this.teacherService.getTeacherDetailById(teacherId);
    } catch (error) {
      console.error('Error getting teacher for booking:', error);
      throw error;
    }
  }

  /**
   * Check if teacher is available
   */
  async checkTeacherAvailability(teacherId: string): Promise<boolean> {
    console.warn('BookingService.checkTeacherAvailability: Firestore removed, returning false');
    return false;
  }

  /**
   * Create a new subscription
   */
  async createSubscription(data: SubscriptionData): Promise<string> {
    // Minimal payload to match backend controller stub
    // Backend expects: { planId, teacherId, paymentMethodId? }
    // We pass additional metadata in case backend starts accepting it later
    const payload = {
      planId: data.planId,
      teacherId: data.teacherId,
      // Optional: send extra info; backend will ignore unknown fields safely
      planLabel: data.planLabel,
      sessionsPerMonth: data.sessionsPerMonth,
      weeklyFrequency: data.weeklyFrequency,
      durationMinutes: data.durationMinutes,
      weeklySlots: data.weeklySlots,
      monthlyPrice: data.monthlyPrice,
      currency: data.currency,
      startDate: data.startDate,
      nextRenewalDate: data.nextRenewalDate,
      // paymentMethodId can be added when integrating a real gateway
    };

    const response = await apiClient.post<{ subscription: { id: string } }>(
      `/payments/subscriptions`,
      payload
    );

    return response.subscription.id;
  }
}

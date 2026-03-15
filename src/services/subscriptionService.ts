/**
 * Subscription Service
 * Business logic layer for student/teacher subscriptions
 */

import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  addDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { COLLECTIONS } from '../constants/firebaseCollections';

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
  /**
   * Get latest active subscription for a student
   */
  async getActiveSubscriptionForStudent(
    studentId: string
  ): Promise<StudentSubscription | null> {
    try {
      
      console.log('🔎 [SubscriptionService] Collection:', COLLECTIONS.SUBSCRIPTIONS)
      
      const q = query(
        collection(db, COLLECTIONS.SUBSCRIPTIONS),
        where('studentId', '==', studentId),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc'),
        limit(1)
      );

      const snapshot = await getDocs(q);
     

      const doc = snapshot.docs[0];
      const data = doc.data() as any;
    
      const toDate = (value: any): Date | undefined => {
        if (!value) return undefined;
        if (value.toDate) return value.toDate();
        if (value instanceof Date) return value;
        return new Date(value);
      };

      const subscription: StudentSubscription = {
        id: doc.id,
        studentId: data.studentId,
        studentName: data.studentName,
        studentEmail: data.studentEmail,
        teacherId: data.teacherId,
        teacherName: data.teacherName,
        planId: data.planId,
        planLabel: data.planLabel,
        sessionsPerMonth: data.sessionsPerMonth,
        weeklyFrequency: data.weeklyFrequency,
        durationMinutes: data.durationMinutes,
        weeklySlots: data.weeklySlots || [],
        monthlyPrice: data.monthlyPrice,
        currency: data.currency,
        status: data.status,
        startDate: toDate(data.startDate),
        nextRenewalDate: toDate(data.nextRenewalDate),
        createdAt: toDate(data.createdAt),
        updatedAt: toDate(data.updatedAt),
      };
      
      console.log('✨ [SubscriptionService] Parsed subscription:', subscription)
      
      // Check if sessions exist for this subscription, if not create them
      await this.ensureSessionsExist(subscription);
      
      return subscription;
    } catch (error) {
      console.error('Error fetching active subscription:', error);
      throw error;
    }
  }

  /**
   * Ensure sessions exist for a subscription, create them if they don't
   */
  private async ensureSessionsExist(subscription: StudentSubscription): Promise<void> {
    try {
      console.log('🔍 [SubscriptionService] Checking if sessions exist for subscription:', subscription.id)
      
      // Check if sessions already exist for this subscription
      const existingSessionsQuery = query(
        collection(db, COLLECTIONS.SESSIONS),
        where('studentId', '==', subscription.studentId),
        where('teacherId', '==', subscription.teacherId),
        where('status', '==', 'scheduled')
      );

      const existingSessions = await getDocs(existingSessionsQuery);
      console.log('📊 [SubscriptionService] Existing sessions count:', existingSessions.size)

      // If we have enough sessions (at least 2 weeks worth), skip creation
      if (existingSessions.size >= subscription.weeklySlots.length * 2) {
        console.log('✅ [SubscriptionService] Sessions already exist, skipping creation')
        return;
      }

      console.log('📅 [SubscriptionService] Creating missing sessions...')
      await this.createSessionsFromSubscription(subscription);
    } catch (error) {
      console.error('❌ [SubscriptionService] Error ensuring sessions exist:', error);
      // Don't throw - this is a background operation
    }
  }

  /**
   * Create sessions from subscription weekly slots
   */
  private async createSessionsFromSubscription(subscription: StudentSubscription): Promise<void> {
    try {
      if (!subscription.weeklySlots || subscription.weeklySlots.length === 0) {
        console.log('⚠️ [SubscriptionService] No weekly slots to create sessions from')
        return;
      }

      // Time slots mapping
      const availabilityTimeSlots = [
        '٠٨:٠٠ ص', '٠٩:٠٠ ص', '١٠:٠٠ ص', '١١:٠٠ ص',
        '١٢:٠٠ م', '٠١:٠٠ م', '٠٢:٠٠ م', '٠٣:٠٠ م',
        '٠٤:٠٠ م', '٠٥:٠٠ م', '٠٦:٠٠ م', '٠٧:٠٠ م',
      ];

      // Map availability index to JS day
      const getJsDayFromAvailabilityIndex = (availabilityIndex: number): number => {
        const map: { [key: number]: number } = {
          0: 6, 1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5,
        };
        return map[availabilityIndex] ?? 0;
      };

      // Convert Arabic time string to hours and minutes
      const parseTimeString = (timeStr: string): { hours: number; minutes: number } => {
        const timeMatch = timeStr.match(/(\d+):(\d+)/);
        if (!timeMatch) return { hours: 0, minutes: 0 };
        
        const arabicToEnglish = (str: string) => {
          const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
          return str.split('').map(char => {
            const index = arabicDigits.indexOf(char);
            return index !== -1 ? index.toString() : char;
          }).join('');
        };

        let hours = parseInt(arabicToEnglish(timeMatch[1]), 10);
        const minutes = parseInt(arabicToEnglish(timeMatch[2]), 10);
        const isPM = timeStr.includes('م');

        if (isPM && hours !== 12) hours += 12;
        if (!isPM && hours === 12) hours = 0;

        return { hours, minutes };
      };

      // Get next occurrence of a specific day and time
      const getNextDateForSlot = (dayIndex: number, timeStr: string, weekOffset: number = 0): Date => {
        const today = new Date();
        const jsTargetDay = getJsDayFromAvailabilityIndex(dayIndex);
        const { hours, minutes } = parseTimeString(timeStr);

        const result = new Date(today);
        let addDays = (jsTargetDay - today.getDay() + 7) % 7;
        if (addDays === 0) addDays = 7;

        result.setDate(today.getDate() + addDays + (weekOffset * 7));
        result.setHours(hours, minutes, 0, 0);

        return result;
      };

      // Create sessions for the next 4 weeks
      const sessionsToCreate: any[] = [];
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 30);

      for (let week = 0; week < 4; week++) {
        for (const slot of subscription.weeklySlots) {
          const sessionDate = getNextDateForSlot(slot.dayIndex, slot.time, week);

          if (sessionDate >= startDate && sessionDate <= endDate) {
            sessionsToCreate.push({
              studentId: subscription.studentId,
              teacherId: subscription.teacherId,
              teacherName: subscription.teacherName,
              title: `جلسة ${subscription.planLabel}`,
              description: `جلسة أسبوعية - ${subscription.weeklyFrequency}`,
              scheduledDate: Timestamp.fromDate(sessionDate),
              duration: subscription.durationMinutes,
              status: 'scheduled',
              sessionType: 'memorization',
              subscriptionId: subscription.id,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          }
        }
      }

      console.log(`📅 [SubscriptionService] Creating ${sessionsToCreate.length} sessions...`);

      // Create all sessions
      const sessionPromises = sessionsToCreate.map(sessionData =>
        addDoc(collection(db, COLLECTIONS.SESSIONS), sessionData)
      );

      await Promise.all(sessionPromises);
      console.log(`✅ [SubscriptionService] Successfully created ${sessionsToCreate.length} sessions`);
    } catch (error) {
      console.error('❌ [SubscriptionService] Error creating sessions:', error);
      throw error;
    }
  }
}


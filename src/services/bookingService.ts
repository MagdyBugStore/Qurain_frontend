/**
 * Booking Service
 * Business logic layer for booking operations
 */

import { TeacherRepository } from '../infrastructure/firebase/repositories/TeacherRepository';
import { TeacherService } from './teacherService';
import { TEACHER_APPLICATION_STATUS } from '../constants/status';
import { collection, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { COLLECTIONS } from '../constants/firebaseCollections';

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
  private teacherRepository: TeacherRepository;
  private teacherService: TeacherService;

  constructor() {
    this.teacherRepository = new TeacherRepository();
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
    try {
      const application = await this.teacherRepository.findApprovedByUserId(teacherId);
      return application?.status === TEACHER_APPLICATION_STATUS.APPROVED;
    } catch (error) {
      console.error('Error checking teacher availability:', error);
      return false;
    }
  }

  /**
   * Create a new subscription
   */
  async createSubscription(data: SubscriptionData): Promise<string> {
    try {
      if (!data.studentId || !data.teacherId) {
        throw new Error('معرف الطالب والمعلم مطلوبان');
      }

      if (!data.weeklySlots || data.weeklySlots.length === 0) {
        throw new Error('يجب اختيار مواعيد أسبوعية');
      }

      const subscriptionDoc = {
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
        weeklySlots: data.weeklySlots,
        monthlyPrice: data.monthlyPrice,
        currency: data.currency,
        status: data.status || 'active',
        startDate: serverTimestamp(),
        nextRenewalDate: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(
        collection(db, COLLECTIONS.SUBSCRIPTIONS),
        subscriptionDoc
      );

      // Create sessions from weekly slots for the next month
      await this.createSessionsFromSubscription(docRef.id, data);

      // Update teacher availability to mark booked slots
      await this.updateTeacherAvailabilityForBooking(data.teacherId, data.weeklySlots);

      return docRef.id;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }

  /**
   * Create sessions from subscription weekly slots
   * Creates sessions for the next month based on weeklySlots
   */
  private async createSessionsFromSubscription(
    subscriptionId: string,
    subscriptionData: SubscriptionData
  ): Promise<void> {
    try {
            // Time slots mapping (12 slots per day)
      const availabilityTimeSlots = [
        '٠٨:٠٠ ص', '٠٩:٠٠ ص', '١٠:٠٠ ص', '١١:٠٠ ص',
        '١٢:٠٠ م', '٠١:٠٠ م', '٠٢:٠٠ م', '٠٣:٠٠ م',
        '٠٤:٠٠ م', '٠٥:٠٠ م', '٠٦:٠٠ م', '٠٧:٠٠ م',
      ];

      // Map availability index (0=Saturday) back to JS day (0=Sunday)
      const getJsDayFromAvailabilityIndex = (availabilityIndex: number): number => {
        const map: { [key: number]: number } = {
          0: 6, // Saturday
          1: 0, // Sunday
          2: 1, // Monday
          3: 2, // Tuesday
          4: 3, // Wednesday
          5: 4, // Thursday
          6: 5, // Friday
        };
        return map[availabilityIndex] ?? 0;
      };

      // Convert time string to hours and minutes
      const parseTimeString = (timeStr: string): { hours: number; minutes: number } => {
        // Extract numbers from Arabic time string like "٠٤:٠٠ م"
        const timeMatch = timeStr.match(/(\d+):(\d+)/);
        if (!timeMatch) return { hours: 0, minutes: 0 };
        
        // Convert Arabic digits to English
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
      const getNextDateForSlot = (dayIndex: number, timeStr: string): Date => {
        const today = new Date();
        const jsTargetDay = getJsDayFromAvailabilityIndex(dayIndex);
        const { hours, minutes } = parseTimeString(timeStr);

        const result = new Date(today);
        let addDays = (jsTargetDay - today.getDay() + 7) % 7;
        if (addDays === 0) addDays = 7; // Always next week if same day

        result.setDate(today.getDate() + addDays);
        result.setHours(hours, minutes, 0, 0);

        return result;
      };

      // Create sessions for the next 4 weeks (approximately one month)
      const sessionsToCreate: any[] = [];
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 30); // Next 30 days

      for (let week = 0; week < 4; week++) {
        for (const slot of subscriptionData.weeklySlots) {
          const baseDate = getNextDateForSlot(slot.dayIndex, slot.time);
          const sessionDate = new Date(baseDate);
          sessionDate.setDate(baseDate.getDate() + (week * 7));

          // Only create sessions within the next month
          if (sessionDate >= startDate && sessionDate <= endDate) {
            sessionsToCreate.push({
              studentId: subscriptionData.studentId,
              teacherId: subscriptionData.teacherId,
              teacherName: subscriptionData.teacherName,
              title: `جلسة ${subscriptionData.planLabel}`,
              description: `جلسة أسبوعية - ${subscriptionData.weeklyFrequency}`,
              scheduledDate: Timestamp.fromDate(sessionDate),
              duration: subscriptionData.durationMinutes,
              status: 'scheduled',
              sessionType: 'memorization',
              subscriptionId: subscriptionId,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          }
        }
      }

      

      // Create all sessions in batch
      const sessionPromises = sessionsToCreate.map(sessionData =>
        addDoc(collection(db, COLLECTIONS.SESSIONS), sessionData)
      );

      await Promise.all(sessionPromises);
      
    } catch (error) {
      console.error('❌ [BookingService] Error creating sessions from subscription:', error);
      // Don't throw - subscription is already created, sessions can be created later
    }
  }

  /**
   * Update teacher availability schedule to mark booked slots
   * Converts weekly slots to availability schedule indices and marks them as 'booked'
   */
  private async updateTeacherAvailabilityForBooking(
    teacherId: string,
    weeklySlots: WeeklySlot[]
  ): Promise<void> {
    try {
      console.log('[BookingService] ===== UPDATING AVAILABILITY AFTER BOOKING =====');
      console.log('[BookingService] Teacher ID:', teacherId);
      console.log('[BookingService] Weekly slots to mark as booked:', weeklySlots);
      
      // Get current availability
      const currentAvailability = await this.teacherRepository.getAvailability(teacherId);
      
      if (!currentAvailability) {
        console.warn(`⚠️ [BookingService] No availability found for teacher ${teacherId}, creating new schedule`);
        // Create new availability schedule with booked slots
        const newSchedule: (string | null)[][] = Array(7)
          .fill(null)
          .map(() => Array(12).fill(null));
        
        const availabilityTimeSlots = [
          '٠٨:٠٠ ص', '٠٩:٠٠ ص', '١٠:٠٠ ص', '١١:٠٠ ص',
          '١٢:٠٠ م', '٠١:٠٠ م', '٠٢:٠٠ م', '٠٣:٠٠ م',
          '٠٤:٠٠ م', '٠٥:٠٠ م', '٠٦:٠٠ م', '٠٧:٠٠ م',
        ];
        
        for (const slot of weeklySlots) {
          const dayIndex = slot.dayIndex;
          const timeIndex = availabilityTimeSlots.indexOf(slot.time);
          
          if (dayIndex >= 0 && dayIndex < 7 && timeIndex >= 0 && timeIndex < 12) {
            newSchedule[dayIndex][timeIndex] = 'booked';
          }
        }
        
        await this.teacherService.saveAvailability({
          teacherId,
          schedule: newSchedule as ('available' | 'booked' | null)[][],
        });
        
        console.log(`✅ [BookingService] Created new availability schedule with ${weeklySlots.length} booked slots`);
        return;
      }

      console.log('[BookingService] Current availability before update:', currentAvailability.schedule);

      // Time slots mapping (12 slots per day) - must match the order in UI
      const availabilityTimeSlots = [
        '٠٨:٠٠ ص', '٠٩:٠٠ ص', '١٠:٠٠ ص', '١١:٠٠ ص',
        '١٢:٠٠ م', '٠١:٠٠ م', '٠٢:٠٠ م', '٠٣:٠٠ م',
        '٠٤:٠٠ م', '٠٥:٠٠ م', '٠٦:٠٠ م', '٠٧:٠٠ م',
      ];

      // Create a copy of the schedule
      const updatedSchedule = currentAvailability.schedule.map(day => [...day]);
      let slotsMarkedAsBooked = 0;

      // Mark each booked slot as 'booked'
      for (const slot of weeklySlots) {
        const dayIndex = slot.dayIndex;
        const timeIndex = availabilityTimeSlots.indexOf(slot.time);

        console.log(`[BookingService] Processing slot: dayIndex=${dayIndex}, timeIndex=${timeIndex}, time=${slot.time}`);

        if (dayIndex >= 0 && dayIndex < 7 && timeIndex >= 0 && timeIndex < 12) {
          const previousStatus = updatedSchedule[dayIndex][timeIndex];
          
          // Always mark as booked regardless of previous status (student has booked it)
          updatedSchedule[dayIndex][timeIndex] = 'booked';
          slotsMarkedAsBooked++;
          
          console.log(`[BookingService] Marked slot [${dayIndex}][${timeIndex}] as booked (was: ${previousStatus})`);
        } else {
          console.warn(`⚠️ [BookingService] Invalid slot indices: dayIndex=${dayIndex}, timeIndex=${timeIndex}, time=${slot.time}`);
        }
      }

      console.log('[BookingService] Updated schedule after marking booked slots:', updatedSchedule);
      console.log(`[BookingService] Total slots marked as booked: ${slotsMarkedAsBooked}`);

      // Save updated availability using service layer for proper merging
      await this.teacherService.saveAvailability({
        teacherId,
        schedule: updatedSchedule,
        updatedAt: currentAvailability.updatedAt,
      });

      console.log(`✅ [BookingService] Successfully updated availability for teacher ${teacherId} with ${weeklySlots.length} booked slots`);
      console.log('[BookingService] ===== AVAILABILITY UPDATE COMPLETED =====');
    } catch (error) {
      console.error('[BookingService] ===== AVAILABILITY UPDATE FAILED =====');
      console.error('❌ [BookingService] Error updating teacher availability:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
      // Don't throw - booking is already created, availability can be updated later
    }
  }
}

/**
 * Teacher Repository
 * Firebase implementation of ITeacherRepository
 */

import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  addDoc,
  deleteDoc,
  setDoc,
  serverTimestamp,
  orderBy,
  limit,
  onSnapshot,
  deleteField,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { COLLECTIONS } from '../../../constants/firebaseCollections';
import type { TeacherApplication, TeacherProfile, Review } from '../../../shared/types/teacher.types';
import type { ITeacherRepository } from '../../../features/teachers/domain/interfaces/ITeacherRepository';
import type { Qualification } from '../../../features/teachers/domain/entities/Qualification';
import type { Ijazah } from '../../../features/teachers/domain/entities/Ijazah';
import type { Availability, SlotStatus } from '../../../features/teachers/domain/entities/Availability';
import type { Wallet, WithdrawalRequest } from '../../../features/teachers/domain/entities/Wallet';
import type { SupportTicket, TicketReply } from '../../../features/teachers/domain/entities/SupportTicket';

export class TeacherRepository implements ITeacherRepository {
  // Teacher Application Methods
  
  async findApplicationByUserId(userId: string): Promise<TeacherApplication | null> {
    try {
      const applicationsQuery = query(
        collection(db, COLLECTIONS.TEACHER_APPLICATIONS),
        where('userId', '==', userId)
      );
      
      const querySnapshot = await getDocs(applicationsQuery);
      
      if (querySnapshot.empty) {
        return null;
      }
      
      const docSnapshot = querySnapshot.docs[0];
      return {
        id: docSnapshot.id,
        ...docSnapshot.data(),
      } as TeacherApplication;
    } catch (error) {
      console.error('Error finding teacher application:', error);
      throw error;
    }
  }

  async findApprovedByUserId(userId: string): Promise<TeacherApplication | null> {
    try {
      const applicationsQuery = query(
        collection(db, COLLECTIONS.TEACHER_APPLICATIONS),
        where('userId', '==', userId),
        where('status', '==', 'approved')
      );
      
      const querySnapshot = await getDocs(applicationsQuery);
      
      if (querySnapshot.empty) {
        return null;
      }
      
      const docSnapshot = querySnapshot.docs[0];
      return {
        id: docSnapshot.id,
        ...docSnapshot.data(),
      } as TeacherApplication;
    } catch (error) {
      console.error('Error finding teacher application:', error);
      throw error;
    }
  }

  /**
   * Find all approved teacher applications
   */
  async findAllApproved(): Promise<TeacherApplication[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.TEACHER_APPLICATIONS),
        where('status', '==', 'approved')
      );
      
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as TeacherApplication[];
    } catch (error) {
      console.error('Error finding approved teachers:', error);
      throw error;
    }
  }

  /**
   * Get user profile by userId
   */
  async getUserProfile(userId: string): Promise<TeacherProfile | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (!userDoc.exists()) {
        return null;
      }
      
      return userDoc.data() as TeacherProfile;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  /**
   * Get reviews for a teacher
   */
  async getTeacherReviews(teacherId: string): Promise<Review[]> {
    try {
      const reviewsQuery = query(
        collection(db, 'reviews'),
        where('teacherId', '==', teacherId)
      );
      
      const reviewsSnapshot = await getDocs(reviewsQuery);
      
      return reviewsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Review[];
    } catch (error) {
      // Reviews collection might not exist - return empty array
      console.warn('Reviews collection not found or error:', error);
      return [];
    }
  }

  /**
   * Calculate average rating from reviews
   */
  async getTeacherRating(teacherId: string): Promise<{ rating: number; count: number }> {
    try {
      const reviews = await this.getTeacherReviews(teacherId);
      
      if (reviews.length === 0) {
        return { rating: 0, count: 0 };
      }
      
      const ratings = reviews
        .map((review) => review.rating || 0)
        .filter((r) => r > 0);
      
      if (ratings.length === 0) {
        return { rating: 0, count: reviews.length };
      }
      
      const avgRating = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
      
      return {
        rating: avgRating,
        count: reviews.length,
      };
    } catch (error) {
      console.error('Error calculating teacher rating:', error);
      return { rating: 0, count: 0 };
    }
  }

  async createApplication(data: Omit<TeacherApplication, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.TEACHER_APPLICATIONS), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating teacher application:', error);
      throw error;
    }
  }

  async updateApplication(applicationId: string, data: Partial<TeacherApplication>): Promise<void> {
    try {
      await updateDoc(doc(db, 'teacherApplications', applicationId), {
        ...data,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating teacher application:', error);
      throw error;
    }
  }

  // Qualifications Methods

  async getQualifications(teacherId: string): Promise<Qualification[]> {
    try {
      const application = await this.findApplicationByUserId(teacherId);
      if (!application) return [];
      
      // Qualifications are stored in the application document
      return (application as any).qualifications || [];
    } catch (error) {
      console.error('Error getting qualifications:', error);
      return [];
    }
  }

  async saveQualifications(applicationId: string, qualifications: Qualification[]): Promise<void> {
    try {
      await updateDoc(doc(db, 'teacherApplications', applicationId), {
        qualifications,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error saving qualifications:', error);
      throw error;
    }
  }

  // Ijazahs Methods

  async getIjazahs(teacherId: string): Promise<Ijazah[]> {
    try {
      const ijazahsQuery = query(
        collection(db, 'teacherIjazahs'),
        where('teacherId', '==', teacherId)
      );
      const snapshot = await getDocs(ijazahsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Ijazah[];
    } catch (error) {
      console.error('Error getting ijazahs:', error);
      return [];
    }
  }

  async saveIjazah(ijazah: Omit<Ijazah, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'teacherIjazahs'), {
        ...ijazah,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error saving ijazah:', error);
      throw error;
    }
  }

  async updateIjazah(ijazahId: string, data: Partial<Ijazah>): Promise<void> {
    try {
      await updateDoc(doc(db, 'teacherIjazahs', ijazahId), {
        ...data,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating ijazah:', error);
      throw error;
    }
  }

  async deleteIjazah(ijazahId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'teacherIjazahs', ijazahId));
    } catch (error) {
      console.error('Error deleting ijazah:', error);
      throw error;
    }
  }

  // Availability Methods
  
  async getAvailability(teacherId: string): Promise<Availability | null> {
    try {
      const availabilityDoc = await getDoc(doc(db, 'teacherAvailability', teacherId));
      if (!availabilityDoc.exists()) {
        return null;
      }

      const data = availabilityDoc.data() as any;

      // Firestore does not support nested arrays, so we store schedule as a flat map.
      // Here we normalize whatever is in Firestore back to our domain shape: SlotStatus[][]
      let schedule: SlotStatus[][] = Array(7)
        .fill(null)
        .map(() => Array(12).fill(null));

      if (data.schedule) {
        // New format: schedule is an object map like { "0_0": "available", ... }
        if (!Array.isArray(data.schedule) && typeof data.schedule === 'object') {
          Object.entries(data.schedule as Record<string, SlotStatus>).forEach(
            ([key, value]) => {
              const [dayStr, timeStr] = key.split('_');
              const dayIndex = parseInt(dayStr, 10);
              const timeIndex = parseInt(timeStr, 10);

              if (
                Number.isInteger(dayIndex) &&
                Number.isInteger(timeIndex) &&
                dayIndex >= 0 &&
                dayIndex < schedule.length &&
                timeIndex >= 0 &&
                timeIndex < schedule[dayIndex].length
              ) {
                schedule[dayIndex][timeIndex] = value;
              }
            }
          );
          
        }
        // Backward compatibility: if an older document has nested arrays, try to use it directly
        else if (Array.isArray(data.schedule)) {
          schedule = data.schedule as SlotStatus[][];
        }
      }

      // Count slots by type
      let availableCount = 0;
      let bookedCount = 0;
      let nullCount = 0;
      
      for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        for (let timeIndex = 0; timeIndex < 12; timeIndex++) {
          const slot = schedule[dayIndex]?.[timeIndex];
          if (slot === 'available') availableCount++;
          else if (slot === 'booked') bookedCount++;
          else nullCount++;
        }
      }

      const availability: Availability = {
        teacherId: data.teacherId || teacherId,
        schedule,
        updatedAt: data.updatedAt,
      };

      return availability;
    } catch (error) {
      return null;
    }
  }

  async saveAvailability(availability: Availability): Promise<void> {
    try {
      // Count slots before conversion
      let beforeAvailable = 0;
      let beforeBooked = 0;
      let beforeNull = 0;
      
      for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        for (let timeIndex = 0; timeIndex < 12; timeIndex++) {
          const slot = availability.schedule[dayIndex]?.[timeIndex];
          if (slot === 'available') beforeAvailable++;
          else if (slot === 'booked') beforeBooked++;
          else beforeNull++;
        }
      }
      
      const availabilityDocRef = doc(
        db,
        'teacherAvailability',
        availability.teacherId
      );

      // Get current document to know which keys exist
      const currentDoc = await getDoc(availabilityDocRef);
      const currentSchedule = currentDoc.exists() 
        ? (currentDoc.data()?.schedule as Record<string, SlotStatus> | undefined) 
        : undefined;

      // Firestore does not allow nested arrays. Convert 2D schedule matrix into a flat map:
      // { "dayIndex_timeIndex": "available" | "booked" }
      const scheduleMap: Record<string, SlotStatus | ReturnType<typeof deleteField>> = {};

      // Process all slots (7 days × 12 time slots = 84 slots)
      let slotsToSave = 0;
      let slotsToDelete = 0;
      let slotsNull = 0;
      let slotsAvailable = 0;
      let slotsBooked = 0;
      
      for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        for (let timeIndex = 0; timeIndex < 12; timeIndex++) {
          const key = `${dayIndex}_${timeIndex}`;
          const slot = availability.schedule[dayIndex]?.[timeIndex];
          
          if (slot === 'available') {
            slotsAvailable++;
          } else if (slot === 'booked') {
            slotsBooked++;
          } else {
            slotsNull++;
          }
          
          if (slot !== null && slot !== undefined) {
            // Save non-null slots
            scheduleMap[key] = slot;
            slotsToSave++;
          } else {
            // For null slots, use deleteField() to remove them from Firestore
            // Only delete if the key exists in current schedule
            if (currentSchedule && key in currentSchedule) {
              scheduleMap[key] = deleteField();
              slotsToDelete++;
            }
            // If key doesn't exist, don't add it (it's already null/not set)
          }
        }
      }
      await setDoc(
        availabilityDocRef,
        {
          teacherId: availability.teacherId,
          schedule: scheduleMap,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      
    } catch (error) {
      throw error;
    }
  }

  // Wallet Methods

  async getWallet(teacherId: string): Promise<Wallet | null> {
    try {
      const walletQuery = query(
        collection(db, COLLECTIONS.TEACHER_WALLETS),
        where('teacherId', '==', teacherId)
      );
      const snapshot = await getDocs(walletQuery);
      if (snapshot.empty) {
        return null;
      }
      const walletData = snapshot.docs[0].data();
      return {
        teacherId,
        balance: walletData.balance || 0,
        currency: walletData.currency || 'SAR',
        transactions: [],
        withdrawalRequests: [],
      };
    } catch (error) {
      console.error('Error getting wallet:', error);
      return null;
    }
  }

  async getTransactions(teacherId: string, limitCount: number = 10): Promise<Wallet['transactions']> {
    try {
      const transactionsQuery = query(
        collection(db, 'teacherTransactions'),
        where('teacherId', '==', teacherId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      const snapshot = await getDocs(transactionsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Wallet['transactions'];
    } catch (error) {
      console.error('Error getting transactions:', error);
      return [];
    }
  }

  async getWithdrawalRequests(teacherId: string, limitCount: number = 10): Promise<WithdrawalRequest[]> {
    try {
      const withdrawalsQuery = query(
        collection(db, 'withdrawalRequests'),
        where('teacherId', '==', teacherId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      const snapshot = await getDocs(withdrawalsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as WithdrawalRequest[];
    } catch (error) {
      console.error('Error getting withdrawal requests:', error);
      return [];
    }
  }

  async createWithdrawalRequest(request: Omit<WithdrawalRequest, 'id' | 'createdAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'withdrawalRequests'), {
        ...request,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating withdrawal request:', error);
      throw error;
    }
  }

  async updateWalletBalance(teacherId: string, newBalance: number): Promise<void> {
    try {
      const walletQuery = query(
        collection(db, COLLECTIONS.TEACHER_WALLETS),
        where('teacherId', '==', teacherId)
      );
      const snapshot = await getDocs(walletQuery);
      if (snapshot.empty) {
        // Create wallet if it doesn't exist
        await addDoc(collection(db, COLLECTIONS.TEACHER_WALLETS), {
          teacherId,
          balance: newBalance,
          currency: 'SAR',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } else {
        await updateDoc(doc(db, 'teacherWallets', snapshot.docs[0].id), {
          balance: newBalance,
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error('Error updating wallet balance:', error);
      throw error;
    }
  }

  // Support Tickets Methods

  async getSupportTickets(userId: string, limitCount: number = 10): Promise<SupportTicket[]> {
    try {
      const ticketsQuery = query(
        collection(db, COLLECTIONS.SUPPORT_TICKETS),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      const snapshot = await getDocs(ticketsQuery);
      
      const tickets = await Promise.all(
        snapshot.docs.map(async (docSnapshot) => {
          const ticketData: any = { id: docSnapshot.id, ...docSnapshot.data() };
          
          // Fetch replies
          const repliesQuery = query(
            collection(db, COLLECTIONS.SUPPORT_TICKETS, docSnapshot.id, 'replies'),
            orderBy('createdAt', 'asc')
          );
          const repliesSnapshot = await getDocs(repliesQuery);
          ticketData.replies = repliesSnapshot.docs.map(replyDoc => ({
            id: replyDoc.id,
            ...replyDoc.data(),
          }));
          
          return ticketData as SupportTicket;
        })
      );
      
      return tickets;
    } catch (error) {
      console.error('Error getting support tickets:', error);
      return [];
    }
  }

  async getSupportTicket(ticketId: string): Promise<SupportTicket | null> {
    try {
      const ticketDoc = await getDoc(doc(db, 'supportTickets', ticketId));
      if (!ticketDoc.exists()) {
        return null;
      }
      
      const ticketData: any = { id: ticketDoc.id, ...ticketDoc.data() };
      
      // Fetch replies
      const repliesQuery = query(
        collection(db, COLLECTIONS.SUPPORT_TICKETS, ticketId, 'replies'),
        orderBy('createdAt', 'asc')
      );
      const repliesSnapshot = await getDocs(repliesQuery);
      ticketData.replies = repliesSnapshot.docs.map(replyDoc => ({
        id: replyDoc.id,
        ...replyDoc.data(),
      }));
      
      return ticketData as SupportTicket;
    } catch (error) {
      console.error('Error getting support ticket:', error);
      return null;
    }
  }

  async createSupportTicket(ticket: Omit<SupportTicket, 'id' | 'replies' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.SUPPORT_TICKETS), {
        ...ticket,
        status: 'open',
        replies: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating support ticket:', error);
      throw error;
    }
  }

  async addTicketReply(ticketId: string, reply: Omit<TicketReply, 'id' | 'createdAt'>): Promise<void> {
    try {
      await addDoc(
        collection(db, COLLECTIONS.SUPPORT_TICKETS, ticketId, 'replies'),
        {
          ...reply,
          createdAt: serverTimestamp(),
        }
      );
      
      // Update ticket status and timestamp
      await updateDoc(doc(db, 'supportTickets', ticketId), {
        status: 'in_progress',
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error adding ticket reply:', error);
      throw error;
    }
  }

  async updateTicketStatus(ticketId: string, status: SupportTicket['status']): Promise<void> {
    try {
      await updateDoc(doc(db, 'supportTickets', ticketId), {
        status,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating ticket status:', error);
      throw error;
    }
  }

  /**
   * Get completed sessions count for a teacher
   */
  async getCompletedSessionsCount(teacherId: string): Promise<number> {
    try {
      const sessionsQuery = query(
        collection(db, COLLECTIONS.SESSIONS),
        where('teacherId', '==', teacherId),
        where('status', '==', 'completed')
      );
      const sessionsSnapshot = await getDocs(sessionsQuery);
      return sessionsSnapshot.size;
    } catch (error) {
      // Sessions collection might not exist or use different field names
      // Silently fail - this is expected if sessions haven't been implemented yet
      console.warn('Error getting completed sessions count:', error);
      return 0;
    }
  }

  /**
   * Subscribe to real-time updates of support tickets for a user
   * Returns unsubscribe function and calls callback with tickets data
   */
  subscribeToSupportTickets(
    userId: string,
    callback: (tickets: SupportTicket[]) => void
  ): Unsubscribe {
    const ticketsQuery = query(
      collection(db, 'supportTickets'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(ticketsQuery, async (snapshot) => {
      const tickets = await Promise.all(
        snapshot.docs.map(async (docSnapshot) => {
          const ticketData: any = { id: docSnapshot.id, ...docSnapshot.data() };
          
          // Fetch replies for each ticket
          const repliesQuery = query(
            collection(db, COLLECTIONS.SUPPORT_TICKETS, docSnapshot.id, 'replies'),
            orderBy('createdAt', 'asc')
          );
          const repliesSnapshot = await getDocs(repliesQuery);
          ticketData.replies = repliesSnapshot.docs.map(replyDoc => ({
            id: replyDoc.id,
            ...replyDoc.data(),
          }));
          
          return ticketData as SupportTicket;
        })
      );
      
      callback(tickets);
    });
  }
}

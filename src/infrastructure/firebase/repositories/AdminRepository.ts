/**
 * Admin Repository
 * Firebase implementation for admin operations
 */

import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { COLLECTIONS } from '../../../constants/firebaseCollections';
import type { TeacherApplication } from '../../../shared/types/teacher.types';

export interface UserData {
  uid: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  accountType?: string;
  createdAt?: any;
}

export class AdminRepository {
  /**
   * Get all teacher applications
   */
  async getAllTeacherApplications(): Promise<TeacherApplication[]> {
    try {
      const allAppsQuery = query(collection(db, COLLECTIONS.TEACHER_APPLICATIONS));
      const allAppsSnapshot = await getDocs(allAppsQuery);
      return allAppsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as TeacherApplication[];
    } catch (error) {
      console.error('Error fetching all teacher applications:', error);
      throw error;
    }
  }

  /**
   * Get all users with accountType 'teacher'
   */
  async getTeacherUsers(): Promise<UserData[]> {
    try {
      const usersQuery = query(
        collection(db, COLLECTIONS.USERS),
        where('accountType', '==', 'teacher')
      );
      const usersSnapshot = await getDocs(usersQuery);
      return usersSnapshot.docs.map(userDoc => ({
        uid: userDoc.id,
        ...userDoc.data(),
      })) as UserData[];
    } catch (error) {
      console.error('Error fetching teacher users:', error);
      throw error;
    }
  }

  /**
   * Update teacher application status
   */
  async updateApplicationStatus(
    applicationId: string,
    status: 'approved' | 'rejected'
  ): Promise<void> {
    try {
      await updateDoc(doc(db, 'teacherApplications', applicationId), {
        status,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error updating application status:', error);
      throw error;
    }
  }

  /**
   * Create a new teacher application (for incomplete users)
   */
  async createTeacherApplication(
    userId: string,
    applicationData: {
      fullName?: string;
      email?: string;
      phone?: string;
      subjects?: string[];
    }
  ): Promise<string> {
    try {
      const applicationDoc = {
        userId: userId,
        fullName: applicationData.fullName || '',
        email: applicationData.email || '',
        phone: applicationData.phone || '',
        subjects: applicationData.subjects || [],
        bio: '',
        hourlyRate: 0,
        currency: 'USD',
        status: TEACHER_APPLICATION_STATUS.PENDING,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isManuallyCreated: true,
      };

      const docRef = await addDoc(collection(db, COLLECTIONS.TEACHER_APPLICATIONS), applicationDoc);
      return docRef.id;
    } catch (error) {
      console.error('Error creating teacher application:', error);
      throw error;
    }
  }
}

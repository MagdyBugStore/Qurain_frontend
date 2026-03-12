/**
 * Student Repository
 * Firebase implementation for student data operations
 */

import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
  type Unsubscribe,
  type QueryConstraint,
} from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { COLLECTIONS } from '../../../constants/firebaseCollections';
import type {
  StudentTask,
  StudentSession,
  MemorizationLog,
  StudentActivity,
  TaskStatus,
  SessionStatus,
} from '../../../shared/types/student.types';

export class StudentRepository {
  /**
   * Convert Firestore timestamp to Date
   */
  private toDate(timestamp: any): Date {
    if (timestamp instanceof Timestamp) {
      return timestamp.toDate();
    }
    if (timestamp instanceof Date) {
      return timestamp;
    }
    if (typeof timestamp === 'string') {
      return new Date(timestamp);
    }
    return new Date();
  }

  /**
   * Convert Date to Firestore timestamp
   */
  private toTimestamp(date: Date | string): Timestamp {
    if (date instanceof Date) {
      return Timestamp.fromDate(date);
    }
    return Timestamp.fromDate(new Date(date));
  }

  // ==================== Student Tasks ====================

  /**
   * Get all tasks for a student
   */
  async getStudentTasks(
    studentId: string,
    status?: TaskStatus,
    limitCount?: number
  ): Promise<StudentTask[]> {
    try {
      const constraints: QueryConstraint[] = [
        where('studentId', '==', studentId),
        orderBy('dueDate', 'asc'),
      ];

      if (status) {
        constraints.unshift(where('status', '==', status));
      }

      if (limitCount) {
        constraints.push(limit(limitCount));
      }

      const tasksQuery = query(
        collection(db, COLLECTIONS.STUDENT_TASKS),
        ...constraints
      );

      const snapshot = await getDocs(tasksQuery);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        dueDate: this.toDate(doc.data().dueDate),
        completedAt: doc.data().completedAt ? this.toDate(doc.data().completedAt) : undefined,
        createdAt: this.toDate(doc.data().createdAt),
        updatedAt: this.toDate(doc.data().updatedAt),
      })) as StudentTask[];
    } catch (error) {
      console.error('Error fetching student tasks:', error);
      throw error;
    }
  }

  /**
   * Get weekly tasks for a student
   */
  async getWeeklyTasks(studentId: string): Promise<StudentTask[]> {
    try {
      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
      weekStart.setHours(0, 0, 0, 0);

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);

      const tasksQuery = query(
        collection(db, COLLECTIONS.STUDENT_TASKS),
        where('studentId', '==', studentId),
        where('dueDate', '>=', Timestamp.fromDate(weekStart)),
        where('dueDate', '<=', Timestamp.fromDate(weekEnd)),
        orderBy('dueDate', 'asc')
      );

      const snapshot = await getDocs(tasksQuery);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        dueDate: this.toDate(doc.data().dueDate),
        completedAt: doc.data().completedAt ? this.toDate(doc.data().completedAt) : undefined,
        createdAt: this.toDate(doc.data().createdAt),
        updatedAt: this.toDate(doc.data().updatedAt),
      })) as StudentTask[];
    } catch (error) {
      console.error('Error fetching weekly tasks:', error);
      throw error;
    }
  }

  /**
   * Create a new task
   */
  async createTask(task: Omit<StudentTask, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const taskDoc = {
        ...task,
        dueDate: this.toTimestamp(task.dueDate),
        completedAt: task.completedAt ? this.toTimestamp(task.completedAt) : undefined,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, COLLECTIONS.STUDENT_TASKS), taskDoc);
      return docRef.id;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  /**
   * Update task status
   */
  async updateTaskStatus(taskId: string, status: TaskStatus): Promise<void> {
    try {
      const updateData: any = {
        status,
        updatedAt: Timestamp.now(),
      };

      if (status === 'completed') {
        updateData.completedAt = Timestamp.now();
      }

      await updateDoc(doc(db, COLLECTIONS.STUDENT_TASKS, taskId), updateData);
    } catch (error) {
      console.error('Error updating task status:', error);
      throw error;
    }
  }

  /**
   * Subscribe to student tasks
   */
  subscribeToStudentTasks(
    studentId: string,
    callback: (tasks: StudentTask[]) => void
  ): Unsubscribe {
    const tasksQuery = query(
      collection(db, COLLECTIONS.STUDENT_TASKS),
      where('studentId', '==', studentId),
      orderBy('dueDate', 'asc')
    );

    return onSnapshot(
      tasksQuery,
      (snapshot) => {
        const tasks = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          dueDate: this.toDate(doc.data().dueDate),
          completedAt: doc.data().completedAt ? this.toDate(doc.data().completedAt) : undefined,
          createdAt: this.toDate(doc.data().createdAt),
          updatedAt: this.toDate(doc.data().updatedAt),
        })) as StudentTask[];
        callback(tasks);
      },
      (error) => {
        console.error('Error in tasks subscription:', error);
      }
    );
  }

  // ==================== Student Sessions ====================

  /**
   * Get upcoming session for a student
   */
  async getUpcomingSession(studentId: string): Promise<StudentSession | null> {
    try {
      const now = Timestamp.now();
      const sessionsQuery = query(
        collection(db, COLLECTIONS.SESSIONS),
        where('studentId', '==', studentId),
        where('status', '==', 'scheduled'),
        where('scheduledDate', '>=', now),
        orderBy('scheduledDate', 'asc'),
        limit(1)
      );

      const snapshot = await getDocs(sessionsQuery);
      if (snapshot.empty) {
        return null;
      }

      const docData = snapshot.docs[0].data();
      return {
        id: snapshot.docs[0].id,
        ...docData,
        scheduledDate: this.toDate(docData.scheduledDate),
        createdAt: this.toDate(docData.createdAt),
        updatedAt: this.toDate(docData.updatedAt),
      } as StudentSession;
    } catch (error) {
      console.error('Error fetching upcoming session:', error);
      throw error;
    }
  }

  /**
   * Get sessions for a student
   */
  async getStudentSessions(
    studentId: string,
    status?: SessionStatus,
    limitCount?: number
  ): Promise<StudentSession[]> {
    try {
      const constraints: QueryConstraint[] = [
        where('studentId', '==', studentId),
        orderBy('scheduledDate', 'desc'),
      ];

      if (status) {
        constraints.unshift(where('status', '==', status));
      }

      if (limitCount) {
        constraints.push(limit(limitCount));
      }

      const sessionsQuery = query(
        collection(db, COLLECTIONS.SESSIONS),
        ...constraints
      );

      const snapshot = await getDocs(sessionsQuery);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        scheduledDate: this.toDate(doc.data().scheduledDate),
        createdAt: this.toDate(doc.data().createdAt),
        updatedAt: this.toDate(doc.data().updatedAt),
      })) as StudentSession[];
    } catch (error) {
      console.error('Error fetching student sessions:', error);
      throw error;
    }
  }

  /**
   * Subscribe to upcoming session
   */
  subscribeToUpcomingSession(
    studentId: string,
    callback: (session: StudentSession | null) => void
  ): Unsubscribe {
    const now = Timestamp.now();
    const sessionsQuery = query(
      collection(db, COLLECTIONS.SESSIONS),
      where('studentId', '==', studentId),
      where('status', '==', 'scheduled'),
      where('scheduledDate', '>=', now),
      orderBy('scheduledDate', 'asc'),
      limit(1)
    );

    return onSnapshot(
      sessionsQuery,
      (snapshot) => {
        if (snapshot.empty) {
          callback(null);
          return;
        }

        const docData = snapshot.docs[0].data();
        const session = {
          id: snapshot.docs[0].id,
          ...docData,
          scheduledDate: this.toDate(docData.scheduledDate),
          createdAt: this.toDate(docData.createdAt),
          updatedAt: this.toDate(docData.updatedAt),
        } as StudentSession;
        callback(session);
      },
      (error) => {
        console.error('Error in upcoming session subscription:', error);
        callback(null);
      }
    );
  }

  // ==================== Memorization Logs ====================

  /**
   * Get memorization logs for a student
   */
  async getMemorizationLogs(
    studentId: string,
    limitCount?: number
  ): Promise<MemorizationLog[]> {
    try {
      const constraints: QueryConstraint[] = [
        where('studentId', '==', studentId),
        orderBy('loggedDate', 'desc'),
      ];

      if (limitCount) {
        constraints.push(limit(limitCount));
      }

      const logsQuery = query(
        collection(db, COLLECTIONS.MEMORIZATION_LOGS),
        ...constraints
      );

      const snapshot = await getDocs(logsQuery);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        loggedDate: this.toDate(doc.data().loggedDate),
        createdAt: this.toDate(doc.data().createdAt),
      })) as MemorizationLog[];
    } catch (error) {
      console.error('Error fetching memorization logs:', error);
      throw error;
    }
  }

  /**
   * Create memorization log
   */
  async createMemorizationLog(
    log: Omit<MemorizationLog, 'id' | 'createdAt'>
  ): Promise<string> {
    try {
      const logDoc = {
        ...log,
        loggedDate: this.toTimestamp(log.loggedDate),
        createdAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, COLLECTIONS.MEMORIZATION_LOGS), logDoc);
      return docRef.id;
    } catch (error) {
      console.error('Error creating memorization log:', error);
      throw error;
    }
  }

  // ==================== Student Activities ====================

  /**
   * Get recent activities for a student
   */
  async getStudentActivities(
    studentId: string,
    limitCount: number = 10
  ): Promise<StudentActivity[]> {
    try {
      const activitiesQuery = query(
        collection(db, COLLECTIONS.STUDENT_ACTIVITIES),
        where('studentId', '==', studentId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(activitiesQuery);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: this.toDate(doc.data().createdAt),
      })) as StudentActivity[];
    } catch (error) {
      console.error('Error fetching student activities:', error);
      throw error;
    }
  }

  /**
   * Create activity
   */
  async createActivity(
    activity: Omit<StudentActivity, 'id' | 'createdAt'>
  ): Promise<string> {
    try {
      const activityDoc = {
        ...activity,
        createdAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, COLLECTIONS.STUDENT_ACTIVITIES), activityDoc);
      return docRef.id;
    } catch (error) {
      console.error('Error creating activity:', error);
      throw error;
    }
  }

  // ==================== Student Stats ====================

  /**
   * Get student statistics
   */
  async getStudentStats(studentId: string): Promise<{
    totalSessions: number;
    completedSessions: number;
    upcomingSessions: number;
    memorizedParts: number;
    completedTasks: number;
    pendingTasks: number;
  }> {
    try {
      // Get sessions
      const allSessions = await this.getStudentSessions(studentId);
      const completedSessions = allSessions.filter((s) => s.status === 'completed');
      const upcomingSessions = allSessions.filter((s) => s.status === 'scheduled');

      // Get tasks
      const allTasks = await this.getStudentTasks(studentId);
      const completedTasks = allTasks.filter((t) => t.status === 'completed');
      const pendingTasks = allTasks.filter(
        (t) => t.status === 'pending' || t.status === 'in_progress'
      );

      // Get memorization logs
      const logs = await this.getMemorizationLogs(studentId);
      const memorizedParts = new Set(logs.map((log) => log.juz).filter(Boolean)).size;

      return {
        totalSessions: allSessions.length,
        completedSessions: completedSessions.length,
        upcomingSessions: upcomingSessions.length,
        memorizedParts,
        completedTasks: completedTasks.length,
        pendingTasks: pendingTasks.length,
      };
    } catch (error) {
      console.error('Error fetching student stats:', error);
      throw error;
    }
  }
}

/**
 * Admin Service
 * Business logic layer for admin operations
 */

import { adminApi, type UserData, type AdminSessionResponse, type AdminSubscriptionResponse } from './adminApi';
import { TEACHER_APPLICATION_STATUS } from '../constants/status';
import type { TeacherApplication } from '../shared/types/teacher.types';
import type { StudentSession } from '../shared/types/student.types';
import type { StudentSubscription } from './subscriptionService';

export interface IncompleteApplication {
  id: string;
  userId: string;
  fullName: string;
  email?: string;
  phone?: string;
  subjects: string[];
  status: 'pending';
  createdAt?: any;
  isIncomplete: true;
}

export interface ApplicationFilter {
  status?: 'all' | 'pending' | 'approved' | 'rejected';
  includeIncomplete?: boolean;
}

export class AdminService {
  constructor() {
    // No repository needed - using API service directly
  }

  /**
   * Get all teacher applications with optional filtering
   * Note: When filter.status is 'all', returns all applications without filtering (for client-side filtering)
   */
  async getTeacherApplications(filter: ApplicationFilter = {}): Promise<TeacherApplication[]> {
    try {
      const allApps = await adminApi.getTeacherApplications();

      // Convert API response to TeacherApplication format
      const convertedApps: TeacherApplication[] = allApps.map(app => ({
        id: app.id,
        userId: app.userId,
        fullName: app.fullName,
        email: app.email,
        phone: app.phone,
        avatar: (app as any).avatar,
        subjects: app.subjects || [],
        status: app.status || 'pending',
        createdAt: app.createdAt ? (typeof app.createdAt === 'string' ? new Date(app.createdAt) : app.createdAt) : undefined,
        isIncomplete: app.isIncomplete,
      }));

      // If status is 'all', return all apps without filtering (for client-side filtering)
      if (filter.status === 'all') {
        // Add incomplete applications if requested
        let allAppsWithIncomplete = convertedApps;
        if (filter.includeIncomplete) {
          const incompleteApps = await this.getIncompleteApplications(convertedApps);
          allAppsWithIncomplete = [...convertedApps, ...incompleteApps];
        }

        // Sort by creation date (newest first)
        allAppsWithIncomplete.sort((a, b) => {
          const dateA = a.createdAt instanceof Date ? a.createdAt : (a.createdAt ? new Date(a.createdAt as any) : new Date(0));
          const dateB = b.createdAt instanceof Date ? b.createdAt : (b.createdAt ? new Date(b.createdAt as any) : new Date(0));
          return dateB.getTime() - dateA.getTime();
        });

        return allAppsWithIncomplete;
      }

      // Filter by status (only if not 'all')
      let filteredApps = convertedApps;
      if (filter.status) {
        // Check if status is a specific status (not 'all')
        const specificStatuses: Array<'pending' | 'approved' | 'rejected'> = ['pending', 'approved', 'rejected'];
        if (specificStatuses.includes(filter.status as 'pending' | 'approved' | 'rejected')) {
          const statusFilter = filter.status as 'pending' | 'approved' | 'rejected';
          filteredApps = convertedApps.filter(app => {
            const status = app.status || 'pending';
            return status === statusFilter;
          });
        }
      }

      // Add incomplete applications if requested
      if (filter.includeIncomplete && (filter.status === TEACHER_APPLICATION_STATUS.PENDING || !filter.status)) {
        const incompleteApps = await this.getIncompleteApplications(convertedApps);
        filteredApps = [...filteredApps, ...incompleteApps];
      }

      // Sort by creation date (newest first)
      filteredApps.sort((a, b) => {
        const dateA = a.createdAt instanceof Date ? a.createdAt : (a.createdAt ? new Date(a.createdAt as any) : new Date(0));
        const dateB = b.createdAt instanceof Date ? b.createdAt : (b.createdAt ? new Date(b.createdAt as any) : new Date(0));
        return dateB.getTime() - dateA.getTime();
      });

      return filteredApps;
    } catch (error) {
      console.error('Error fetching teacher applications:', error);
      throw error;
    }
  }

  /**
   * Get incomplete teacher applications (users with teacher accountType but no application)
   * Note: This feature may not be available via backend API yet, so we'll return empty array for now
   */
  private async getIncompleteApplications(existingApps: TeacherApplication[]): Promise<IncompleteApplication[]> {
    try {
      // TODO: Backend API doesn't have endpoint for getting teacher users without applications yet
      // For now, return empty array - this feature can be implemented when backend supports it
      // const teacherUsers = await adminApi.getTeacherUsers();
      // ... rest of logic
      return [];
    } catch (error) {
      console.error('Error getting incomplete applications:', error);
      throw error;
    }
  }

  /**
   * Update teacher application status
   */
  async updateApplicationStatus(
    applicationId: string,
    newStatus: typeof TEACHER_APPLICATION_STATUS.APPROVED | typeof TEACHER_APPLICATION_STATUS.REJECTED,
    userApp?: TeacherApplication
  ): Promise<string> {
    try {
      // Check if it's an incomplete application (temp ID)
      const isTemp = applicationId.startsWith('temp_');

      if (isTemp) {
        // For incomplete applications, we need the userId
        const userId = applicationId.replace('temp_', '');

        if (!userApp) {
          throw new Error('User application data is required for incomplete applications');
        }

        // TODO: Backend API doesn't support creating applications for incomplete users yet
        // For now, we'll try to approve/reject using the userId directly
        // This may need backend support for creating applications on-the-fly
        if (newStatus === TEACHER_APPLICATION_STATUS.APPROVED) {
          await adminApi.approveTeacher(userId);
        } else {
          await adminApi.rejectTeacher(userId);
        }

        // Return a new ID (backend should return the created application ID)
        // For now, return the userId as the application ID
        return userId;
      } else {
        // Update existing application using teacherId (which should be the userId)
        // Backend expects teacherId, which should be the userId from the application
        const teacherId = userApp?.userId || applicationId;
        
        if (newStatus === TEACHER_APPLICATION_STATUS.APPROVED) {
          await adminApi.approveTeacher(teacherId);
        } else {
          await adminApi.rejectTeacher(teacherId);
        }
        
        return applicationId;
      }
    } catch (error) {
      console.error('Error updating application status:', error);
      throw error;
    }
  }

  /**
   * Get all students
   */
  async getAllStudents(): Promise<UserData[]> {
    try {
      return await adminApi.getStudents();
    } catch (error) {
      console.error('Error fetching students:', error);
      throw error;
    }
  }

  /**
   * Get all users (students and teachers)
   */
  async getAllUsers(): Promise<UserData[]> {
    try {
      return await adminApi.getAllUsers();
    } catch (error) {
      console.error('Error fetching all users:', error);
      throw error;
    }
  }

  /**
   * Delete user and all related data (admin only)
   */
  async deleteUser(userId: string): Promise<void> {
    try {
      await adminApi.deleteUser(userId);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  /**
   * Get all sessions with optional filters (for admin)
   */
  async getAllSessions(filters?: {
    status?: 'scheduled' | 'completed' | 'cancelled' | 'in_progress';
    teacherId?: string;
    studentId?: string;
  }): Promise<StudentSession[]> {
    try {
      const sessions = await adminApi.getSessions(filters);
      
      // Convert API response to StudentSession format
      return sessions.map(session => ({
        id: session.id,
        studentId: session.studentId,
        teacherId: session.teacherId,
        teacherName: session.teacherName || 'Unknown',
        teacherPhoto: session.teacherPhoto || '',
        title: session.title,
        description: session.description,
        scheduledDate: session.scheduledDate ? (typeof session.scheduledDate === 'string' ? new Date(session.scheduledDate) : session.scheduledDate) : new Date(),
        duration: session.duration,
        status: session.status as 'scheduled' | 'completed' | 'cancelled' | 'in_progress',
        sessionType: session.sessionType,
        subscriptionId: session.subscriptionId,
        meetingLink: session.meetingLink,
        notes: session.notes,
        createdAt: session.createdAt ? (typeof session.createdAt === 'string' ? new Date(session.createdAt) : session.createdAt) : new Date(),
        updatedAt: session.updatedAt ? (typeof session.updatedAt === 'string' ? new Date(session.updatedAt) : session.updatedAt) : new Date(),
      }));
    } catch (error) {
      console.error('Error fetching sessions:', error);
      throw error;
    }
  }

  /**
   * Delete a session (for admin)
   */
  async deleteSession(sessionId: string): Promise<void> {
    try {
      await adminApi.deleteSession(sessionId);
    } catch (error) {
      console.error('Error deleting session:', error);
      throw error;
    }
  }

  /**
   * Get all subscriptions with optional filters (for admin)
   */
  async getAllSubscriptions(filters?: {
    status?: 'active' | 'pending' | 'cancelled';
    teacherId?: string;
    studentId?: string;
  }): Promise<StudentSubscription[]> {
    try {
      const subscriptions = await adminApi.getSubscriptions(filters);
      
      // Convert API response to StudentSubscription format
      return subscriptions.map(sub => ({
        id: sub.id,
        studentId: sub.studentId,
        studentName: sub.studentName,
        studentEmail: sub.studentEmail,
        teacherId: sub.teacherId,
        teacherName: sub.teacherName,
        planId: sub.planId,
        planLabel: sub.planLabel,
        sessionsPerMonth: sub.sessionsPerMonth,
        weeklyFrequency: sub.weeklyFrequency,
        durationMinutes: sub.durationMinutes,
        weeklySlots: sub.weeklySlots || [],
        monthlyPrice: sub.monthlyPrice,
        currency: sub.currency,
        status: sub.status,
        startDate: sub.startDate ? (typeof sub.startDate === 'string' ? new Date(sub.startDate) : sub.startDate) : undefined,
        nextRenewalDate: sub.nextRenewalDate ? (typeof sub.nextRenewalDate === 'string' ? new Date(sub.nextRenewalDate) : sub.nextRenewalDate) : undefined,
        createdAt: sub.createdAt ? (typeof sub.createdAt === 'string' ? new Date(sub.createdAt) : sub.createdAt) : undefined,
        updatedAt: sub.updatedAt ? (typeof sub.updatedAt === 'string' ? new Date(sub.updatedAt) : sub.updatedAt) : undefined,
      }));
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      throw error;
    }
  }

  /**
   * Update subscription status (for admin)
   */
  async updateSubscriptionStatus(subscriptionId: string, status: 'active' | 'pending' | 'cancelled'): Promise<void> {
    try {
      await adminApi.updateSubscriptionStatus(subscriptionId, status);
    } catch (error) {
      console.error('Error updating subscription status:', error);
      throw error;
    }
  }

  /**
   * Delete a subscription (for admin)
   */
  async deleteSubscription(subscriptionId: string): Promise<void> {
    try {
      await adminApi.deleteSubscription(subscriptionId);
    } catch (error) {
      console.error('Error deleting subscription:', error);
      throw error;
    }
  }

  /**
   * Get KPI data for dashboard
   * Calculates KPIs from existing data sources
   */
  async getKPIData(): Promise<{
    pendingApplications: number;
    activeTeachers: number;
    activeStudents: number;
    revenue: number;
    revenueChange?: string;
    teachersChange?: string;
    studentsChange?: string;
  }> {
    try {
      // Try to get summary from backend first
      const summary = await adminApi.getSummaryReport();
      
      // If backend provides summary, use it (but still calculate from data if needed)
      let activeTeachers = summary.activeTeachers;
      let activeStudents = summary.activeStudents;
      let revenue = summary.totalRevenue || 0;

      // Fetch all teachers to count active ones
      if (activeTeachers === undefined) {
        try {
          const allTeachers = await adminApi.getTeacherApplications();
          activeTeachers = allTeachers.filter(t => t.status === 'approved').length;
        } catch (error) {
          console.warn('Error fetching teachers for KPI:', error);
          activeTeachers = 0;
        }
      }

      // Fetch all students to count active ones
      if (activeStudents === undefined) {
        try {
          const allStudents = await adminApi.getStudents();
          activeStudents = allStudents.length;
        } catch (error) {
          console.warn('Error fetching students for KPI:', error);
          activeStudents = 0;
        }
      }

      // Calculate revenue from active subscriptions
      if (revenue === 0 || revenue === undefined) {
        try {
          const activeSubscriptions = await adminApi.getSubscriptions({ status: 'active' });
          revenue = activeSubscriptions.reduce((sum, sub) => {
            const price = typeof sub.monthlyPrice === 'number' ? sub.monthlyPrice : 0;
            return sum + price;
          }, 0);
        } catch (error) {
          console.warn('Error fetching subscriptions for revenue calculation:', error);
          revenue = 0;
        }
      }

      // Get pending applications count
      let pendingApplications = 0;
      try {
        const pendingApps = await this.getTeacherApplications({ status: 'pending' });
        pendingApplications = pendingApps.length;
      } catch (error) {
        console.warn('Error fetching pending applications for KPI:', error);
        pendingApplications = 0;
      }

      return {
        pendingApplications,
        activeTeachers: activeTeachers || 0,
        activeStudents: activeStudents || 0,
        revenue: revenue || 0,
        // TODO: Calculate changes when we have historical data
        revenueChange: undefined,
        teachersChange: undefined,
        studentsChange: undefined,
      };
    } catch (error) {
      console.error('Error getting KPI data:', error);
      // Return default values on error
      return {
        pendingApplications: 0,
        activeTeachers: 0,
        activeStudents: 0,
        revenue: 0,
      };
    }
  }
}

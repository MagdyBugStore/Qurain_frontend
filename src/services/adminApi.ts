/**
 * Admin API Service
 * Backend API client for admin operations
 */

import { apiClient } from '../lib/apiClient';
import type { TeacherApplication } from '../shared/types/teacher.types';
import type { StudentSession } from '../shared/types/student.types';
import type { StudentSubscription } from './subscriptionService';

export interface UserData {
  uid: string;
  id?: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  accountType?: string;
  role?: string;
  avatar?: string;
  photoURL?: string;
  preferredLanguage?: string;
  isActive?: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  profileCompletion?: number;
  // Student-specific fields
  timezone?: string;
  notes?: string;
  tasks?: any[];
  activities?: any[];
  memorizationLogs?: any[];
  // Teacher-specific fields
  approvalStatus?: string;
  bio?: string;
  experienceYears?: number;
  ratingAvg?: number;
  ratingCount?: number;
  qualifications?: any[];
  ijazahs?: any[];
  languages?: string[];
  sessionPrice?: number;
}

export interface TeacherApplicationResponse {
  id: string;
  userId?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  subjects?: string[];
  status?: 'pending' | 'approved' | 'rejected';
  createdAt?: string | Date;
  isIncomplete?: boolean;
}

export interface AdminSessionResponse {
  id: string;
  studentId: string;
  teacherId: string;
  teacherName?: string;
  teacherPhoto?: string;
  title: string;
  description?: string;
  scheduledDate: string | Date;
  duration: number;
  status: 'scheduled' | 'completed' | 'cancelled' | 'in_progress';
  sessionType?: 'memorization' | 'recitation' | 'review' | 'test';
  subscriptionId?: string;
  meetingLink?: string;
  notes?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface AdminSubscriptionResponse {
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
  weeklySlots?: Array<{ dayIndex: number; time: string }>;
  monthlyPrice: number;
  currency: string;
  status: 'active' | 'pending' | 'cancelled';
  startDate?: string | Date;
  nextRenewalDate?: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export const adminApi = {
  /**
   * Get all teacher applications
   * Maps to: GET /admin/teachers/all
   * Returns all teachers regardless of status - filtering is done client-side
   */
  async getTeacherApplications(): Promise<TeacherApplicationResponse[]> {
    try {
      // Backend endpoint: GET /admin/teachers/all
      const data = await apiClient.get<{ teachers: TeacherApplicationResponse[] }>('/admin/teachers/all');
      return data.teachers || [];
    } catch (error) {
      // If backend returns 404 or error, return empty array instead of throwing
      // This allows the app to continue working even if backend endpoint is not fully implemented
      if ((error as any)?.message?.includes('404') || (error as any)?.message?.includes('Not Found')) {
        console.warn('Admin endpoint not fully implemented yet, returning empty array');
        return [];
      }
      console.error('Error fetching teacher applications:', error);
      throw error;
    }
  },

  /**
   * Approve teacher application
   * Maps to: POST /admin/teachers/:teacherId/approve
   */
  async approveTeacher(teacherId: string): Promise<void> {
    try {
      await apiClient.post(`/admin/teachers/${teacherId}/approve`);
    } catch (error) {
      console.error('Error approving teacher:', error);
      throw error;
    }
  },

  /**
   * Reject teacher application
   * Maps to: POST /admin/teachers/:teacherId/reject
   */
  async rejectTeacher(teacherId: string, reason?: string): Promise<void> {
    try {
      await apiClient.post(`/admin/teachers/${teacherId}/reject`, { reason });
    } catch (error) {
      console.error('Error rejecting teacher:', error);
      throw error;
    }
  },

  /**
   * Get all students
   * Maps to: GET /admin/students
   */
  async getStudents(): Promise<UserData[]> {
    try {
      const data = await apiClient.get<{ students: UserData[] }>('/admin/students');
      return data.students || [];
    } catch (error) {
      console.error('Error fetching students:', error);
      throw error;
    }
  },

  /**
   * Get all users (students, teachers, and admins)
   * Maps to: GET /admin/users
   */
  async getAllUsers(): Promise<UserData[]> {
    try {
      const data = await apiClient.get<{ users: UserData[] }>('/admin/users');
      return data.users || [];
    } catch (error) {
      console.error('Error fetching all users:', error);
      throw error;
    }
  },

  /**
   * Get all sessions (for admin)
   * Maps to: GET /admin/reports/sessions
   * Note: Backend endpoint may support query params for filtering
   */
  async getSessions(filters?: {
    status?: 'scheduled' | 'completed' | 'cancelled' | 'in_progress';
    teacherId?: string;
    studentId?: string;
  }): Promise<AdminSessionResponse[]> {
    try {
      // Build query string if filters provided
      const queryParams = new URLSearchParams();
      if (filters?.status) queryParams.append('status', filters.status);
      if (filters?.teacherId) queryParams.append('teacherId', filters.teacherId);
      if (filters?.studentId) queryParams.append('studentId', filters.studentId);

      const queryString = queryParams.toString();
      const endpoint = `/admin/reports/sessions${queryString ? `?${queryString}` : ''}`;
      
      const data = await apiClient.get<{ sessions: AdminSessionResponse[] }>(endpoint);
      return data.sessions || [];
    } catch (error) {
      console.error('Error fetching sessions:', error);
      throw error;
    }
  },

  /**
   * Get all subscriptions (for admin)
   * Maps to: GET /admin/subscriptions
   * Note: Backend endpoint may support query params for filtering
   */
  async getSubscriptions(filters?: {
    status?: 'active' | 'pending' | 'cancelled';
    teacherId?: string;
    studentId?: string;
  }): Promise<AdminSubscriptionResponse[]> {
    try {
      // Build query string if filters provided
      const queryParams = new URLSearchParams();
      if (filters?.status) queryParams.append('status', filters.status);
      if (filters?.teacherId) queryParams.append('teacherId', filters.teacherId);
      if (filters?.studentId) queryParams.append('studentId', filters.studentId);

      const queryString = queryParams.toString();
      const endpoint = `/admin/subscriptions${queryString ? `?${queryString}` : ''}`;
      
      const data = await apiClient.get<{ subscriptions: AdminSubscriptionResponse[] }>(endpoint);
      return data.subscriptions || [];
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      throw error;
    }
  },

  /**
   * Delete a session (for admin)
   * Maps to: DELETE /sessions/:sessionId (if admin has permission)
   * Note: This may need to be implemented in backend if not already available
   */
  async deleteSession(sessionId: string): Promise<void> {
    try {
      // TODO: Check if backend has DELETE /admin/sessions/:sessionId or DELETE /sessions/:sessionId
      // For now, we'll try the sessions endpoint
      await apiClient.post(`/sessions/${sessionId}/cancel`, { adminAction: true });
    } catch (error) {
      console.error('Error deleting session:', error);
      throw error;
    }
  },

  /**
   * Update subscription status (for admin)
   * Maps to: PATCH /admin/subscriptions/:subscriptionId/status
   * Note: This may need to be implemented in backend if not already available
   */
  async updateSubscriptionStatus(subscriptionId: string, status: 'active' | 'pending' | 'cancelled'): Promise<void> {
    try {
      // TODO: Check if backend has PATCH /admin/subscriptions/:subscriptionId
      // For now, we'll try a generic update endpoint
      await apiClient.patch(`/admin/subscriptions/${subscriptionId}`, { status });
    } catch (error) {
      console.error('Error updating subscription status:', error);
      throw error;
    }
  },

  /**
   * Delete a subscription (for admin)
   * Maps to: DELETE /admin/subscriptions/:subscriptionId
   */
  async deleteSubscription(subscriptionId: string): Promise<void> {
    try {
      await apiClient.delete(`/admin/subscriptions/${subscriptionId}`);
    } catch (error) {
      console.error('Error deleting subscription:', error);
      throw error;
    }
  },

  /**
   * Delete user and all related data (admin only)
   * Maps to: DELETE /admin/users/:userId
   */
  async deleteUser(userId: string): Promise<void> {
    try {
      await apiClient.delete(`/admin/users/${userId}`);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  /**
   * Get summary report (KPI data)
   * Maps to: GET /admin/reports/summary
   * Note: Backend endpoint may return summary metrics, or we calculate from existing data
   */
  async getSummaryReport(): Promise<{
    totalSessions?: number;
    totalRevenue?: number;
    activeTeachers?: number;
    activeStudents?: number;
  }> {
    try {
      const data = await apiClient.get<{
        summary: {
          totalSessions?: number;
          totalRevenue?: number;
          activeTeachers?: number;
          activeStudents?: number;
        };
      }>('/admin/reports/summary');
      return data.summary || {};
    } catch (error) {
      // If backend endpoint is not implemented, return empty object
      // We'll calculate KPIs from other endpoints instead
      if ((error as any)?.message?.includes('404') || (error as any)?.message?.includes('Not Found')) {
        console.warn('Summary report endpoint not fully implemented yet, will calculate from other data');
        return {};
      }
      console.error('Error fetching summary report:', error);
      throw error;
    }
  },
};

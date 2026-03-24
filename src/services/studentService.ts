/**
 * Student Service
 * Business logic layer for student operations
 * Uses backend API
 */

import { apiClient } from '../lib/apiClient';
import type {
  StudentTask,
  StudentSession,
  MemorizationLog,
  StudentActivity,
  TaskStatus,
} from '../shared/types/student.types';

export class StudentService {
  constructor() {}

  private mapTask(task: any): StudentTask {
    const now = new Date().toISOString();
    return {
      id: task?._id?.toString?.() || task?.id || '',
      studentId: task?.studentId?.toString?.() || task?.studentId || '',
      title: task?.title || '',
      description: task?.description || '',
      status: (task?.status || 'pending') as TaskStatus,
      dueDate: task?.dueDate || now,
      completedAt: task?.completedAt || undefined,
      teacherId: task?.teacherId?.toString?.() || task?.teacherId || undefined,
      teacherName: task?.teacherName || undefined,
      createdAt: task?.createdAt || now,
      updatedAt: task?.updatedAt || now,
    };
  }

  private mapSession(session: any): StudentSession {
    const teacherUser = session?.teacherId?.userId || {};
    const startDate = session?.scheduledStart || session?.scheduledDate || new Date().toISOString();
    const endDate = session?.scheduledEnd || null;
    const durationMinutes =
      endDate && startDate
        ? Math.max(
            1,
            Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / 60000)
          )
        : session?.duration || 60;

    const rawStatus = session?.status || 'scheduled';
    const mappedStatus =
      rawStatus === 'started'
        ? 'in_progress'
        : rawStatus === 'rescheduled' || rawStatus === 'no_show'
          ? 'cancelled'
          : rawStatus;

    return {
      id: session?._id?.toString?.() || session?.id || '',
      studentId: session?.studentId?.toString?.() || session?.studentId || '',
      teacherId: session?.teacherId?._id?.toString?.() || session?.teacherId?.toString?.() || '',
      teacherName: teacherUser?.fullName || session?.teacherName || 'المعلم',
      teacherPhoto: teacherUser?.avatar || '',
      title: session?.title || 'جلسة قرآن',
      description: session?.description || '',
      scheduledDate: startDate,
      duration: durationMinutes,
      status: mappedStatus as StudentSession['status'],
      sessionType: (session?.sessionType || 'memorization') as StudentSession['sessionType'],
      subscriptionId: session?.subscriptionId?.toString?.() || session?.subscriptionId || undefined,
      meetingLink: session?.videoJoinUrlStudent || session?.meetingLink || undefined,
      notes: session?.notes || undefined,
      createdAt: session?.createdAt || startDate,
      updatedAt: session?.updatedAt || startDate,
    };
  }

  private mapMemorizationLog(log: any): MemorizationLog {
    const now = new Date().toISOString();
    const verses = typeof log?.verses === 'string' ? log.verses : '';
    const match = verses.match(/(\d+)\s*-\s*(\d+)/);
    return {
      id: log?._id?.toString?.() || log?.id || '',
      studentId: log?.studentId?.toString?.() || log?.studentId || '',
      surah: log?.surah || '',
      description: log?.notes || '',
      fromAyah: match ? Number(match[1]) : undefined,
      toAyah: match ? Number(match[2]) : undefined,
      juz: typeof log?.juz === 'number' ? log.juz : undefined,
      grade: log?.grade || undefined,
      teacherId: log?.teacherId?.toString?.() || undefined,
      teacherName: log?.teacherName || undefined,
      loggedDate: log?.loggedDate || now,
      createdAt: log?.createdAt || now,
    };
  }

  private mapActivity(activity: any): StudentActivity {
    return {
      id: activity?._id?.toString?.() || activity?.id || '',
      studentId: activity?.studentId?.toString?.() || activity?.studentId || '',
      type: (activity?.type || 'session_booked') as StudentActivity['type'],
      title: activity?.title || '',
      description: activity?.description || '',
      metadata: activity?.metadata || {},
      createdAt: activity?.createdAt || new Date().toISOString(),
    };
  }

  /**
   * Get weekly tasks for student
   */
  async getWeeklyTasks(studentId: string): Promise<StudentTask[]> {
    if (!studentId) return [];
    const data = await apiClient.get<{ tasks: any[] }>('/students/tasks/weekly');
    return (data.tasks || []).map((task) => this.mapTask(task));
  }

  /**
   * Get all tasks for student
   */
  async getTasks(studentId: string, status?: TaskStatus): Promise<StudentTask[]> {
    if (!studentId) return [];
    const query = status ? `?status=${encodeURIComponent(status)}` : '';
    const data = await apiClient.get<{ tasks: any[] }>(`/students/tasks${query}`);
    return (data.tasks || []).map((task) => this.mapTask(task));
  }

  /**
   * Create a new task
   */
  async createTask(task: Omit<StudentTask, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    throw new Error('StudentService.createTask: Firestore removed - use backend API instead');
  }

  /**
   * Update task status
   */
  async updateTaskStatus(taskId: string, status: TaskStatus): Promise<void> {
    await apiClient.patch(`/students/tasks/${taskId}/status`, { status });
  }

  /**
   * Get upcoming session
   */
  async getUpcomingSession(studentId: string): Promise<StudentSession | null> {
    if (!studentId) return null;
    const data = await apiClient.get<{ session: any | null }>('/students/sessions/upcoming');
    if (!data.session) return null;
    return this.mapSession(data.session);
  }

  /**
   * Get student sessions
   */
  async getSessions(
    studentId: string,
    status?: 'scheduled' | 'completed' | 'cancelled'
  ): Promise<StudentSession[]> {
    if (!studentId) return [];
    const query = status ? `?status=${encodeURIComponent(status)}` : '';
    const data = await apiClient.get<{ sessions: any[] }>(`/students/sessions${query}`);
    return (data.sessions || []).map((session) => this.mapSession(session));
  }

  /**
   * Get all sessions with optional filters (for admin)
   */
  async getAllSessions(
    filters?: {
      status?: 'scheduled' | 'completed' | 'cancelled';
      teacherId?: string;
      studentId?: string;
    },
    limitCount?: number
  ): Promise<StudentSession[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.teacherId) params.set('teacherId', filters.teacherId);
    if (filters?.studentId) params.set('studentId', filters.studentId);
    if (limitCount) params.set('limit', String(limitCount));
    const query = params.toString() ? `?${params.toString()}` : '';
    const data = await apiClient.get<{ sessions: any[] }>(`/students/sessions${query}`);
    return (data.sessions || []).map((session) => this.mapSession(session));
  }

  /**
   * Delete a session
   */
  async deleteSession(sessionId: string): Promise<void> {
    throw new Error('StudentService.deleteSession: Firestore removed - use backend API instead');
  }

  /**
   * Get memorization logs
   */
  async getMemorizationLogs(studentId: string, limit?: number): Promise<MemorizationLog[]> {
    if (!studentId) return [];
    const query = limit ? `?limit=${encodeURIComponent(String(limit))}` : '';
    const data = await apiClient.get<{ logs: any[] }>(`/students/memorization-logs${query}`);
    return (data.logs || []).map((log) => this.mapMemorizationLog(log));
  }

  /**
   * Create memorization log
   */
  async createMemorizationLog(
    log: Omit<MemorizationLog, 'id' | 'createdAt'>
  ): Promise<string> {
    throw new Error('StudentService.createMemorizationLog: Firestore removed - use backend API instead');
  }

  /**
   * Get recent activities
   */
  async getActivities(studentId: string, limit: number = 10): Promise<StudentActivity[]> {
    if (!studentId) return [];
    const data = await apiClient.get<{ activities: any[] }>(
      `/students/activities?limit=${encodeURIComponent(String(limit))}`
    );
    return (data.activities || []).map((activity) => this.mapActivity(activity));
  }

  /**
   * Get student statistics
   */
  async getStats(studentId: string) {
    if (!studentId) {
      return {
        totalSessions: 0,
        completedSessions: 0,
        upcomingSessions: 0,
        memorizedParts: 0,
        completedTasks: 0,
        pendingTasks: 0,
      };
    }
    const data = await apiClient.get<{
      stats: {
        totalSessions: number;
        completedSessions: number;
        upcomingSessions: number;
        memorizedParts: number;
        completedTasks: number;
        pendingTasks: number;
      };
    }>('/students/stats');
    return data.stats;
  }

  /**
   * Subscribe to weekly tasks
   */
  subscribeToWeeklyTasks(
    studentId: string,
    callback: (tasks: StudentTask[]) => void
  ) {
    console.warn('StudentService.subscribeToWeeklyTasks: Firestore removed, returning no-op unsubscribe');
    callback([]);
    return () => {}; // No-op unsubscribe
  }

  /**
   * Subscribe to upcoming session
   */
  subscribeToUpcomingSession(
    studentId: string,
    callback: (session: StudentSession | null) => void
  ) {
    console.warn('StudentService.subscribeToUpcomingSession: Firestore removed, returning no-op unsubscribe');
    callback(null);
    return () => {}; // No-op unsubscribe
  }
}

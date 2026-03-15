/**
 * Student Service
 * Business logic layer for student operations
 */

import { StudentRepository } from '../infrastructure/firebase/repositories/StudentRepository';
import type {
  StudentTask,
  StudentSession,
  MemorizationLog,
  StudentActivity,
  TaskStatus,
} from '../shared/types/student.types';

export class StudentService {
  private repository: StudentRepository;

  constructor() {
    this.repository = new StudentRepository();
  }

  /**
   * Get weekly tasks for student
   */
  async getWeeklyTasks(studentId: string): Promise<StudentTask[]> {
    return this.repository.getWeeklyTasks(studentId);
  }

  /**
   * Get all tasks for student
   */
  async getTasks(studentId: string, status?: TaskStatus): Promise<StudentTask[]> {
    return this.repository.getStudentTasks(studentId, status);
  }

  /**
   * Create a new task
   */
  async createTask(task: Omit<StudentTask, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    return this.repository.createTask(task);
  }

  /**
   * Update task status
   */
  async updateTaskStatus(taskId: string, status: TaskStatus): Promise<void> {
    return this.repository.updateTaskStatus(taskId, status);
  }

  /**
   * Get upcoming session
   */
  async getUpcomingSession(studentId: string): Promise<StudentSession | null> {
    return this.repository.getUpcomingSession(studentId);
  }

  /**
   * Get student sessions
   */
  async getSessions(
    studentId: string,
    status?: 'scheduled' | 'completed' | 'cancelled'
  ): Promise<StudentSession[]> {
    return this.repository.getStudentSessions(studentId, status);
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
    return this.repository.getAllSessions(filters, limitCount);
  }

  /**
   * Delete a session
   */
  async deleteSession(sessionId: string): Promise<void> {
    return this.repository.deleteSession(sessionId);
  }

  /**
   * Get memorization logs
   */
  async getMemorizationLogs(studentId: string, limit?: number): Promise<MemorizationLog[]> {
    return this.repository.getMemorizationLogs(studentId, limit);
  }

  /**
   * Create memorization log
   */
  async createMemorizationLog(
    log: Omit<MemorizationLog, 'id' | 'createdAt'>
  ): Promise<string> {
    return this.repository.createMemorizationLog(log);
  }

  /**
   * Get recent activities
   */
  async getActivities(studentId: string, limit: number = 10): Promise<StudentActivity[]> {
    return this.repository.getStudentActivities(studentId, limit);
  }

  /**
   * Get student statistics
   */
  async getStats(studentId: string) {
    return this.repository.getStudentStats(studentId);
  }

  /**
   * Subscribe to weekly tasks
   */
  subscribeToWeeklyTasks(
    studentId: string,
    callback: (tasks: StudentTask[]) => void
  ) {
    return this.repository.subscribeToStudentTasks(studentId, callback);
  }

  /**
   * Subscribe to upcoming session
   */
  subscribeToUpcomingSession(
    studentId: string,
    callback: (session: StudentSession | null) => void
  ) {
    return this.repository.subscribeToUpcomingSession(studentId, callback);
  }
}

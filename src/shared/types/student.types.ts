/**
 * Student Domain Types
 * Types for student-related entities
 */

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type SessionStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
export type ActivityType = 'task_completed' | 'session_booked' | 'session_completed' | 'memorization_logged' | 'achievement_unlocked';

export interface StudentTask {
  id: string;
  studentId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  dueDate: Date | string;
  completedAt?: Date | string;
  teacherId?: string;
  teacherName?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface StudentSession {
  id: string;
  studentId: string;
  teacherId: string;
  teacherName: string;
  teacherPhoto: string;
  studentName?: string;
  studentPhoto?: string;
  title: string;
  description?: string;
  scheduledDate: Date | string;
  duration: number; // in minutes
  status: SessionStatus;
  sessionType?: 'memorization' | 'recitation' | 'review' | 'test';
  subscriptionId?: string; // ID of the subscription this session belongs to
  meetingLink?: string;
  notes?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface MemorizationLog {
  id: string;
  studentId: string;
  surah: string;
  description: string;
  fromAyah?: number;
  toAyah?: number;
  juz?: number;
  grade?: string;
  teacherId?: string;
  teacherName?: string;
  loggedDate: Date | string;
  createdAt: Date | string;
}

export interface StudentActivity {
  id: string;
  studentId: string;
  type: ActivityType;
  title: string;
  description: string;
  metadata?: Record<string, any>;
  createdAt: Date | string;
}

export interface StudentStats {
  totalSessions: number;
  completedSessions: number;
  upcomingSessions: number;
  memorizedParts: number;
  completedTasks: number;
  pendingTasks: number;
  currentStreak: number;
}

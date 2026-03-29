/**
 * SessionService
 * Fetch session by ID (works for both roles), and expose meeting link helpers.
 */

import { apiClient } from '../lib/apiClient';
import type { StudentSession } from '../shared/types/student.types';

export class SessionService {
  /**
   * Fetch session details by session ID.
   * Backend should authorize based on current user (student or teacher).
   */
  async getSessionById(sessionId: string): Promise<StudentSession | null> {
    if (!sessionId) return null;
    try {
      // Backend responds with { success, data: { session }, error, meta }
      const resp = await apiClient.get<{ success: boolean; data: { session: any } }>(
        `/sessions/${encodeURIComponent(sessionId)}`
      );
      const raw = (resp as any)?.data?.session ?? (resp as any)?.session;
      if (!raw) return null;
      return this.mapSession(raw);
    } catch (err) {
      console.error('[SessionService] getSessionById failed:', err);
      return null;
    }
  }

  /**
   * Teacher starts session - backend generates or returns the meeting link.
   */
  async startSession(sessionId: string): Promise<{ meetingLink?: string } | null> {
    if (!sessionId) return null;
    try {
      // Teacher-protected endpoint: /teachers/me/sessions/:sessionId/start
      // Responds with { success, data: { session: { joinUrl } } }
      const resp = await apiClient.post<{ success: boolean; data?: { session?: { joinUrl?: string } } }>(
        `/teachers/me/sessions/${encodeURIComponent(sessionId)}/start`,
        {}
      );
      const joinUrl = resp?.data?.session?.joinUrl;
      return joinUrl ? { meetingLink: joinUrl } : null;
    } catch (err) {
      console.error('[SessionService] startSession failed:', err);
      return null;
    }
  }

  private mapSession(session: any): StudentSession {
    const teacherUser = session?.teacherId?.userId || {};
    const studentUser = session?.studentId?.userId || {};
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
      studentName: studentUser?.fullName || session?.studentName || undefined,
      studentPhoto: studentUser?.avatar || session?.studentPhoto || undefined,
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
}


/**
 * useStudentProfile Hook
 * Custom hook for managing student profile data
 */

import { useState, useEffect, useCallback } from 'react';
import { StudentService } from '../services/studentService';
import type {
  StudentTask,
  StudentSession,
  MemorizationLog,
  StudentActivity,
} from '../shared/types/student.types';

interface UseStudentProfileReturn {
  // Data
  weeklyTasks: StudentTask[];
  upcomingSession: StudentSession | null;
  memorizationLogs: MemorizationLog[];
  activities: StudentActivity[];
  stats: {
    totalSessions: number;
    completedSessions: number;
    upcomingSessions: number;
    memorizedParts: number;
    completedTasks: number;
    pendingTasks: number;
  } | null;

  // Loading states
  loading: boolean;
  tasksLoading: boolean;
  sessionLoading: boolean;
  logsLoading: boolean;
  activitiesLoading: boolean;
  statsLoading: boolean;

  // Error states
  error: string | null;

  // Actions
  refreshTasks: () => Promise<void>;
  refreshSession: () => Promise<void>;
  refreshLogs: () => Promise<void>;
  refreshActivities: () => Promise<void>;
  refreshStats: () => Promise<void>;
  updateTaskStatus: (taskId: string, status: 'pending' | 'in_progress' | 'completed' | 'cancelled') => Promise<void>;
  getAllMemorizationLogs: () => Promise<void>;
  getAllSessions: () => Promise<void>;
}

interface UseStudentProfileReturnWithSessions extends UseStudentProfileReturn {
  allSessions: StudentSession[];
  allMemorizationLogs: MemorizationLog[];
  sessionsLoading: boolean;
  allLogsLoading: boolean;
}

export function useStudentProfile(studentId: string | null | undefined): UseStudentProfileReturn {
  const [service] = useState(() => new StudentService());

  // Data states
  const [weeklyTasks, setWeeklyTasks] = useState<StudentTask[]>([]);
  const [upcomingSession, setUpcomingSession] = useState<StudentSession | null>(null);
  const [memorizationLogs, setMemorizationLogs] = useState<MemorizationLog[]>([]);
  const [allMemorizationLogs, setAllMemorizationLogs] = useState<MemorizationLog[]>([]);
  const [activities, setActivities] = useState<StudentActivity[]>([]);
  const [stats, setStats] = useState<UseStudentProfileReturn['stats']>(null);
  const [allSessions, setAllSessions] = useState<StudentSession[]>([]);

  // Loading states
  const [tasksLoading, setTasksLoading] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [logsLoading, setLogsLoading] = useState(false);
  const [allLogsLoading, setAllLogsLoading] = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const loading = tasksLoading || sessionLoading || logsLoading || activitiesLoading || statsLoading;

  // Get all memorization logs
  const getAllMemorizationLogs = useCallback(async () => {
    if (!studentId) return;

    try {
      setAllLogsLoading(true);
      setError(null);
      const logs = await service.getMemorizationLogs(studentId);
      setAllMemorizationLogs(logs);
    } catch (err) {
      console.error('Error fetching all memorization logs:', err);
      setError('فشل تحميل سجل الحفظ');
    } finally {
      setAllLogsLoading(false);
    }
  }, [studentId, service]);

  // Get all sessions
  const getAllSessions = useCallback(async () => {
    if (!studentId) return;

    try {
      setSessionsLoading(true);
      setError(null);
      const sessions = await service.getSessions(studentId);
      setAllSessions(sessions);
    } catch (err) {
      console.error('Error fetching all sessions:', err);
      setError('فشل تحميل الحصص');
    } finally {
      setSessionsLoading(false);
    }
  }, [studentId, service]);

  // Fetch weekly tasks
  const fetchWeeklyTasks = useCallback(async () => {
    if (!studentId) return;

    try {
      setTasksLoading(true);
      setError(null);
      const tasks = await service.getWeeklyTasks(studentId);
      setWeeklyTasks(tasks);
    } catch (err) {
      console.error('Error fetching weekly tasks:', err);
      setError('فشل تحميل المهام');
    } finally {
      setTasksLoading(false);
    }
  }, [studentId, service]);

  // Fetch upcoming session
  const fetchUpcomingSession = useCallback(async () => {
    if (!studentId) return;

    try {
      setSessionLoading(true);
      setError(null);
      const session = await service.getUpcomingSession(studentId);
      setUpcomingSession(session);
    } catch (err) {
      console.error('Error fetching upcoming session:', err);
      setError('فشل تحميل الحصة القادمة');
    } finally {
      setSessionLoading(false);
    }
  }, [studentId, service]);

  // Fetch memorization logs
  const fetchMemorizationLogs = useCallback(async () => {
    if (!studentId) return;

    try {
      setLogsLoading(true);
      setError(null);
      const logs = await service.getMemorizationLogs(studentId, 10);
      setMemorizationLogs(logs);
    } catch (err) {
      console.error('Error fetching memorization logs:', err);
      setError('فشل تحميل سجل الحفظ');
    } finally {
      setLogsLoading(false);
    }
  }, [studentId, service]);

  // Fetch activities
  const fetchActivities = useCallback(async () => {
    if (!studentId) return;

    try {
      setActivitiesLoading(true);
      setError(null);
      const activityList = await service.getActivities(studentId, 10);
      setActivities(activityList);
    } catch (err) {
      console.error('Error fetching activities:', err);
      setError('فشل تحميل النشاطات');
    } finally {
      setActivitiesLoading(false);
    }
  }, [studentId, service]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    if (!studentId) return;

    try {
      setStatsLoading(true);
      setError(null);
      const studentStats = await service.getStats(studentId);
      setStats(studentStats);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('فشل تحميل الإحصائيات');
    } finally {
      setStatsLoading(false);
    }
  }, [studentId, service]);

  // Update task status
  const updateTaskStatus = useCallback(
    async (taskId: string, status: 'pending' | 'in_progress' | 'completed' | 'cancelled') => {
      try {
        setError(null);
        await service.updateTaskStatus(taskId, status);
        // Refresh tasks after update
        await fetchWeeklyTasks();
      } catch (err) {
        console.error('Error updating task status:', err);
        setError('فشل تحديث حالة المهمة');
        throw err;
      }
    },
    [service, fetchWeeklyTasks]
  );

  // Initial data fetch
  useEffect(() => {
    if (!studentId) return;

    fetchWeeklyTasks();
    fetchUpcomingSession();
    fetchMemorizationLogs();
    fetchActivities();
    fetchStats();
  }, [studentId, fetchWeeklyTasks, fetchUpcomingSession, fetchMemorizationLogs, fetchActivities, fetchStats]);

  // Real-time subscriptions
  useEffect(() => {
    if (!studentId) return;

    // Subscribe to tasks
    const unsubscribeTasks = service.subscribeToWeeklyTasks(studentId, (tasks) => {
      setWeeklyTasks(tasks);
    });

    // Subscribe to upcoming session
    const unsubscribeSession = service.subscribeToUpcomingSession(studentId, (session) => {
      setUpcomingSession(session);
    });

    return () => {
      unsubscribeTasks();
      unsubscribeSession();
    };
  }, [studentId, service]);

  return {
    // Data
    weeklyTasks,
    upcomingSession,
    memorizationLogs,
    activities,
    stats,

    // Loading states
    loading,
    tasksLoading,
    sessionLoading,
    logsLoading,
    activitiesLoading,
    statsLoading,

    // Error state
    error,

    // Actions
    refreshTasks: fetchWeeklyTasks,
    refreshSession: fetchUpcomingSession,
    refreshLogs: fetchMemorizationLogs,
    refreshActivities: fetchActivities,
    refreshStats: fetchStats,
    updateTaskStatus,
    getAllMemorizationLogs,
    getAllSessions,
  };
}

export function useStudentProfileWithSessions(studentId: string | null | undefined): UseStudentProfileReturnWithSessions {
  const base = useStudentProfile(studentId);
  const [service] = useState(() => new StudentService());
  const [allSessions, setAllSessions] = useState<StudentSession[]>([]);
  const [allMemorizationLogs, setAllMemorizationLogs] = useState<MemorizationLog[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [allLogsLoading, setAllLogsLoading] = useState(false);

  // Get all memorization logs
  const getAllMemorizationLogs = useCallback(async () => {
    if (!studentId) return;

    try {
      setAllLogsLoading(true);
      const logs = await service.getMemorizationLogs(studentId);
      setAllMemorizationLogs(logs);
    } catch (err) {
      console.error('Error fetching all memorization logs:', err);
    } finally {
      setAllLogsLoading(false);
    }
  }, [studentId, service]);

  // Get all sessions
  const getAllSessions = useCallback(async () => {
    if (!studentId) return;

    try {
      setSessionsLoading(true);
      const sessions = await service.getSessions(studentId);
      setAllSessions(sessions);
    } catch (err) {
      console.error('Error fetching all sessions:', err);
    } finally {
      setSessionsLoading(false);
    }
  }, [studentId, service]);

  return {
    ...base,
    allSessions,
    allMemorizationLogs,
    sessionsLoading,
    allLogsLoading,
    getAllMemorizationLogs,
    getAllSessions,
  };
}

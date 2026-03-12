/**
 * Firebase Collection Names
 * Centralized collection name constants to avoid hardcoded strings
 */

export const COLLECTIONS = {
  TEACHER_APPLICATIONS: 'teacherApplications',
  TEACHER_WALLETS: 'teacherWallets',
  SUPPORT_TICKETS: 'supportTickets',
  USERS: 'users',
  SESSIONS: 'sessions',
  QUALIFICATIONS: 'qualifications',
  IJAZAHS: 'ijazahs',
  AVAILABILITY: 'availability',
  REVIEWS: 'reviews',
  RATINGS: 'ratings',
  STUDENT_TASKS: 'studentTasks',
  MEMORIZATION_LOGS: 'memorizationLogs',
  STUDENT_ACTIVITIES: 'studentActivities',
} as const;

export type CollectionName = typeof COLLECTIONS[keyof typeof COLLECTIONS];

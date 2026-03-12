/**
 * Admin Service
 * Business logic layer for admin operations
 */

import { AdminRepository } from '../infrastructure/firebase/repositories/AdminRepository';
import { TEACHER_APPLICATION_STATUS } from '../constants/status';
import { ErrorHandler } from '../shared/utils/errorHandler';
import type { TeacherApplication } from '../shared/types/teacher.types';

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
  private repository: AdminRepository;

  constructor() {
    this.repository = new AdminRepository();
  }

  /**
   * Get all teacher applications with optional filtering
   */
  async getTeacherApplications(filter: ApplicationFilter = {}): Promise<TeacherApplication[]> {
    try {
      const allApps = await this.repository.getAllTeacherApplications();

      // Filter by status
      let filteredApps = allApps;
      if (filter.status && filter.status !== 'all') {
        filteredApps = allApps.filter(app => {
          const status = app.status || 'pending';
          return status === filter.status;
        });
      }

      // Add incomplete applications if requested
      if (filter.includeIncomplete && (filter.status === 'all' || filter.status === TEACHER_APPLICATION_STATUS.PENDING || !filter.status)) {
        const incompleteApps = await this.getIncompleteApplications(allApps);
        filteredApps = [...filteredApps, ...incompleteApps];
      }

      // Sort by creation date (newest first)
      filteredApps.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0);
        return dateB.getTime() - dateA.getTime();
      });

      return filteredApps;
    } catch (error) {
      const appError = ErrorHandler.handleFirebaseError(error, 'AdminService.getTeacherApplications');
      throw appError;
    }
  }

  /**
   * Get incomplete teacher applications (users with teacher accountType but no application)
   */
  private async getIncompleteApplications(existingApps: TeacherApplication[]): Promise<IncompleteApplication[]> {
    try {
      const teacherUsers = await this.repository.getTeacherUsers();
      const incompleteApps: IncompleteApplication[] = [];

      teacherUsers.forEach(userData => {
        const userId = userData.uid;

        // Check if this user has ANY application
        const hasApp = existingApps.some(a => a.userId === userId);

        if (!hasApp) {
          incompleteApps.push({
            id: `temp_${userId}`,
            userId: userId,
            fullName: userData.displayName || `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'Unknown',
            email: userData.email,
            phone: userData.phone,
            subjects: [],
            status: TEACHER_APPLICATION_STATUS.PENDING,
            createdAt: userData.createdAt,
            isIncomplete: true,
          });
        }
      });

      return incompleteApps;
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
        // Create new application document for incomplete user
        const userId = applicationId.replace('temp_', '');

        if (!userApp) {
          throw new Error('User application data is required for incomplete applications');
        }

        // Create the application
        const newAppId = await this.repository.createTeacherApplication(userId, {
          fullName: userApp.fullName,
          email: userApp.email,
          phone: userApp.phone,
          subjects: userApp.subjects || [],
        });

        // Update status
        await this.repository.updateApplicationStatus(newAppId, newStatus);

        return newAppId;
      } else {
        // Update existing application
        await this.repository.updateApplicationStatus(applicationId, newStatus);
        return applicationId;
      }
    } catch (error) {
      console.error('Error updating application status:', error);
      throw error;
    }
  }
}

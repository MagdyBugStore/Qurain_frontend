/**
 * Teacher Service
 * Business logic layer for teacher operations
 */

import { TeacherRepository } from '../../../infrastructure/firebase/repositories/TeacherRepository';
import type {
  TeacherApplication,
  TeacherProfile,
  TeacherDetailData,
  Review,
} from '../../../shared/types/teacher.types';
import { getTeacherQualifications } from '../../../shared/utils/teacher';

export class TeacherService {
  private repository: TeacherRepository;

  constructor() {
    this.repository = new TeacherRepository();
  }

  /**
   * Get complete teacher detail data by userId
   */
  async getTeacherDetailById(userId: string): Promise<TeacherDetailData | null> {
    try {
      // Fetch teacher application
      const application = await this.repository.findApprovedByUserId(userId);
      
      if (!application) {
        return null;
      }

      // Fetch user profile
      const profile = application.userId
        ? await this.repository.getUserProfile(application.userId)
        : null;

      // Fetch rating and reviews
      const teacherId = application.userId || application.id;
      const { rating, count: reviewsCount } = await this.repository.getTeacherRating(teacherId);
      const reviews = await this.repository.getTeacherReviews(teacherId);

      // Get qualifications
      const qualifications = getTeacherQualifications(application);

      // Fetch availability from Firestore
      let availability: (string | null)[][] = Array(7).fill(null).map(() => Array(12).fill(null));
      try {
        const availabilityData = await this.repository.getAvailability(teacherId);
        if (availabilityData && availabilityData.schedule) {
          availability = availabilityData.schedule as (string | null)[][];
        }
      } catch (error) {
        console.error('Error fetching availability:', error);
        // Use empty availability if fetch fails
      }
      
      // Note: Booked slots from subscriptions are handled in the booking page component
      // to avoid permissions issues when fetching subscriptions

      return {
        application,
        profile: profile || {},
        rating,
        reviewsCount,
        reviews, // Use real reviews only, no mock data
        qualifications,
        availability,
      };
    } catch (error) {
      console.error('Error getting teacher detail:', error);
      throw error;
    }
  }

  /**
   * Get all approved teachers
   */
  async getAllApprovedTeachers(): Promise<Array<TeacherApplication & { profile?: TeacherProfile }>> {
    try {
      const applications = await this.repository.findAllApproved();
      
      // Fetch profiles for all teachers
      const teachersWithProfiles = await Promise.all(
        applications.map(async (app) => {
          const profile = app.userId
            ? await this.repository.getUserProfile(app.userId)
            : null;
          
          return {
            ...app,
            profile: profile || undefined,
          };
        })
      );

      return teachersWithProfiles;
    } catch (error) {
      console.error('Error getting all teachers:', error);
      throw error;
    }
  }

  /**
   * Get mock reviews for testing/fallback
   */

}

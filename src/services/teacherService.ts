/**
 * Teacher Service
 * Business logic layer for teacher operations
 */

import { TeacherRepository } from '../infrastructure/firebase/repositories/TeacherRepository';
import { TEACHER_APPLICATION_STATUS } from '../constants/status';
import type {
  TeacherApplication,
  TeacherProfile,
  TeacherDetailData,
  Review,
} from '../shared/types/teacher.types';
import type { Qualification } from '../features/teachers/domain/entities/Qualification';
import type { Ijazah } from '../features/teachers/domain/entities/Ijazah';
import type { Availability, SlotStatus } from '../features/teachers/domain/entities/Availability';
import { getTeacherQualifications } from '../shared/utils/teacher';

export interface TeacherProfileData {
  application: TeacherApplication | null;
  profile: TeacherProfile | null;
  rating: number;
  reviewsCount: number;
  reviews: Review[];
  qualifications: Qualification[];
  ijazahs: Ijazah[];
  availability: Availability | null;
}

export interface PersonalInfoData {
  teachingStyle?: string;
  sessionContent?: string;
  introVideo?: string;
}

export interface CreateApplicationData {
  fullName?: string;
  email?: string;
  phone?: string;
  countryCode?: string;
  gender?: string;
  nationality?: string;
  yearsOfExperience?: number;
  educationLevel?: string;
  bio?: string;
  subjects?: string[];
  hourlyRate?: number;
  currency?: string;
  userId: string;
  userEmail?: string;
}

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
      const application = await this.repository.findApprovedByUserId(userId);
      
      if (!application) {
        return null;
      }

      const profile = application.userId
        ? await this.repository.getUserProfile(application.userId)
        : null;

      const teacherId = application.userId || application.id;
      const { rating, count: reviewsCount } = await this.repository.getTeacherRating(teacherId);
      const reviews = await this.repository.getTeacherReviews(teacherId);

      const qualifications = getTeacherQualifications(application);

      // Mock availability data - TODO: Fetch from actual availability collection
      const availability: (string | null)[][] = [
        ['available', 'available', 'booked', 'booked', 'available', 'available', null, null, 'available', 'available', 'booked', null],
        ['booked', 'booked', 'available', 'available', 'booked', 'available', 'available', null, 'booked', 'available', 'available', 'available'],
        [null, 'available', 'available', 'booked', 'available', 'available', 'available', 'available', null, 'booked', 'available', null],
        ['available', 'available', 'booked', 'available', 'available', 'booked', 'available', null, 'available', 'available', 'booked', 'available'],
        [null, null, 'available', 'available', 'booked', 'available', 'available', 'available', 'available', null, 'available', 'available'],
        ['available', 'booked', 'available', 'available', 'available', 'booked', 'booked', 'available', 'available', 'available', null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null],
      ];

      return {
        application,
        profile: profile || {},
        rating,
        reviewsCount,
        reviews: reviews.length > 0 ? reviews : this.getMockReviews(),
        qualifications,
        availability,
      };
    } catch (error) {
      console.error('Error getting teacher detail:', error);
      throw error;
    }
  }

  /**
   * Get all approved teachers with their profiles
   */
  async getAllApprovedTeachers(): Promise<Array<TeacherApplication & { profile?: TeacherProfile }>> {
    try {
      const applications = await this.repository.findAllApproved();
      
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
   * Get teacher application by userId
   */
  async getTeacherApplication(userId: string): Promise<TeacherApplication | null> {
    try {
      return await this.repository.findApplicationByUserId(userId);
    } catch (error) {
      console.error('Error getting teacher application:', error);
      throw error;
    }
  }

  /**
   * Get complete teacher profile data
   */
  async getTeacherProfileData(userId: string): Promise<TeacherProfileData> {
    try {
      const application = await this.repository.findApplicationByUserId(userId);
      
      if (!application) {
        const profile = await this.repository.getUserProfile(userId);
        return {
          application: null,
          profile,
          rating: 0,
          reviewsCount: 0,
          reviews: [],
          qualifications: [],
          ijazahs: [],
          availability: null,
        };
      }

      const teacherId = application.userId || application.id;

      const [
        profile,
        { rating, count: reviewsCount },
        reviews,
        qualifications,
        ijazahs,
        availability,
      ] = await Promise.all([
        this.repository.getUserProfile(teacherId),
        this.repository.getTeacherRating(teacherId),
        this.repository.getTeacherReviews(teacherId),
        Promise.resolve(getTeacherQualifications(application)),
        this.repository.getIjazahs(teacherId),
        this.repository.getAvailability(teacherId),
      ]);

      return {
        application,
        profile,
        rating,
        reviewsCount,
        reviews,
        qualifications,
        ijazahs,
        availability,
      };
    } catch (error) {
      console.error('Error getting teacher profile data:', error);
      throw error;
    }
  }

  /**
   * Create a new teacher application
   */
  async createApplication(data: CreateApplicationData): Promise<string> {
    try {
      return await this.repository.createApplication({
        ...data,
        status: TEACHER_APPLICATION_STATUS.PENDING,
      } as any);
    } catch (error) {
      console.error('Error creating teacher application:', error);
      throw error;
    }
  }

  /**
   * Update teacher application
   */
  async updateApplication(applicationId: string, data: Partial<TeacherApplication>): Promise<void> {
    try {
      await this.repository.updateApplication(applicationId, data);
    } catch (error) {
      console.error('Error updating teacher application:', error);
      throw error;
    }
  }

  /**
   * Update personal info (teaching style, session content, intro video)
   */
  async updatePersonalInfo(applicationId: string, data: PersonalInfoData): Promise<void> {
    try {
      await this.repository.updateApplication(applicationId, {
        teachingStyle: data.teachingStyle,
        sessionContent: data.sessionContent,
        introVideo: data.introVideo,
      });
    } catch (error) {
      console.error('Error updating personal info:', error);
      throw error;
    }
  }

  /**
   * Save qualifications
   */
  async saveQualifications(applicationId: string, qualifications: Qualification[]): Promise<void> {
    try {
      await this.repository.saveQualifications(applicationId, qualifications);
    } catch (error) {
      console.error('Error saving qualifications:', error);
      throw error;
    }
  }

  /**
   * Get ijazahs
   */
  async getIjazahs(teacherId: string): Promise<Ijazah[]> {
    try {
      return await this.repository.getIjazahs(teacherId);
    } catch (error) {
      console.error('Error getting ijazahs:', error);
      throw error;
    }
  }

  /**
   * Save ijazah
   */
  async saveIjazah(ijazah: Omit<Ijazah, 'id'>): Promise<string> {
    try {
      return await this.repository.saveIjazah(ijazah);
    } catch (error) {
      console.error('Error saving ijazah:', error);
      throw error;
    }
  }

  /**
   * Update ijazah
   */
  async updateIjazah(ijazahId: string, data: Partial<Ijazah>): Promise<void> {
    try {
      await this.repository.updateIjazah(ijazahId, data);
    } catch (error) {
      console.error('Error updating ijazah:', error);
      throw error;
    }
  }

  /**
   * Delete ijazah
   */
  async deleteIjazah(ijazahId: string): Promise<void> {
    try {
      await this.repository.deleteIjazah(ijazahId);
    } catch (error) {
      console.error('Error deleting ijazah:', error);
      throw error;
    }
  }

  /**
   * Get availability
   */
  async getAvailability(teacherId: string): Promise<Availability | null> {
    try {
      return await this.repository.getAvailability(teacherId);
    } catch (error) {
      console.error('Error getting availability:', error);
      throw error;
    }
  }

  /**
   * Save availability with smart merging to preserve booked slots
   * This ensures that booked slots from student subscriptions are never overwritten
   */
  async saveAvailability(availability: Availability): Promise<void> {
    try {
      // Get current availability from database to preserve booked slots
      const currentAvailability = await this.repository.getAvailability(availability.teacherId);
      
      if (currentAvailability) {
        // Merge: preserve booked slots, allow changes to available/null slots
        const mergedSchedule = this.mergeAvailabilitySchedules(
          currentAvailability.schedule,
          availability.schedule
        );
        
        await this.repository.saveAvailability({
          teacherId: availability.teacherId,
          schedule: mergedSchedule as SlotStatus[][],
          updatedAt: availability.updatedAt,
        });
      } else {
        // No existing availability, save as is (but ensure all slots are explicitly set)
        const completeSchedule: (string | null)[][] = Array(7)
          .fill(null)
          .map(() => Array(12).fill(null));
        
        // Copy user's schedule
        for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
          for (let timeIndex = 0; timeIndex < 12; timeIndex++) {
            completeSchedule[dayIndex][timeIndex] = availability.schedule[dayIndex]?.[timeIndex] ?? null;
          }
        }
        
        await this.repository.saveAvailability({
          teacherId: availability.teacherId,
          schedule: completeSchedule as SlotStatus[][],
          updatedAt: availability.updatedAt,
        });
      }
    } catch (error) {
      console.error('[TeacherService] Error saving availability:', error);
      throw error;
    }
  }

  /**
   * Merge availability schedules intelligently
   * Rules:
   * - Preserve all 'booked' slots from current (database) schedule
   * - Allow changes to 'available' and null slots from new (user edits) schedule
   * - Never allow overwriting 'booked' slots with 'available' or null
   * - Explicitly handle null values for removal
   */
  private mergeAvailabilitySchedules(
    currentSchedule: (string | null)[][],
    newSchedule: (string | null)[][]
  ): (string | null)[][] {
    const merged: (string | null)[][] = Array(7)
      .fill(null)
      .map(() => Array(12).fill(null));

    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
      for (let timeIndex = 0; timeIndex < 12; timeIndex++) {
        const currentSlot = currentSchedule[dayIndex]?.[timeIndex];
        const newSlot = newSchedule[dayIndex]?.[timeIndex];

        // Priority 1: Preserve booked slots from database (never overwrite)
        if (currentSlot === 'booked') {
          merged[dayIndex][timeIndex] = 'booked';
        }
        // Priority 2: Apply new changes (including null for removal) if current slot is not booked
        else {
          // Explicitly handle null values - user wants to remove this slot
          if (newSlot === null) {
            merged[dayIndex][timeIndex] = null;
          }
          // Apply new non-null values
          else if (newSlot !== null && newSlot !== undefined) {
            merged[dayIndex][timeIndex] = newSlot;
          }
          // If new is undefined but current exists, keep current
          else if (currentSlot !== null && currentSlot !== undefined) {
            merged[dayIndex][timeIndex] = currentSlot;
          }
          // Default: null (not available)
          else {
            merged[dayIndex][timeIndex] = null;
          }
        }
      }
    }

    return merged;
  }

  /**
   * Get teacher rating
   */
  async getTeacherRating(teacherId: string): Promise<{ rating: number; count: number }> {
    try {
      return await this.repository.getTeacherRating(teacherId);
    } catch (error) {
      console.error('Error getting teacher rating:', error);
      throw error;
    }
  }

  /**
   * Get completed sessions count
   */
  async getCompletedSessionsCount(teacherId: string): Promise<number> {
    try {
      return await this.repository.getCompletedSessionsCount(teacherId);
    } catch (error) {
      console.error('Error getting completed sessions count:', error);
      throw error;
    }
  }

  /**
   * Get mock reviews for testing/fallback
   */
  private getMockReviews(): Review[] {
    return [
      {
        name: 'محمد علي',
        time: 'قبل يومين',
        rating: 5,
        comment: 'ما شاء الله تبارك الله، أسلوب الدكتور متميز جداً في تصحيح التلاوة. يهتم بدقائق التجويد ويربطها بمعاني الآيات. جزاكم الله خيراً.',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAqR32u1hY7LX4IdVqqSVCzRsckr5Tpd-ubbFOEahgGBpXlGZIiBBWdnToWsAS4Nj3xlGt3-0CIVInGch9IcZjnbHxwGPFw8mk1dAUjEX0tLEj_Yr3PT0kfhZV983nFSwVhpYjeSpNac94V0R0jXzPekFstM5xAE7hXW2qYSKT0bj-6ddD-xLqVvMC9K9CqhaoFOkGD0K6ziJ7oUWHpRcwO42GqjtoVVK6OdXzQaIcuPJq3AkygWhbBlEw7qSXlo5oxvM3lqU17YOCo',
      },
      {
        name: 'عبد الله عمر',
        time: 'قبل أسبوع',
        rating: 5,
        comment: 'استفدت كثيراً من دورة مخارج الحروف. الشرح وافي والتطبيق العملي مفيد جداً. أنصح بالدراسة معه لكل طالب علم.',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAEimIImSLgw0XsDxrT1crt0NFg8Fs_vVPLV__RobSTEk8F9Vic0Vwokcx5p9d6e9n01WqncOetVqniX6pz5Ul97-Whs_0FlxHE_OwPFiWN7vZFQ_OsoBVgMCyJsLY_D52YxA1ZvmOLxge_AqBLu_eQ8IXrnj-G6jDUVOm9kRt8u5z4PzFeROve6MdrLRAtikMKP5Z6WfAgC4ISOMM12jPOjhJBwAYqFP11cKL-xYeoi_2ysCJjOFJSb5Ee8kUpuYYvIYiobfsLlwic',
      },
      {
        name: 'فاطمة أحمد',
        time: 'قبل أسبوعين',
        rating: 5,
        comment: 'معلمة ممتازة، صبورة جداً وتشرح بطريقة واضحة. ساعدتني في تحسين تلاوتي بشكل كبير. الله يبارك في جهودها.',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDaHCQpQDIhRCTg8znqGbspw1A1F6Zar1Syu1aLwWIQat1CNApShCs6EKLwGnERa9BLy_zwlwOAPw7sLW8qgsiPJIiXGWL4B0KMcMnHdJcvbOIrtiSKYYlhWoiyKFRz7ol7BumuHGknAqEeSUXxfrzxk6sHDfrepKu8GiXJcm8IJpTCYIlEKrMDSvQP_eE-ePAzmoROe-xBU2UtjrP8j93LQuthyn4pLtWeWolZnyevkFcf-cE_8Ugxc-6zr4dclaScsP8KvndSVtUa',
      },
    ];
  }
}

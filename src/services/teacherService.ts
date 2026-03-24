/**
 * Teacher Service
 * Business logic layer for teacher operations
 * Now uses backend API instead of Firestore
 */

import { apiClient } from '../lib/apiClient';
import { teacherApplicationApi } from './teacherApplicationApi';
import { TEACHER_APPLICATION_STATUS, type TeacherApplicationStatus } from '../constants/status';
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
  bio?: string;
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
  certificatesCount?: number;
  bio?: string;
  subjects?: string[];
  hourlyRate?: number;
  currency?: string;
  userId: string;
  userEmail?: string;
  languages?: string[];
  title?: string;
}

export class TeacherService {
  private static readonly DEFAULT_CURRENCY = 'SAR';

  constructor() {
    // No longer using Firestore repository
  }

  private getDefaultCurrency(): string {
    return TeacherService.DEFAULT_CURRENCY;
  }

  /**
   * Get complete teacher detail data by userId
   * Uses backend API
   */
  async getTeacherDetailById(userId: string): Promise<TeacherDetailData | null> {
    try {
      // Use public endpoint to get teacher by ID
      const response = await apiClient.get<{ teacher: any }>(`/teachers/${userId}`);
      const teacher = response.teacher;
      
      if (!teacher) {
        return null;
      }

      const application = this.transformBackendTeacherToApplication(teacher);
      const profile = this.transformProfileToFrontendFormat(teacher);
      const qualifications = getTeacherQualifications(application);
      const teacherObjectId = teacher?._id?.toString?.() || '';

      const [reviewsResponse, availabilityResponse] = await Promise.all([
        apiClient
          .get<{ reviews: any[] }>(`/reviews/teachers/${teacherObjectId}/reviews`)
          .catch(() => ({ reviews: [] })),
        apiClient
          .get<{ availability: { schedule?: (string | null)[][] } | null }>(`/teachers/${teacherObjectId}/availability`)
          .catch(() => ({ availability: null })),
      ]);

      const reviews = this.transformBackendReviewsToFrontendFormat(reviewsResponse.reviews || []);
      const availability = this.normalizeSchedule(availabilityResponse.availability?.schedule);
      const rating = typeof teacher.rating === 'number' ? teacher.rating : teacher.ratingAvg || 0;
      const reviewsCount = typeof teacher.reviewsCount === 'number' ? teacher.reviewsCount : teacher.ratingCount || reviews.length;

      return {
        application,
        profile: profile || {},
        rating,
        reviewsCount,
        reviews,
        qualifications,
        availability,
      };
    } catch (error) {
      console.error('Error getting teacher detail:', error);
      return null;
    }
  }

  /**
   * Transform backend teacher to frontend application format
   */
  private transformBackendTeacherToApplication(teacher: any): TeacherApplication {
    const approvalStatus = teacher.approvalStatus || 'pending';
    const sessionPrice = this.parsePrice(teacher.sessionPrice ?? teacher.hourlyRate);
    const teachingStyle = this.normalizeTextOrJsonString(teacher.teachingStyle);
    const sessionContent = this.normalizeTextOrJsonString(teacher.sessionContent);

    return {
      id: teacher._id || teacher.userId,
      userId: teacher.userId?._id || teacher.userId,
      status: this.mapProfileApprovalStatusToApplicationStatus(approvalStatus),
      fullName: teacher.userId?.fullName || '',
      email: teacher.userId?.email || '',
      bio: teacher.bio || '',
      yearsOfExperience: teacher.experienceYears || 0,
      languages: teacher.languages || [],
      hourlyRate: sessionPrice,
      currency: teacher.currency || teacher.sessionCurrency || this.getDefaultCurrency(),
      teachingStyle,
      sessionContent,
      introVideo: teacher.introVideo || '',
    } as TeacherApplication;
  }

  /**
   * Get all approved teachers with their profiles
   * Uses backend API
   */
  async getAllApprovedTeachers(): Promise<Array<TeacherApplication & { profile?: TeacherProfile }>> {
    try {
      const response = await apiClient.get<{ teachers: any[] }>('/teachers');
      const teachers = response.teachers || [];
      
      return teachers.map((teacher) => {
        const application = this.transformBackendTeacherToApplication(teacher);
        const profile = this.transformProfileToFrontendFormat(teacher);
        
        return {
          ...application,
          profile: profile || undefined,
        };
      });
    } catch (error) {
      console.error('Error getting all teachers:', error);
      return [];
    }
  }

  /**
   * Get teacher application by userId
   * Uses backend API instead of Firestore
   */
  async getTeacherApplication(userId: string): Promise<TeacherApplication | null> {
    try {
      const application = await teacherApplicationApi.getMyApplication();
      if (!application) {
        return null;
      }
      // Transform backend application format to frontend format
      return this.transformApplicationToFrontendFormat(application);
    } catch (error) {
      console.error('Error getting teacher application:', error);
      // Return null instead of throwing to handle gracefully
      return null;
    }
  }

  /**
   * Transform backend application format to frontend TeacherApplication format
   */
  private transformApplicationToFrontendFormat(application: any): TeacherApplication {
    return {
      id: application._id || application.userId,
      userId: application.userId,
      status: this.mapApprovalStatusToApplicationStatus(application.currentStep),
      fullName: application.step1?.fullName || '',
      email: application.step1?.email || '',
      phone: application.step1?.phone || '',
      countryCode: application.step1?.countryCode || '',
      gender: application.step1?.gender || '',
      nationality: application.step1?.nationality || '',
      yearsOfExperience: application.step1?.yearsOfExperience || 0,
      languages: application.step1?.languages || [],
      title: application.step1?.title || '',
      educationLevel: application.step2?.educationLevel || '',
      certificatesCount: application.step2?.certificatesCount || 0,
      bio: application.step2?.bio || '',
      introVideo: application.step2?.introVideo || '',
      subjects: application.step2?.subjects || [],
      hourlyRate: application.step2?.hourlyRate || 0,
      currency: application.step2?.currency || this.getDefaultCurrency(),
      teachingStyle: application.step2?.teachingStyle || '',
      sessionContent: application.step2?.sessionContent || '',
      ijazahs: Array.isArray(application.step2?.ijazahs) ? application.step2.ijazahs : [],
      submittedAt: application.submittedAt ? new Date(application.submittedAt).toISOString() : undefined,
    } as TeacherApplication;
  }

  /**
   * Map backend application step to frontend application status
   */
  private mapApprovalStatusToApplicationStatus(step: string): TeacherApplicationStatus {
    switch (step) {
      case 'submitted':
        return TEACHER_APPLICATION_STATUS.PENDING;
      case 'step1':
      case 'step2':
      case 'review':
        return TEACHER_APPLICATION_STATUS.INCOMPLETE;
      default:
        return TEACHER_APPLICATION_STATUS.PENDING;
    }
  }

  /**
   * Map backend approvalStatus to frontend application status
   */
  private mapProfileApprovalStatusToApplicationStatus(approvalStatus: string): TeacherApplicationStatus {
    switch (approvalStatus?.toLowerCase()) {
      case 'approved':
        return TEACHER_APPLICATION_STATUS.APPROVED;
      case 'pending':
        return TEACHER_APPLICATION_STATUS.PENDING;
      case 'rejected':
        return TEACHER_APPLICATION_STATUS.REJECTED;
      case 'incomplete':
        return TEACHER_APPLICATION_STATUS.INCOMPLETE;
      default:
        return TEACHER_APPLICATION_STATUS.PENDING;
    }
  }

  /**
   * Get complete teacher profile data
   * Uses backend API instead of Firestore
   */
  async getTeacherProfileData(userId: string): Promise<TeacherProfileData> {
    try {
      // Fetch application from backend API
      const application = await this.getTeacherApplication(userId);
      
      // Fetch profile, qualifications, ijazahs, and availability in parallel
      const [
        profileResponse,
        qualificationsResponse,
        ijazahsResponse,
        availabilityResponse,
      ] = await Promise.allSettled([
        apiClient.get<{ profile: any }>('/teachers/me/profile').catch(() => null),
        apiClient.get<{ qualifications: Qualification[] }>('/teachers/me/qualifications').catch(() => ({ qualifications: [] })),
        apiClient.get<{ ijazahs: Ijazah[] }>('/teachers/me/ijazahs').catch(() => ({ ijazahs: [] })),
        apiClient.get<{ availability: any }>('/teachers/me/availability').catch(() => ({ availability: null })),
      ]);

      // Extract data from responses
      const profile = profileResponse.status === 'fulfilled' && profileResponse.value?.profile 
        ? this.transformProfileToFrontendFormat(profileResponse.value.profile)
        : null;
      
      const qualifications = qualificationsResponse.status === 'fulfilled' 
        ? (qualificationsResponse.value?.qualifications || [])
        : [];
      
      const ijazahs = ijazahsResponse.status === 'fulfilled'
        ? (ijazahsResponse.value?.ijazahs || [])
        : [];
      
      const availability = availabilityResponse.status === 'fulfilled'
        ? this.transformAvailabilityToFrontendFormat(availabilityResponse.value?.availability)
        : null;

      // Get qualifications from application if available
      const appQualifications = application ? getTeacherQualifications(application) : [];

      // Extract rating from profile response (backend returns ratingAvg/ratingCount)
      const profileData = profileResponse.status === 'fulfilled' && profileResponse.value?.profile 
        ? profileResponse.value.profile 
        : null;
      const rating = (profileData as any)?.ratingAvg || 0;
      const reviewsCount = (profileData as any)?.ratingCount || 0;

      // Update application status from profile's approvalStatus if available
      // This is the source of truth for approved/pending/rejected status
      let finalApplication = application;
      if (profileData && (profileData as any).approvalStatus && application) {
        const approvalStatus = (profileData as any).approvalStatus;
        const mappedStatus = this.mapProfileApprovalStatusToApplicationStatus(approvalStatus);
        finalApplication = {
          ...application,
          status: mappedStatus,
        };
      }

      return {
        application: finalApplication,
        profile,
        rating,
        reviewsCount,
        reviews: [], // Reviews not yet implemented in backend API
        qualifications: qualifications.length > 0 ? qualifications : appQualifications,
        ijazahs: ijazahs as Ijazah[],
        availability,
      };
    } catch (error) {
      console.error('Error getting teacher profile data:', error);
      // Return empty profile data instead of throwing
      return {
        application: null,
        profile: null,
        rating: 0,
        reviewsCount: 0,
        reviews: [],
        qualifications: [],
        ijazahs: [],
        availability: null,
      };
    }
  }

  /**
   * Transform backend profile format to frontend TeacherProfile format
   */
  private transformProfileToFrontendFormat(profile: any): TeacherProfile {
    // Extract avatar from userId if it's populated, otherwise use profile.avatar or profile.photoURL
    const avatar = profile.userId?.avatar || profile.avatar || profile.photoURL || null;
    
    // Extract user info if userId is populated
    const userIdValue = typeof profile.userId === 'object' && profile.userId?._id 
      ? profile.userId._id 
      : profile.userId;
    
    return {
      ...profile,
      id: profile._id || userIdValue,
      userId: userIdValue,
      photoURL: avatar || undefined,
      displayName: profile.userId?.fullName || profile.displayName || profile.fullName,
      firstName: profile.userId?.firstName || profile.firstName,
      lastName: profile.userId?.lastName || profile.lastName,
      email: profile.userId?.email || profile.email,
    } as TeacherProfile;
  }

  /**
   * Transform backend availability format to frontend Availability format
   */
  private transformAvailabilityToFrontendFormat(availability: any): Availability | null {
    if (!availability) return null;

    // Helper to extract teacherId as string
    const extractTeacherId = (value: unknown): string | undefined => {
      // Mongo ObjectId as object {_id: "..."} or populated teacher document {_id: "..."}
      if (value && typeof value === 'object' && (value as any)._id) {
        const id = (value as any)._id;
        return typeof id === 'string' ? id : id?.toString?.();
      }
      return typeof value === 'string' ? value : undefined;
    };

    // Case 1: availability object with schedule array
    if (availability.schedule && Array.isArray(availability.schedule)) {
      return {
        teacherId: extractTeacherId(availability.teacherId) || availability.teacherId,
        schedule: this.normalizeSchedule(availability.schedule),
        updatedAt: availability.updatedAt,
      };
    }

    // Case 2: API might (in edge cases) return the schedule array directly
    if (Array.isArray(availability)) {
      return {
        teacherId: undefined as unknown as string,
        schedule: this.normalizeSchedule(availability),
        updatedAt: undefined,
      };
    }

    // Fallback: not a recognized shape
    return null;
  }

  private normalizeSchedule(schedule: unknown): SlotStatus[][] {
    const normalized: SlotStatus[][] = Array.from({ length: 7 }, () => Array(12).fill(null)) as SlotStatus[][];
    if (!Array.isArray(schedule)) {
      return normalized;
    }

    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
      const day = Array.isArray(schedule[dayIndex]) ? schedule[dayIndex] : [];
      for (let slotIndex = 0; slotIndex < 12; slotIndex++) {
        const slot = day[slotIndex];
        const value: SlotStatus =
          slot === 'available' || slot === 'booked' ? slot : null;
        normalized[dayIndex][slotIndex] = value;
      }
    }

    return normalized;
  }

  private transformBackendReviewsToFrontendFormat(reviews: any[]): Review[] {
    return reviews.map((review) => {
      const studentUser = review?.studentId?.userId || {};
      return {
        id: review?._id?.toString?.() || review?._id,
        name: studentUser.fullName || 'طالب',
        time: this.formatRelativeTime(review?.createdAt),
        rating: Number(review?.stars) || 0,
        comment: review?.comment || '',
        avatar: studentUser.avatar || '',
      };
    });
  }

  private parsePrice(value: unknown): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : 0;
    }
    if (value && typeof value === 'object') {
      const obj = value as { $numberDecimal?: string; toString?: () => string };
      if (obj.$numberDecimal) {
        const parsed = Number(obj.$numberDecimal);
        return Number.isFinite(parsed) ? parsed : 0;
      }
      if (typeof obj.toString === 'function') {
        const parsed = Number(obj.toString());
        return Number.isFinite(parsed) ? parsed : 0;
      }
    }
    return 0;
  }

  private normalizeTextOrJsonString(value: unknown): string {
    // If backend already sends an array/object, stringify it so UI can parse
    if (Array.isArray(value) || (value !== null && typeof value === 'object')) {
      try {
        return JSON.stringify(value);
      } catch {
        // Fall through to empty string if stringify fails
        return '';
      }
    }
    if (typeof value !== 'string') return '';
    const trimmed = value.trim();
    if (!trimmed) return '';

    // Keep valid JSON arrays/objects as-is because UI components parse them.
    if (
      (trimmed.startsWith('[') && trimmed.endsWith(']')) ||
      (trimmed.startsWith('{') && trimmed.endsWith('}'))
    ) {
      try {
        JSON.parse(trimmed);
        return trimmed;
      } catch {
        // Fall back to plain text wrapper below.
      }
    }

    // Wrap plain text as one display item so existing UI parsers can render it.
    return JSON.stringify([{ title: trimmed, subject: trimmed }]);
  }

  private formatRelativeTime(value: string | Date | undefined): string {
    if (!value) return 'حديثا';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'حديثا';
    const diffMs = Date.now() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return 'اليوم';
    if (diffDays === 1) return 'قبل يوم';
    if (diffDays < 7) return `قبل ${diffDays} أيام`;
    const diffWeeks = Math.floor(diffDays / 7);
    if (diffWeeks === 1) return 'قبل أسبوع';
    if (diffWeeks < 5) return `قبل ${diffWeeks} أسابيع`;
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths === 1) return 'قبل شهر';
    return `قبل ${diffMonths} أشهر`;
  }

  /**
   * Create a new teacher application
   * Uses backend API - applications are created via step1/step2 endpoints
   */
  async createApplication(data: CreateApplicationData): Promise<string> {
    try {
      await teacherApplicationApi.saveStep1({
        fullName: data.fullName || '',
        email: data.email || '',
        phone: data.phone || '',
        countryCode: data.countryCode || '',
        gender: data.gender || '',
        nationality: data.nationality || '',
        yearsOfExperience: data.yearsOfExperience || 0,
        languages: data.languages || [],
        title: data.title || '',
      });
      return 'application-created';
    } catch (error) {
      console.error('Error creating teacher application:', error);
      throw error;
    }
  }

  /**
   * Update teacher application
   * Uses backend API
   */
  async updateApplication(applicationId: string, data: Partial<TeacherApplication>): Promise<void> {
    try {
      // Update via profile endpoint if it's profile-related data
      if (data.bio || data.yearsOfExperience || data.teachingStyle || data.sessionContent || data.introVideo) {
        await apiClient.patch('/teachers/me/profile', {
          bio: data.bio,
          experienceYears: data.yearsOfExperience, // Backend expects experienceYears
          teachingStyle: data.teachingStyle,
          sessionContent: data.sessionContent,
          introVideo: data.introVideo,
        });
      }
    } catch (error) {
      console.error('Error updating teacher application:', error);
      throw error;
    }
  }

  /**
   * Update personal info (teaching style, session content, intro video)
   * Uses backend API
   */
  async updatePersonalInfo(applicationId: string, data: PersonalInfoData): Promise<void> {
    try {
      await apiClient.patch('/teachers/me/profile', {
        bio: data.bio,
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
   * Uses backend API
   */
  async saveQualifications(applicationId: string, qualifications: Qualification[]): Promise<void> {
    try {
      await apiClient.post('/teachers/me/qualifications', { qualifications });
    } catch (error) {
      console.error('Error saving qualifications:', error);
      throw error;
    }
  }

  /**
   * Get ijazahs
   * Uses backend API
   */
  async getIjazahs(teacherId: string): Promise<Ijazah[]> {
    try {
      const response = await apiClient.get<{ ijazahs: Ijazah[] }>('/teachers/me/ijazahs');
      return response.ijazahs || [];
    } catch (error) {
      console.error('Error getting ijazahs:', error);
      return [];
    }
  }

  /**
   * Save ijazah
   * Uses backend API
   */
  async saveIjazah(ijazah: Omit<Ijazah, 'id'>): Promise<string> {
    try {
      const response = await apiClient.post<{ ijazah: Ijazah & { _id?: any } }>('/teachers/me/ijazahs', ijazah);
      // Handle MongoDB _id format and convert to id
      const savedIjazah = response.ijazah;
      return savedIjazah._id?.toString() || savedIjazah.id || '';
    } catch (error) {
      console.error('Error saving ijazah:', error);
      throw error;
    }
  }

  /**
   * Update ijazah
   * Uses backend API
   */
  async updateIjazah(ijazahId: string, data: Partial<Ijazah>): Promise<void> {
    try {
      await apiClient.patch(`/teachers/me/ijazahs/${ijazahId}`, data);
    } catch (error) {
      console.error('Error updating ijazah:', error);
      throw error;
    }
  }

  /**
   * Delete ijazah
   * Uses backend API
   */
  async deleteIjazah(ijazahId: string): Promise<void> {
    try {
      await apiClient.delete(`/teachers/me/ijazahs/${ijazahId}`);
    } catch (error) {
      console.error('Error deleting ijazah:', error);
      throw error;
    }
  }

  /**
   * Get availability
   * Uses backend API
   */
  async getAvailability(teacherId: string): Promise<Availability | null> {
    try {
      const response = await apiClient.get<{ availability: any }>('/teachers/me/availability');
      return this.transformAvailabilityToFrontendFormat(response.availability);
    } catch (error) {
      console.error('Error getting availability:', error);
      return null;
    }
  }

  /**
   * Save availability with smart merging to preserve booked slots
   * This ensures that booked slots from student subscriptions are never overwritten
   * Uses backend API
   */
  async saveAvailability(availability: Availability): Promise<void> {
    try {
      // Get current availability from database to preserve booked slots
      const currentAvailability = await this.getAvailability(availability.teacherId);
      
      let scheduleToSave = availability.schedule;
      
      if (currentAvailability) {
        // Merge: preserve booked slots, allow changes to available/null slots
        scheduleToSave = this.mergeAvailabilitySchedules(
          currentAvailability.schedule,
          availability.schedule
        ) as SlotStatus[][];
      } else {
        // No existing availability, ensure all slots are explicitly set
        const completeSchedule: (string | null)[][] = Array(7)
          .fill(null)
          .map(() => Array(12).fill(null));
        
        // Copy user's schedule
        for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
          for (let timeIndex = 0; timeIndex < 12; timeIndex++) {
            completeSchedule[dayIndex][timeIndex] = availability.schedule[dayIndex]?.[timeIndex] ?? null;
          }
        }
        
        scheduleToSave = completeSchedule as SlotStatus[][];
      }
      
      // Save via backend API
      await apiClient.post('/teachers/me/availability', {
        teacherId: availability.teacherId,
        schedule: scheduleToSave,
      });
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
   * Uses backend API
   */
  async getTeacherRating(teacherId: string): Promise<{ rating: number; count: number }> {
    try {
      if (!teacherId) {
        return { rating: 0, count: 0 };
      }
      const response = await apiClient.get<{ teacher: { rating?: number; ratingAvg?: number; reviewsCount?: number; ratingCount?: number } }>(`/teachers/${teacherId}`);
      return {
        rating: response.teacher?.rating ?? response.teacher?.ratingAvg ?? 0,
        count: response.teacher?.reviewsCount ?? response.teacher?.ratingCount ?? 0,
      };
    } catch (error) {
      console.error('Error getting teacher rating:', error);
      return { rating: 0, count: 0 };
    }
  }

  /**
   * Get completed sessions count
   * Uses backend API
   */
  async getCompletedSessionsCount(teacherId: string): Promise<number> {
    try {
      // Backend currently exposes completed sessions count only for the authenticated teacher.
      // For public teacher cards, avoid calling a protected endpoint that returns 403.
      if (!teacherId) {
        const response = await apiClient.get<{ count: number }>('/teachers/me/sessions/completed-count');
        return response.count || 0;
      }
      return 0;
    } catch (error) {
      console.error('Error getting completed sessions count:', error);
      return 0;
    }
  }

}

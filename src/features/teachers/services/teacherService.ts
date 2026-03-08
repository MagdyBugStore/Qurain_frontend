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

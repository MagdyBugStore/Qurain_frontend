/**
 * Booking Service
 * Business logic layer for booking operations
 */

import { TeacherRepository } from '../infrastructure/firebase/repositories/TeacherRepository';
import { TeacherService } from './teacherService';
import { TEACHER_APPLICATION_STATUS } from '../constants/status';

export class BookingService {
  private teacherRepository: TeacherRepository;
  private teacherService: TeacherService;

  constructor() {
    this.teacherRepository = new TeacherRepository();
    this.teacherService = new TeacherService();
  }

  /**
   * Get teacher data for booking
   */
  async getTeacherForBooking(teacherId: string) {
    try {
      return await this.teacherService.getTeacherDetailById(teacherId);
    } catch (error) {
      console.error('Error getting teacher for booking:', error);
      throw error;
    }
  }

  /**
   * Check if teacher is available
   */
  async checkTeacherAvailability(teacherId: string): Promise<boolean> {
    try {
      const application = await this.teacherRepository.findApprovedByUserId(teacherId);
      return application?.status === TEACHER_APPLICATION_STATUS.APPROVED;
    } catch (error) {
      console.error('Error checking teacher availability:', error);
      return false;
    }
  }
}

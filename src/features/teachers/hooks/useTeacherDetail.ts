/**
 * useTeacherDetail Hook
 * Custom hook for fetching and managing teacher detail data
 */

import { useState, useEffect } from 'react';
import { TeacherService } from '../services/teacherService';
import type { TeacherDetailData } from '../../../shared/types/teacher.types';

interface UseTeacherDetailResult {
  data: TeacherDetailData | null;
  loading: boolean;
  error: Error | null;
}

const TEST_TEACHER_ID = 'test-teacher-123';

/**
 * Mock data for test teacher
 */
function getMockTeacherData(): TeacherDetailData {
  return {
    application: {
      id: TEST_TEACHER_ID,
      fullName: 'الشيخ أحمد محمد',
      email: 'ahmed@example.com',
      phone: '501234567',
      countryCode: '+966',
      gender: 'male',
      nationality: 'القاهرة، مصر',
      yearsOfExperience: 15,
      educationLevel: 'دكتوراة في التفسير وعلوم القرآن',
      bio: 'السلام عليكم ورحمة الله وبركاته، أنا الشيخ أحمد محمد، مدرس قرآن كريم وتجويد وقراءات معتمد من الأزهر الشريف. لدي شغف كبير بتعليم كتاب الله للطلاب من جميع الأعمار والمستويات. بفضل الله، قمت بتدريس مئات الطلاب حول العالم عبر الإنترنت، وأتميز بأسلوب تعليمي مرن يتناسب مع قدرات كل طالب. سواء كنت مبتدئاً في تعلم القراءة العربية أو ترغب في إتقان أحكام التجويد المتقدمة والحصول على إجازة، فأنا هنا لمساعدتك في رحلتك المباركة.',
      subjects: ['حفظ القرآن', 'تجويد', 'قراءات'],
      hourlyRate: 150,
      currency: 'EGP',
      status: 'approved',
    },
    profile: {
      uid: TEST_TEACHER_ID,
      firstName: 'أحمد',
      lastName: 'محمد',
      displayName: 'الشيخ أحمد محمد',
      photoURL: 'https://lh3.googleusercontent.com/aida-public/AB6AXuANceWlhvlc5OzyEQ6Yw5RuVW0W5G1RQpo9Cjj6vuonq6SDWjA3GyxPV_S4eFslf3V1rwsQubSIL6zJZOTE4fNRB8Mz8IjNwygqUGBKvFWBdnpgV0KFhaTxrCrP75bX-cliClUezCSQF0dkFVyux2zbD4XpISu50SyBWXWxAldf9Jx-jyB4xzXt9JpodwWI26p90gZ53j_lwg5jfqkschS94M6KkQC0kqP4WWrJd2EAobsTH2DFB9t0oaOwKI_2aoZD2guovmb1yZBg',
      email: 'ahmed@example.com',
    },
    rating: 5.0,
    reviewsCount: 120,
    reviews: [],
    qualifications: [],
    availability: [],
  };
}

export function useTeacherDetail(userId: string | undefined): UseTeacherDetailResult {
  const [data, setData] = useState<TeacherDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    // Handle test teacher ID
    if (userId === TEST_TEACHER_ID) {
      setData(getMockTeacherData());
      setLoading(false);
      return;
    }

    const fetchTeacherData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const teacherService = new TeacherService();
        const teacherData = await teacherService.getTeacherDetailById(userId);
        
        setData(teacherData);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to fetch teacher data');
        setError(error);
        console.error('Error fetching teacher data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherData();
  }, [userId]);

  return { data, loading, error };
}

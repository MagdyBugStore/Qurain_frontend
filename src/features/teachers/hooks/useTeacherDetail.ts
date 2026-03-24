/**
 * useTeacherDetail Hook
 * Custom hook for fetching and managing teacher detail data
 */

import { useState, useEffect } from 'react';
import { TeacherService } from '../../../services/teacherService';
import type { TeacherDetailData } from '../../../shared/types/teacher.types';

interface UseTeacherDetailResult {
  data: TeacherDetailData | null;
  loading: boolean;
  error: Error | null;
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

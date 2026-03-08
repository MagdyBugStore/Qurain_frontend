/**
 * useTeacherProfile Hook
 * Manages teacher profile data fetching and state
 */

import { useState, useEffect } from 'react';
import { TeacherRepository } from '../../../../infrastructure/firebase/repositories/TeacherRepository';
import { GetTeacherProfile } from '../../application/use-cases/GetTeacherProfile';
import type { TeacherProfileData } from '../../application/use-cases/GetTeacherProfile';

export function useTeacherProfile(userId: string | undefined) {
  const [data, setData] = useState<TeacherProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const repository = new TeacherRepository();
        const useCase = new GetTeacherProfile(repository);
        const profileData = await useCase.execute(userId);
        
        setData(profileData);
      } catch (err) {
        console.error('Error fetching teacher profile:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch profile'));
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  const refetch = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const repository = new TeacherRepository();
      const useCase = new GetTeacherProfile(repository);
      const profileData = await useCase.execute(userId);
      
      setData(profileData);
    } catch (err) {
      console.error('Error refetching teacher profile:', err);
      setError(err instanceof Error ? err : new Error('Failed to refetch profile'));
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch };
}

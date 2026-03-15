/**
 * Hook for fetching and managing teacher profile data
 */

import { useState, useEffect } from 'react';
import { TeacherService } from '../../../services/teacherService';
import type { TeacherApplication, TeacherProfile, Qualification, Review } from '../../../shared/types/teacher.types';
import { parseBenefitsFromJSON, parseSessionContentFromJSON } from '../utils/dataParsing';
import { INITIAL_AVAILABILITY } from '../constants/schedule';
import type { Benefit, SessionContentItem, Ijazah } from '../types';

export interface UseTeacherProfileDataReturn {
  teacherApplication: TeacherApplication | null;
  teacherProfile: TeacherProfile | null;
  rating: number;
  reviewsCount: number;
  reviews: Review[];
  qualifications: Qualification[];
  ijazahs: Ijazah[];
  availability: (string | null)[][];
  benefits: Benefit[];
  sessionContent: SessionContentItem[];
  personalInfo: {
    teachingStyle: string;
    sessionContent: string;
    introVideo: string;
  };
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useTeacherProfileData(userId: string | undefined): UseTeacherProfileDataReturn {
  const [teacherApplication, setTeacherApplication] = useState<TeacherApplication | null>(null);
  const [teacherProfile, setTeacherProfile] = useState<TeacherProfile | null>(null);
  const [rating, setRating] = useState(0);
  const [reviewsCount, setReviewsCount] = useState(0);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [qualifications, setQualifications] = useState<Qualification[]>([]);
  const [ijazahs, setIjazahs] = useState<Ijazah[]>([]);
  const [availability, setAvailability] = useState<(string | null)[][]>(INITIAL_AVAILABILITY);
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [sessionContent, setSessionContent] = useState<SessionContentItem[]>([]);
  const [personalInfo, setPersonalInfo] = useState({
    teachingStyle: '',
    sessionContent: '',
    introVideo: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTeacherData = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const teacherService = new TeacherService();
      const profileData = await teacherService.getTeacherProfileData(userId);

      if (profileData.application) {
        setTeacherApplication(profileData.application);
      }

      if (profileData.profile) {
        setTeacherProfile(profileData.profile);
      }

      setRating(profileData.rating);
      setReviewsCount(profileData.reviewsCount);
      setReviews(profileData.reviews || []);
      setQualifications(profileData.qualifications);

      if (profileData.application) {
        setPersonalInfo({
          teachingStyle: profileData.application.teachingStyle || '',
          sessionContent: profileData.application.sessionContent || '',
          introVideo: profileData.application.introVideo || '',
        });

        // Parse benefits and session content
        const parsedBenefits = parseBenefitsFromJSON(profileData.application.teachingStyle);
        const parsedSessionContent = parseSessionContentFromJSON(profileData.application.sessionContent);
        setBenefits(parsedBenefits);
        setSessionContent(parsedSessionContent);
      }

      setIjazahs(profileData.ijazahs as Ijazah[]);

      if (profileData.availability && profileData.availability.schedule) {
        setAvailability(profileData.availability.schedule);
      } else {
        setAvailability(INITIAL_AVAILABILITY);
      }
    } catch (err) {
      console.error('Error fetching teacher data:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeacherData();
  }, [userId]);

  return {
    teacherApplication,
    teacherProfile,
    rating,
    reviewsCount,
    reviews,
    qualifications,
    ijazahs,
    availability,
    benefits,
    sessionContent,
    personalInfo,
    loading,
    error,
    refetch: fetchTeacherData,
  };
}

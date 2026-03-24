/**
 * Teacher Domain Types
 * Centralized type definitions for teacher-related entities
 */

export type TeacherStatus = 'incomplete' | 'pending' | 'approved' | 'rejected';

export type Currency = 'SAR' | 'USD' | 'EGP';

export type TabType = 'personal' | 'availability' | 'reviews';

export interface TeacherApplication {
  id: string;
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
  currency?: Currency;
  status?: TeacherStatus;
  createdAt?: any;
  updatedAt?: any;
  userId?: string;
  teachingStyle?: string;
  sessionContent?: string;
  introVideo?: string;
  ijazahs?: Array<{
    title: string;
    description: string;
    image: string;
  }>;
  // Admin dashboard specific fields (optional)
  avatar?: string;
  isIncomplete?: boolean;
  languages?: string[];
  title?: string;
}

export interface TeacherProfile {
  uid?: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  photoURL?: string;
  email?: string;
}

export interface Teacher {
  id: string;
  name: string;
  specialty: string;
  description: string;
  rating: number;
  reviews: number;
  price: number;
  currency?: Currency;
  image: string;
  tags: string[];
  hours: number;
  students: number;
  qualification: string;
  languages: string;
  completedSessions: number;
  gender?: string;
}

export interface Qualification {
  title: string;
  institution: string;
  year: string;
}

export interface Review {
  id?: string;
  name: string;
  time: string;
  rating: number;
  comment: string;
  avatar: string;
}

export interface AvailabilitySlot {
  status: 'available' | 'booked' | null;
}

export interface TeacherDetailData {
  application: TeacherApplication;
  profile: TeacherProfile;
  rating: number;
  reviewsCount: number;
  reviews: Review[];
  qualifications: Qualification[];
  availability: (string | null)[][];
}

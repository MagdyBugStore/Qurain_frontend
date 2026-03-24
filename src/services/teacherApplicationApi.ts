import { apiClient } from '../lib/apiClient';

export type TeacherApplicationStep = 'step1' | 'step2' | 'review' | 'submitted';

export interface TeacherApplicationDraft {
  _id: string;
  userId: string;
  currentStep: TeacherApplicationStep;
  step1: {
    fullName: string;
    email: string;
    phone: string;
    countryCode: string;
    gender: string;
    nationality: string;
    yearsOfExperience: number;
    languages: string[];
    title: string;
  };
  step2: {
    educationLevel: string;
    certificatesCount: number;
    bio: string;
    introVideo?: string;
    subjects?: string[];
    hourlyRate?: number;
    currency?: string;
    teachingStyle?: string; // JSON string for benefits array
    sessionContent?: string; // JSON string for session content items array
    ijazahs?: Array<{
      title: string;
      description: string;
      image: string;
    }>;
  };
  submittedAt?: string | null;
}

export const teacherApplicationApi = {
  async getMyApplication(): Promise<TeacherApplicationDraft | null> {
    const data = await apiClient.get<{ application: TeacherApplicationDraft | null }>('/teachers/me/application');
    return data.application;
  },

  async saveStep1(payload: TeacherApplicationDraft['step1']): Promise<TeacherApplicationDraft> {
    const data = await apiClient.patch<{ application: TeacherApplicationDraft }>('/teachers/me/application/step1', payload);
    return data.application;
  },

  async saveStep2(payload: TeacherApplicationDraft['step2']): Promise<TeacherApplicationDraft> {
    const data = await apiClient.patch<{ application: TeacherApplicationDraft }>('/teachers/me/application/step2', payload);
    return data.application;
  },

  async submit(): Promise<TeacherApplicationDraft> {
    const data = await apiClient.post<{ application: TeacherApplicationDraft }>('/teachers/me/application/submit');
    return data.application;
  },
};


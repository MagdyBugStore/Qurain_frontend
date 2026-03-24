import { apiClient } from '../lib/apiClient';

interface TeacherProfile {
  _id: string;
  userId: string;
  approvalStatus: 'incomplete' | 'pending' | 'approved' | 'rejected' | 'suspended';
  bio?: string;
  experienceYears?: number;
  sessionPrice?: number;
  ratingAvg?: number;
  ratingCount?: number;
  languages?: string[];
  qualifications?: Array<{
    title: string;
    issuer?: string;
    issuedYear?: number;
    certificateUrl?: string;
  }>;
  ijazahs?: Array<{
    title: string;
    issuer?: string;
    issuedYear?: number;
    certificateUrl?: string;
    description?: string;
  }>;
}

interface SubmitApplicationResponse {
  profile: TeacherProfile;
  message: string;
}

export const teacherApi = {
  /**
   * Submit teacher application (complete personal-info)
   * Sets approvalStatus to 'pending' when teacher completes their application
   */
  async submitApplication(): Promise<SubmitApplicationResponse> {
    const data = await apiClient.post<SubmitApplicationResponse>('/teachers/me/submit-application');
    return data;
  },
};

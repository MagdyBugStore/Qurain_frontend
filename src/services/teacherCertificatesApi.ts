import { apiClient } from '../lib/apiClient';

export interface TeacherCertificate {
  _id: string;
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  url: string;
  uploadedAt?: string;
}

export const teacherCertificatesApi = {
  async listMyCertificates(): Promise<TeacherCertificate[]> {
    const data = await apiClient.get<{ certificates: TeacherCertificate[] }>(
      '/teachers/me/certificates'
    );
    return data.certificates || [];
  },

  async uploadMyCertificates(files: File[]): Promise<TeacherCertificate[]> {
    const formData = new FormData();
    files.forEach((f) => formData.append('certificates', f));
    const data = await apiClient.postFormData<{ certificates: TeacherCertificate[] }>(
      '/teachers/me/certificates',
      formData
    );
    return data.certificates || [];
  },

  async deleteMyCertificate(certificateId: string): Promise<void> {
    await apiClient.delete(`/teachers/me/certificates/${certificateId}`);
  },
};


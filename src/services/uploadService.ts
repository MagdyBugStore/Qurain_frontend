/**
 * Upload service for handling file uploads (images and videos)
 */

const viteEnv: any = (import.meta as any).env || {};
const API_BASE_URL = viteEnv.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

let token: string | null = null;

function getToken(): string | null {
  if (!token) {
    token = localStorage.getItem('auth_token');
  }
  return token;
}

export interface UploadedFile {
  id: string;
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  url: string;
  processing?: boolean;
}

export interface UploadResponse {
  file: UploadedFile;
}

/**
 * Upload a video file to the backend
 * @param videoFile - The video file to upload
 * @param onProgress - Optional progress callback
 * @returns Promise with uploaded file data
 */
export async function uploadVideo(
  videoFile: File,
  onProgress?: (progress: number) => void
): Promise<UploadedFile> {
  const formData = new FormData();
  formData.append('video', videoFile);

  const xhr = new XMLHttpRequest();

  return new Promise((resolve, reject) => {
    // Handle progress
    if (onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100;
          onProgress(progress);
        }
      });
    }

    // Handle completion
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          if (response.success && response.data?.file) {
            resolve(response.data.file);
          } else {
            reject(new Error(response.error?.message || 'Upload failed'));
          }
        } catch (error) {
          reject(new Error('Failed to parse response'));
        }
      } else {
        try {
          const error = JSON.parse(xhr.responseText);
          reject(new Error(error.error?.message || `Upload failed with status ${xhr.status}`));
        } catch {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      }
    });

    // Handle errors
    xhr.addEventListener('error', () => {
      reject(new Error('Network error during upload'));
    });

    xhr.addEventListener('abort', () => {
      reject(new Error('Upload was aborted'));
    });

    // Open and send request
    xhr.open('POST', `${API_BASE_URL}/uploads/video`);
    
    const authToken = getToken();
    if (authToken) {
      xhr.setRequestHeader('Authorization', `Bearer ${authToken}`);
    }

    xhr.send(formData);
  });
}

/**
 * Upload an image file to the backend
 * @param imageFile - The image file to upload
 * @param onProgress - Optional progress callback
 * @returns Promise with uploaded file data
 */
export async function uploadImage(
  imageFile: File,
  onProgress?: (progress: number) => void
): Promise<UploadedFile> {
  const formData = new FormData();
  formData.append('image', imageFile);

  const xhr = new XMLHttpRequest();

  return new Promise((resolve, reject) => {
    // Handle progress
    if (onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100;
          onProgress(progress);
        }
      });
    }

    // Handle completion
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          if (response.success && response.data?.file) {
            resolve(response.data.file);
          } else {
            reject(new Error(response.error?.message || 'Upload failed'));
          }
        } catch (error) {
          reject(new Error('Failed to parse response'));
        }
      } else {
        try {
          const error = JSON.parse(xhr.responseText);
          reject(new Error(error.error?.message || `Upload failed with status ${xhr.status}`));
        } catch {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      }
    });

    // Handle errors
    xhr.addEventListener('error', () => {
      reject(new Error('Network error during upload'));
    });

    xhr.addEventListener('abort', () => {
      reject(new Error('Upload was aborted'));
    });

    // Open and send request
    xhr.open('POST', `${API_BASE_URL}/uploads/image`);
    
    const authToken = getToken();
    if (authToken) {
      xhr.setRequestHeader('Authorization', `Bearer ${authToken}`);
    }

    xhr.send(formData);
  });
}

/**
 * Get full video URL for streaming
 * @param videoUrl - The video URL (relative or absolute)
 * @returns Full URL for video streaming
 */
export function getVideoStreamUrl(videoUrl: string): string {
  if (!videoUrl) return '';
  
  // If it's already a full URL, return as-is
  if (videoUrl.startsWith('http://') || videoUrl.startsWith('https://')) {
    return videoUrl;
  }
  
  // If it's a backend video path, construct full URL
  if (videoUrl.includes('/uploads/videos/')) {
    const baseUrl = API_BASE_URL.replace('/api/v1', '');
    // Remove /api/v1 if already present in path
    const cleanPath = videoUrl.startsWith('/api/v1') ? videoUrl : videoUrl;
    return `${baseUrl}${cleanPath}`;
  }
  
  return videoUrl;
}

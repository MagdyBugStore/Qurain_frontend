/**
 * Video embedding utilities
 */

/**
 * Check if URL is a YouTube URL
 */
export function isYouTubeUrl(url: string): boolean {
  return url.includes('youtube.com') || url.includes('youtu.be');
}

/**
 * Check if URL is a Vimeo URL
 */
export function isVimeoUrl(url: string): boolean {
  return url.includes('vimeo.com');
}

/**
 * Check if URL is a backend video URL (uploaded file)
 */
export function isBackendVideoUrl(url: string): boolean {
  if (!url) return false;
  // Check if it's a backend upload URL (starts with /uploads/videos/ or contains API base URL)
  return url.includes('/uploads/videos/') || url.includes('/api/v1/uploads/');
}

/**
 * Get video embed URL from various video platform URLs
 * Supports YouTube, Vimeo, and backend uploaded videos
 */
export function getVideoEmbedUrl(url: string): string | null {
  if (!url) return null;

  // Check if it's a backend video (uploaded file)
  if (isBackendVideoUrl(url)) {
    // Return the URL as-is for direct video playback
    // The video will be played using <video> tag, not iframe
    return url;
  }

  if (isYouTubeUrl(url)) {
    if (url.includes('youtu.be')) {
      const videoId = url.split('/').pop()?.split('?')[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    } else if (url.includes('youtube.com')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }
  }

  if (isVimeoUrl(url)) {
    const videoId = url.split('/').pop();
    return videoId ? `https://player.vimeo.com/video/${videoId}` : null;
  }

  return null;
}

/**
 * Get full video URL for backend videos
 * Constructs the full URL from backend base URL if needed
 */
export function getFullVideoUrl(url: string): string {
  if (!url) return '';
  
  // If it's already a full URL, return as-is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // If it's a backend video path, construct full URL
  if (isBackendVideoUrl(url)) {
    const viteEnv: any = (import.meta as any).env || {};
    const API_BASE_URL = viteEnv.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';
    
    // Remove /api/v1 if already present
    const cleanPath = url.startsWith('/api/v1') ? url : `/api/v1${url}`;
    
    // Construct full URL
    const baseUrl = API_BASE_URL.replace('/api/v1', '');
    return `${baseUrl}${cleanPath}`;
  }
  
  return url;
}

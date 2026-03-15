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
 * Get video embed URL from various video platform URLs
 */
export function getVideoEmbedUrl(url: string): string | null {
  if (!url) return null;

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

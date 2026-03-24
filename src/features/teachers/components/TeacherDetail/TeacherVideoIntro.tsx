/**
 * Teacher Video Intro Component
 * Displays teacher introduction video (from backend upload or external URLs)
 */

import React from 'react';
import { getVideoEmbedUrl, isBackendVideoUrl, getFullVideoUrl } from '../../../../app/teacher-profile/utils/videoEmbed';

interface TeacherVideoIntroProps {
  introVideo?: string;
}

export function TeacherVideoIntro({ introVideo }: TeacherVideoIntroProps) {
  if (!introVideo) {
    return (
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-gray-200">
        <div className="text-center">
          <span className="material-symbols-outlined text-5xl text-slate-400 mb-2">play_circle</span>
          <p className="text-sm text-slate-500 dark:text-slate-400">لا يوجد فيديو تعريفي</p>
        </div>
      </div>
    );
  }

  const embedUrl = getVideoEmbedUrl(introVideo);
  const isBackendVideo = isBackendVideoUrl(introVideo);
  const fullVideoUrl = isBackendVideo ? getFullVideoUrl(introVideo) : introVideo;

  // Backend video - use video tag
  if (isBackendVideo && embedUrl) {
    return (
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black border border-gray-200">
        <video
          src={fullVideoUrl}
          controls
          className="w-full h-full object-contain"
          preload="metadata"
        >
          متصفحك لا يدعم تشغيل الفيديو
        </video>
      </div>
    );
  }

  // YouTube/Vimeo - use iframe
  if (embedUrl && (embedUrl.includes('youtube.com') || embedUrl.includes('vimeo.com'))) {
    const isYouTube = embedUrl.includes('youtube.com');
    return (
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black border border-gray-200">
        <iframe
          src={embedUrl}
          className="absolute top-0 left-0 w-full h-full"
          allow={isYouTube ? "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" : "autoplay; fullscreen; picture-in-picture"}
          allowFullScreen
        />
      </div>
    );
  }

  // If it's not a recognized video platform, show as link
  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-gray-200">
      <a
        href={introVideo}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary hover:underline font-medium"
      >
        فتح رابط الفيديو
      </a>
    </div>
  );
}

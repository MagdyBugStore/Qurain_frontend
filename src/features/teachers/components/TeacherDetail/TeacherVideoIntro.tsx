/**
 * Teacher Video Intro Component
 * Displays teacher introduction video from Firestore
 */

import React from 'react';

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

  // Check if it's YouTube
  const isYouTube = introVideo.includes('youtube.com') || introVideo.includes('youtu.be');
  // Check if it's Vimeo
  const isVimeo = introVideo.includes('vimeo.com');

  let embedUrl = '';
  if (isYouTube) {
    if (introVideo.includes('youtu.be')) {
      embedUrl = `https://www.youtube.com/embed/${introVideo.split('/').pop()}`;
    } else {
      embedUrl = `https://www.youtube.com/embed/${introVideo.split('v=')[1]?.split('&')[0]}`;
    }
  } else if (isVimeo) {
    embedUrl = `https://player.vimeo.com/video/${introVideo.split('/').pop()}`;
  }

  if (embedUrl) {
    return (
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black border border-gray-200">
        {isYouTube ? (
          <iframe
            src={embedUrl}
            className="absolute top-0 left-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <iframe
            src={embedUrl}
            className="absolute top-0 left-0 w-full h-full"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        )}
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

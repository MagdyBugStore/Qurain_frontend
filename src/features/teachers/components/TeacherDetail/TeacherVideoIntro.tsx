/**
 * Teacher Video Intro Component
 * Displays teacher introduction video placeholder
 */

import React from 'react';

export function TeacherVideoIntro() {
  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black group cursor-pointer border border-gray-200">
      <img
        alt="Video Thumbnail"
        className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity duration-300"
        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBhqaLFUgcVDuNJCHh-z1GVIdE4ak-tKUGKDWgKwgfDYLKnRPbg493jiA6nC1Q5lWG56VlQdCA8DqixPqhqwUhhw97b9SR7TFEanLVVKZsoeon4JoAnyttwIkVkpOQahnQF5ARsYL5tMY1bqMah-XplMfWVRLCzzNA2pNWIqdKfwhEij8AHF0zeEHmh4K2YyW3NtflVieWkLsaIGbWqOS2eGGrDCugWc5Z2DxLaBm46CIkSAtGtqYjZYDg1ou9nv8IQ0L_TmTZApInE"
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <button className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/90 text-text-dark rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-primary/20 pl-1">
          <span className="material-symbols-outlined text-4xl sm:text-5xl">play_arrow</span>
        </button>
      </div>
      <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur px-3 py-1 rounded text-white text-sm font-medium">
        02:15 دقيقة
      </div>
    </div>
  );
}

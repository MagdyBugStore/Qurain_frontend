/**
 * Teacher Detail Header Component
 * Displays teacher profile header with avatar, name, and badges
 */

import React from 'react';
import type { TeacherApplication, TeacherProfile } from '../../../../shared/types/teacher.types';
import { getTeacherDisplayName, getTeacherTitle, getTeacherImageUrl } from '../../../../shared/utils/teacher';

interface TeacherDetailHeaderProps {
  application: TeacherApplication;
  profile: TeacherProfile | null;
  rating: number;
  reviewsCount: number;
}

export function TeacherDetailHeader({
  application,
  profile,
  rating,
  reviewsCount,
}: TeacherDetailHeaderProps) {
  const teacherName = getTeacherDisplayName(profile, application);
  const teacherTitle = getTeacherTitle(application);
  const profileImage = getTeacherImageUrl(profile);
  const isApproved = application.status === 'approved';

  return (
    <div className="bg-bg-card rounded-xl p-6 border border-gray-200">
      <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
        <div className="relative shrink-0">
          <img
            alt={`صورة ${teacherName}`}
            className="w-32 h-32 rounded-full object-cover border-4 border-primary/20"
            src={profileImage}
          />
          <div className="absolute bottom-1 right-1 bg-green-500 rounded-full p-1 border-2 border-bg-card">
            <span className="block w-3 h-3 bg-white rounded-full"></span>
          </div>
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-text-dark">{teacherName}</h1>
            {isApproved && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <span className="material-symbols-outlined text-[14px]">verified</span>
                تم التحقق
              </span>
            )}
          </div>
          <p className="text-text-light text-lg">{teacherTitle}</p>
          <div className="flex flex-wrap gap-2 pt-2">
            {rating > 0 && (
              <div className="flex items-center gap-1 text-primary text-sm font-bold bg-primary/10 px-3 py-1 rounded-lg">
                <span className="material-symbols-outlined text-[18px] filled">star</span>
                {rating.toFixed(1)} ({reviewsCount} تقييم)
              </div>
            )}
            {application.nationality && (
              <div className="flex items-center gap-1 text-text-light text-sm bg-gray-100 px-3 py-1 rounded-lg">
                <span className="material-symbols-outlined text-[18px]">location_on</span>
                {application.nationality}
              </div>
            )}
            <div className="flex items-center gap-1 text-text-light text-sm bg-gray-100 px-3 py-1 rounded-lg">
              <span className="material-symbols-outlined text-[18px]">translate</span>
              يتحدث العربية والإنجليزية
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

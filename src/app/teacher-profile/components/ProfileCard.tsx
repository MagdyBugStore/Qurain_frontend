/**
 * Profile card component for sidebar
 */

import { PersonalInfoSection } from './PersonalInfoSection';
import type { TeacherApplication, TeacherProfile } from '../../../shared/types/teacher.types';
import React from 'react';

interface ProfileCardProps {
  teacherName: string;
  teacherTitle: string;
  profileImage: string;
  rating: number;
  reviewsCount: number;
  sessionPrice: number;
  currency: string;
  yearsOfExperience?: number;
  nationality?: string;
  isApproved: boolean;
  isPending: boolean;
  teacherApplication: TeacherApplication | null;
  teacherProfile: TeacherProfile | null;
  userProfile: any;
  user: any;
  isEditingPersonalInfo: boolean;
  onToggleEditPersonalInfo: () => void;
  onEditProfile: () => void;
  onSave: (message: { type: 'success' | 'error'; text: string }) => void;
}

export function ProfileCard({
  teacherName,
  teacherTitle,
  profileImage,
  rating,
  reviewsCount,
  sessionPrice,
  currency,
  yearsOfExperience,
  nationality,
  isApproved,
  isPending,
  teacherApplication,
  teacherProfile,
  userProfile,
  user,
  isEditingPersonalInfo,
  onToggleEditPersonalInfo,
  onEditProfile,
  onSave,
}: ProfileCardProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl shadow-gray-200/50 dark:shadow-slate-900/50 border border-gray-100 dark:border-slate-700 flex flex-col items-center text-center">
      {/* Avatar Section */}
      <div className="relative mb-6">
        <div className="w-40 h-40 rounded-full border-4 border-primary dark:border-primary/80 p-1 shadow-inner">
          <img
            alt={`صورة ${teacherName}`}
            className="w-full h-full rounded-full object-cover"
            src={profileImage}
          />
        </div>
        {isApproved && (
          <div className="absolute bottom-2 right-4 w-6 h-6 bg-green-500 dark:bg-green-600 border-4 border-white dark:border-slate-800 rounded-full flex items-center justify-center shadow-lg">
            <span className="material-symbols-outlined text-white text-xs font-bold leading-none">verified</span>
          </div>
        )}
      </div>

      {/* Name & Verification */}
      <h1 className="text-2xl font-bold mb-1 flex items-center justify-center gap-2">
        {teacherName}
        {isApproved && (
          <svg className="w-6 h-6 text-blue-500 dark:text-blue-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
          </svg>
        )}
      </h1>
      <p className="text-gray-500 dark:text-slate-400 font-medium mb-4">{teacherTitle}</p>

      {/* Badges & Ratings */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {yearsOfExperience && (
          <span className="px-3 py-1 bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary rounded-full text-sm font-semibold border border-primary/20 dark:border-primary/30">
            خبرة {yearsOfExperience} سنوات
          </span>
        )}
        {rating > 0 ? (
          <div className="flex items-center gap-1 px-3 py-1 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 rounded-full text-sm font-semibold border border-yellow-100 dark:border-yellow-800">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span>{rating.toFixed(1)} ({reviewsCount} تقييم)</span>
          </div>
        ) : isApproved && (
          <div className="flex items-center gap-1 px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-full text-sm font-semibold border border-slate-200 dark:border-slate-600">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span>لا توجد تقييمات بعد</span>
          </div>
        )}
      </div>

      {/* Language & Location */}
      <div className="w-full space-y-3 mb-8 text-sm text-gray-600 dark:text-slate-400">
        <div className="flex items-center justify-between border-b border-gray-50 dark:border-slate-700 pb-2">
          <span className="font-medium text-gray-400 dark:text-slate-500">اللغات:</span>
          <span className="font-semibold text-slate-900 dark:text-white">العربية، الإنجليزية</span>
        </div>
        {nationality && (
          <div className="flex items-center justify-between border-b border-gray-50 dark:border-slate-700 pb-2">
            <span className="font-medium text-gray-400 dark:text-slate-500">الموقع:</span>
            <span className="font-semibold text-slate-900 dark:text-white">{nationality}</span>
          </div>
        )}
        {sessionPrice > 0 && (
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-400 dark:text-slate-500">سعر الجلسة:</span>
            <span className="font-bold text-primary dark:text-primary text-lg">{sessionPrice} {currency}/ساعة</span>
          </div>
        )}
      </div>

      {/* Personal Information Section */}
      <PersonalInfoSection
        teacherApplication={teacherApplication}
        teacherProfile={teacherProfile}
        userProfile={userProfile}
        user={user}
        teacherName={teacherName}
        isApproved={isApproved}
        isPending={isPending}
        isEditing={isEditingPersonalInfo}
        onToggleEdit={onToggleEditPersonalInfo}
        onSave={onSave}
      />

      {/* Action Button */}
      {isApproved && !isPending && (
        <button
          onClick={onToggleEditPersonalInfo}
          className="w-full bg-primary hover:bg-[#e0b320] text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-primary/30 flex items-center justify-center gap-2 active:scale-95 mt-6"
        >
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
          تعديل الملف العام
        </button>
      )}
    </div>
  );
}

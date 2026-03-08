/**
 * PersonalInfoSection Component
 * Displays and allows editing of teacher's personal information
 */

import React, { useState } from 'react';
import type { TeacherApplication, TeacherProfile } from '../../../../../shared/types/teacher.types';
import { useSavePersonalInfo } from '../../hooks/useSavePersonalInfo';
import { getTeacherDisplayName } from '../../../../../shared/utils/teacher';

interface PersonalInfoSectionProps {
  application: TeacherApplication | null;
  profile: TeacherProfile | null;
  userEmail?: string | null;
  isEditing: boolean;
  isPending: boolean;
  onEditToggle: () => void;
  onSaveSuccess: () => void;
}

export function PersonalInfoSection({
  application,
  profile,
  userEmail,
  isEditing,
  isPending,
  onEditToggle,
  onSaveSuccess,
}: PersonalInfoSectionProps) {
  const { save, saving } = useSavePersonalInfo();
  const [personalInfo, setPersonalInfo] = useState({
    teachingStyle: application?.teachingStyle || '',
    sessionContent: application?.sessionContent || '',
    introVideo: application?.introVideo || '',
  });

  const teacherName = getTeacherDisplayName(profile, application);

  const handleSave = async () => {
    if (!application?.id) return;

    try {
      await save(application.id, personalInfo);
      onSaveSuccess();
    } catch (error) {
      // Error is handled by the hook
      console.error('Failed to save personal info:', error);
    }
  };

  const renderVideoPreview = (videoUrl: string) => {
    if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
      const videoId = videoUrl.includes('youtu.be')
        ? videoUrl.split('/').pop()
        : videoUrl.split('v=')[1]?.split('&')[0];
      return (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          className="w-full h-64 rounded-lg"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      );
    }
    
    if (videoUrl.includes('vimeo.com')) {
      return (
        <iframe
          src={`https://player.vimeo.com/video/${videoUrl.split('/').pop()}`}
          className="w-full h-64 rounded-lg"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      );
    }

    return (
      <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-4 text-center">
        <span className="material-symbols-outlined text-4xl text-slate-400 mb-2">videocam</span>
        <p className="text-sm text-slate-500">معاينة الفيديو غير متاحة لهذا الرابط</p>
        <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm mt-2 inline-block">
          فتح الرابط
        </a>
      </div>
    );
  };

  return (
    <div id="personal" className="bg-white dark:bg-background-dark rounded-xl p-8 border border-primary/10 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold">البيانات الشخصية</h3>
      </div>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">الاسم الكامل</label>
            <div className="w-full rounded-lg bg-slate-50 dark:bg-slate-800/50 px-4 py-3 text-slate-900 dark:text-slate-100 font-medium">
              {teacherName}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">البريد الإلكتروني</label>
            <div className="w-full rounded-lg bg-slate-50 dark:bg-slate-800/50 px-4 py-3 text-slate-900 dark:text-slate-100 font-medium">
              {profile?.email || application?.email || userEmail || 'غير متوفر'}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">رقم الهاتف</label>
            <div className="w-full rounded-lg bg-slate-50 dark:bg-slate-800/50 px-4 py-3 text-slate-900 dark:text-slate-100 font-medium">
              {application?.countryCode || '+966'} {application?.phone || 'غير متوفر'}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">الجنسية</label>
            <div className="w-full rounded-lg bg-slate-50 dark:bg-slate-800/50 px-4 py-3 text-slate-900 dark:text-slate-100 font-medium">
              {application?.nationality || 'غير متوفر'}
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">نبذة عني</label>
          <div className="w-full rounded-lg bg-slate-50 dark:bg-slate-800/50 px-4 py-3 text-slate-900 dark:text-slate-100 leading-relaxed whitespace-pre-wrap min-h-[120px]">
            {application?.bio || 'لا توجد نبذة متاحة'}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">ما الثمار التي سيجنيها الطالب؟</label>
          {isEditing && !isPending ? (
            <>
              <textarea
                rows={5}
                value={personalInfo.teachingStyle}
                onChange={(e) => setPersonalInfo({ ...personalInfo, teachingStyle: e.target.value })}
                placeholder="اكتب وصفاً للفوائد والنتائج التي سيحصل عليها الطالب من دراسته معك..."
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-slate-900 dark:text-slate-100"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                اشرح الفوائد والنتائج التي سيحصل عليها الطالب مثل: إتقان التلاوة، فهم المعاني، بناء الثقة، الحصول على الإجازة، وغيرها
              </p>
            </>
          ) : (
            <div className="w-full rounded-lg bg-slate-50 dark:bg-slate-800/50 px-4 py-3 text-slate-900 dark:text-slate-100 leading-relaxed whitespace-pre-wrap min-h-[100px]">
              {personalInfo.teachingStyle || 'لا يوجد وصف متاح'}
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">ماذا تتضمن الحصة</label>
          {isEditing && !isPending ? (
            <>
              <textarea
                rows={5}
                value={personalInfo.sessionContent}
                onChange={(e) => setPersonalInfo({ ...personalInfo, sessionContent: e.target.value })}
                placeholder="اكتب وصفاً لما تتضمنه الحصة..."
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-slate-900 dark:text-slate-100"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                اشرح محتوى الحصة والأنشطة التي ستقوم بها مع الطالب
              </p>
            </>
          ) : (
            <div className="w-full rounded-lg bg-slate-50 dark:bg-slate-800/50 px-4 py-3 text-slate-900 dark:text-slate-100 leading-relaxed whitespace-pre-wrap min-h-[100px]">
              {personalInfo.sessionContent || 'لا يوجد وصف متاح'}
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">فيديو عني</label>
          {isEditing && !isPending ? (
            <>
              <input
                type="url"
                value={personalInfo.introVideo}
                onChange={(e) => setPersonalInfo({ ...personalInfo, introVideo: e.target.value })}
                placeholder="رابط الفيديو (YouTube, Vimeo, إلخ)"
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-slate-900 dark:text-slate-100"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                أدخل رابط فيديو تعريفي عنك (YouTube, Vimeo, أو أي منصة أخرى)
              </p>
            </>
          ) : (
            <div className="w-full rounded-lg bg-slate-50 dark:bg-slate-800/50 px-4 py-3">
              {personalInfo.introVideo ? (
                <a href={personalInfo.introVideo} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
                  {personalInfo.introVideo}
                </a>
              ) : (
                <span className="text-slate-500 dark:text-slate-400">لا يوجد رابط فيديو</span>
              )}
            </div>
          )}
          {personalInfo.introVideo && (
            <div className="mt-3 rounded-lg overflow-hidden">
              {renderVideoPreview(personalInfo.introVideo)}
            </div>
          )}
        </div>
        {isEditing && !isPending && (
          <div className="flex gap-3">
            <button
              onClick={onEditToggle}
              className="px-6 py-3 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              إلغاء
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-primary text-slate-900 font-bold py-3 px-6 rounded-lg hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

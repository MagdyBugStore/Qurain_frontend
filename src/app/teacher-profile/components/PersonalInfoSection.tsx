/**
 * PersonalInfoSection Component
 * Displays and allows editing of personal information in the sidebar
 */

import React from 'react';
import type { TeacherApplication, TeacherProfile } from '../../../shared/types/teacher.types';
import { usePersonalInfo } from '../hooks/usePersonalInfo';

interface PersonalInfoSectionProps {
  teacherApplication: TeacherApplication | null;
  teacherProfile: TeacherProfile | null;
  userProfile: any;
  user: any;
  teacherName: string;
  isApproved: boolean;
  isPending: boolean;
  isEditing: boolean;
  onToggleEdit: () => void;
  onSave: (message: { type: 'success' | 'error'; text: string }) => void;
}

export function PersonalInfoSection({
  teacherApplication,
  teacherProfile,
  userProfile,
  user,
  teacherName,
  isApproved,
  isPending,
  isEditing,
  onToggleEdit,
  onSave,
}: PersonalInfoSectionProps) {
  const { personalInfo, setPersonalInfo, savePersonalInfo, saving } = usePersonalInfo(teacherApplication);

  const handleSave = async () => {
    const result = await savePersonalInfo();
    if (result.success) {
      onSave({ type: 'success', text: 'تم حفظ البيانات بنجاح' });
      onToggleEdit();
    } else {
      onSave({ type: 'error', text: 'حدث خطأ أثناء حفظ البيانات' });
    }
  };

  return (
    <div className="w-full mt-6 pt-6 border-t border-gray-100 dark:border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold">البيانات الشخصية</h3>
        {isApproved && !isPending && (
          <button
            onClick={onToggleEdit}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            title="تعديل"
          >
            <span className="material-symbols-outlined text-slate-600 dark:text-slate-400 text-sm">edit</span>
          </button>
        )}
      </div>
      {isEditing ? (
        <div className="space-y-4 text-right">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-400 dark:text-slate-500 mb-1.5">الاسم الكامل</label>
              <div className="w-full rounded-lg bg-gray-50 dark:bg-slate-800/50 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 font-medium">
                {teacherName}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 dark:text-slate-500 mb-1.5">البريد الإلكتروني</label>
              <div className="w-full rounded-lg bg-gray-50 dark:bg-slate-800/50 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 font-medium">
                {userProfile?.email || teacherApplication?.email || user?.email || 'غير متوفر'}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 dark:text-slate-500 mb-1.5">رقم الهاتف</label>
              <div className="w-full rounded-lg bg-gray-50 dark:bg-slate-800/50 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 font-medium">
                {teacherApplication?.countryCode || '+966'} {teacherApplication?.phone || 'غير متوفر'}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 dark:text-slate-500 mb-1.5">الجنسية</label>
              <div className="w-full rounded-lg bg-gray-50 dark:bg-slate-800/50 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 font-medium">
                {teacherApplication?.nationality || 'غير متوفر'}
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 dark:text-slate-500 mb-1.5">نبذة عني</label>
            <div className="w-full rounded-lg bg-gray-50 dark:bg-slate-800/50 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 leading-relaxed whitespace-pre-wrap min-h-[80px]">
              {teacherApplication?.bio || 'لا توجد نبذة متاحة'}
            </div>
          </div>
          {isEditing && !isPending && (
            <div className="flex flex-col gap-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-primary text-slate-900 font-bold py-2 px-4 rounded-lg hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
              </button>
              <button
                onClick={onToggleEdit}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm"
              >
                إلغاء
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4 text-right">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-400 dark:text-slate-500 mb-1.5">الاسم الكامل</label>
              <div className="w-full rounded-lg bg-gray-50 dark:bg-slate-800/50 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 font-medium">
                {teacherName}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 dark:text-slate-500 mb-1.5">البريد الإلكتروني</label>
              <div className="w-full rounded-lg bg-gray-50 dark:bg-slate-800/50 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 font-medium">
                {userProfile?.email || teacherApplication?.email || user?.email || 'غير متوفر'}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 dark:text-slate-500 mb-1.5">رقم الهاتف</label>
              <div className="w-full rounded-lg bg-gray-50 dark:bg-slate-800/50 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 font-medium">
                {teacherApplication?.countryCode || '+966'} {teacherApplication?.phone || 'غير متوفر'}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 dark:text-slate-500 mb-1.5">الجنسية</label>
              <div className="w-full rounded-lg bg-gray-50 dark:bg-slate-800/50 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 font-medium">
                {teacherApplication?.nationality || 'غير متوفر'}
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 dark:text-slate-500 mb-1.5">نبذة عني</label>
            <div className="w-full rounded-lg bg-gray-50 dark:bg-slate-800/50 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 leading-relaxed whitespace-pre-wrap min-h-[80px]">
              {teacherApplication?.bio || 'لا توجد نبذة متاحة'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

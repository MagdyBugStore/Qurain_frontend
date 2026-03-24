/**
 * Ijazahs section component
 */

import { EditButton } from '../shared/EditButton';
import type { Ijazah } from '../../types';
import React from 'react';

interface IjazahsSectionProps {
  ijazahs: Ijazah[];
  isEditing: boolean;
  isApproved: boolean;
  isPending: boolean;
  onToggleEdit: () => void;
  onAdd: () => void;
  onUpdate: (index: number, field: string, value: string) => void;
  onDelete: (index: number) => void;
  onSave: () => Promise<void>;
  saving: boolean;
}

export function IjazahsSection({
  ijazahs,
  isEditing,
  isApproved,
  isPending,
  onToggleEdit,
  onAdd,
  onUpdate,
  onDelete,
  onSave,
  saving,
}: IjazahsSectionProps) {
  const handleSave = async () => {
    await onSave();
    onToggleEdit();
  };

  return (
    <div className="relative bg-white dark:bg-background-dark rounded-xl p-4 sm:p-6 lg:p-8 border border-primary/10 shadow-sm">
      <div className="absolute top-4 left-4 z-20">
        <EditButton onClick={onToggleEdit} />
      </div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-6 sm:mb-8">
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="material-symbols-outlined text-primary bg-primary/10 p-1.5 sm:p-2 rounded-lg text-lg sm:text-xl">workspace_premium</span>
          <h3 className="text-lg sm:text-xl font-bold">الإجازات والسند</h3>
        </div>
        {isEditing && !isPending && (
          <button
            onClick={onAdd}
            className="text-xs sm:text-sm font-bold text-primary flex items-center gap-1 hover:underline"
          >
            <span className="material-symbols-outlined text-sm">add</span> إضافة إجازة
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {ijazahs.length > 0 ? (
          ijazahs.map((ijazah, index) => (
            <div
              key={index}
              className="group border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden hover:border-primary/40 transition-all"
            >
              <div
                className="h-40 bg-cover bg-center"
                style={{ backgroundImage: ijazah.image ? `url('${ijazah.image}')` : 'none', backgroundColor: '#f3f4f6' }}
              />
              <div className="p-4 space-y-3">
                {isEditing && !isPending ? (
                  <>
                    <input
                      type="text"
                      value={ijazah.title}
                      onChange={(e) => onUpdate(index, 'title', e.target.value)}
                      placeholder="عنوان الإجازة"
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-slate-900 dark:text-slate-100 font-bold"
                    />
                    <textarea
                      value={ijazah.description}
                      onChange={(e) => onUpdate(index, 'description', e.target.value)}
                      placeholder="وصف الإجازة"
                      rows={2}
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-slate-900 dark:text-slate-100 text-sm"
                    />
                    <input
                      type="url"
                      value={ijazah.image}
                      onChange={(e) => onUpdate(index, 'image', e.target.value)}
                      placeholder="رابط الصورة"
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-slate-900 dark:text-slate-100 text-sm"
                    />
                    <button
                      onClick={() => onDelete(index)}
                      className="text-red-500 text-sm hover:underline flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                      حذف
                    </button>
                  </>
                ) : (
                  <>
                    <h4 className="font-bold text-slate-900 dark:text-white">{ijazah.title || 'بدون عنوان'}</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{ijazah.description || 'لا يوجد وصف'}</p>
                  </>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-slate-500 text-sm">لا توجد إجازات مسجلة</p>
        )}
      </div>
      {isEditing && !isPending && ijazahs.length > 0 && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'جاري الحفظ...' : 'حفظ الإجازات'}
          </button>
        </div>
      )}
    </div>
  );
}

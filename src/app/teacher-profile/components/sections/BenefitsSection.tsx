/**
 * Benefits section component
 */

import { EditButton } from '../shared/EditButton';
import { SaveCancelButtons } from '../shared/SaveCancelButtons';
import type { Benefit } from '../../types';
import React from 'react';

interface BenefitsSectionProps {
  benefits: Benefit[];
  isEditing: boolean;
  isApproved: boolean;
  isPending: boolean;
  onToggleEdit: () => void;
  onAdd: () => void;
  onUpdate: (index: number, field: 'title' | 'subject', value: string) => void;
  onDelete: (index: number) => void;
  onSave: () => Promise<void>;
  saving: boolean;
  maxBenefits?: number;
  onError?: (error: string) => void;
}

const MAX_BENEFITS = 3;

export function BenefitsSection({
  benefits,
  isEditing,
  isApproved,
  isPending,
  onToggleEdit,
  onAdd,
  onUpdate,
  onDelete,
  onSave,
  saving,
  maxBenefits = MAX_BENEFITS,
  onError,
}: BenefitsSectionProps) {
  const handleAdd = () => {
    try {
      onAdd();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ';
      onError?.(errorMessage);
    }
  };

  const handleSave = async () => {
    try {
      await onSave();
      onToggleEdit();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ أثناء الحفظ';
      onError?.(errorMessage);
    }
  };

  return (
    <div className="relative bg-white dark:bg-slate-800 rounded-xl p-6 sm:p-8 border border-gray-100 dark:border-slate-700 shadow-sm">
      <div className="absolute top-4 left-4 z-20">
        <EditButton onClick={onToggleEdit} />
      </div>
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">ما الثمار التي سيجنيها الطالب؟</h2>
      {isEditing && !isPending ? (
        <div className="space-y-4">
          {benefits.map((benefit, index) => (
            <div key={index} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={benefit.title}
                  onChange={(e) => onUpdate(index, 'title', e.target.value)}
                  placeholder="عنوان الفائدة"
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-slate-900 dark:text-slate-100 font-bold"
                />
                <input
                  type="text"
                  value={benefit.subject}
                  onChange={(e) => onUpdate(index, 'subject', e.target.value)}
                  placeholder="وصف الفائدة"
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-slate-900 dark:text-slate-100"
                />
              </div>
              <button
                onClick={() => onDelete(index)}
                className="text-red-500 text-sm hover:underline flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">delete</span>
                حذف
              </button>
            </div>
          ))}
          {benefits.length === 0 && (
            <p className="text-slate-500 text-sm text-center py-4">لا توجد فوائد.</p>
          )}
          <div className="flex justify-center pt-4">
            <button
              onClick={handleAdd}
              disabled={benefits.length >= maxBenefits}
              className="px-6 py-3 bg-primary text-slate-900 font-bold rounded-lg hover:brightness-110 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined">add</span>
              {benefits.length >= maxBenefits ? 'تم الوصول للحد الأقصى' : 'إضافة فائدة'}
            </button>
          </div>
          <div className="pt-4">
            <SaveCancelButtons
              onSave={handleSave}
              onCancel={onToggleEdit}
              saving={saving}
              saveLabel="حفظ الفوائد"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {benefits.length > 0 ? (
              benefits.map((benefit, index) => (
                <div key={index} className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 sm:p-6 border border-slate-200 dark:border-slate-600">
                  <h3 className="font-bold text-lg mb-2 text-slate-900 dark:text-white">{benefit.title || 'فائدة'}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    {benefit.subject || 'وصف الفائدة والنتائج المتوقعة...'}
                  </p>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-8 text-slate-500">
                لا توجد فوائد متاحة
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

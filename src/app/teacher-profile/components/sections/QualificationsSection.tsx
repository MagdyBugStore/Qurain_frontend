/**
 * Qualifications section component
 */

import { EditButton } from '../shared/EditButton';
import type { Qualification } from '../../../shared/types/teacher.types';

interface QualificationsSectionProps {
  qualifications: Qualification[];
  isEditing: boolean;
  isApproved: boolean;
  isPending: boolean;
  onToggleEdit: () => void;
  onAdd: () => void;
  onUpdate: (index: number, field: keyof Qualification, value: string) => void;
  onDelete: (index: number) => void;
  onSave: () => Promise<void>;
  saving: boolean;
}

export function QualificationsSection({
  qualifications,
  isEditing,
  isApproved,
  isPending,
  onToggleEdit,
  onAdd,
  onUpdate,
  onDelete,
  onSave,
  saving,
}: QualificationsSectionProps) {
  const handleSave = async () => {
    await onSave();
    onToggleEdit();
  };

  return (
    <div id="qualifications" className="relative bg-white dark:bg-background-dark rounded-xl p-4 sm:p-6 lg:p-8 border border-primary/10 shadow-sm">
      {isApproved && !isPending && (
        <div className="absolute top-4 left-4">
          <EditButton onClick={onToggleEdit} />
        </div>
      )}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="material-symbols-outlined text-primary bg-primary/10 p-1.5 sm:p-2 rounded-lg text-lg sm:text-xl">school</span>
          <h3 className="text-lg sm:text-xl font-bold">المؤهلات العلمية</h3>
        </div>
        {isEditing && !isPending && (
          <button
            onClick={onAdd}
            className="text-xs sm:text-sm font-bold text-primary flex items-center gap-1 hover:underline"
          >
            <span className="material-symbols-outlined text-sm">add</span> إضافة مؤهل
          </button>
        )}
      </div>
      <div className="space-y-6">
        {qualifications.length > 0 ? (
          qualifications.map((qual, index) => (
            <div key={index} className="flex gap-4 items-start p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
              <div className="h-12 w-12 flex-shrink-0 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">history_edu</span>
              </div>
              <div className="flex-1 space-y-3">
                {isEditing && !isPending ? (
                  <>
                    <input
                      type="text"
                      value={qual.title}
                      onChange={(e) => onUpdate(index, 'title', e.target.value)}
                      placeholder="اسم المؤهل"
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-slate-900 dark:text-slate-100"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={qual.institution || ''}
                        onChange={(e) => onUpdate(index, 'institution', e.target.value)}
                        placeholder="المؤسسة"
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 sm:px-4 py-2 text-sm sm:text-base text-slate-900 dark:text-slate-100"
                      />
                      <input
                        type="text"
                        value={qual.year || ''}
                        onChange={(e) => onUpdate(index, 'year', e.target.value)}
                        placeholder="السنة"
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 sm:px-4 py-2 text-sm sm:text-base text-slate-900 dark:text-slate-100"
                      />
                    </div>
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
                    <h4 className="font-bold text-lg text-slate-900 dark:text-white">{qual.title}</h4>
                    {qual.institution && (
                      <p className="text-slate-600 dark:text-slate-400 text-sm">{qual.institution} {qual.year && `- ${qual.year}`}</p>
                    )}
                  </>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-slate-500 text-sm">لا توجد مؤهلات مسجلة</p>
        )}
      </div>
      {isEditing && !isPending && qualifications.length > 0 && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'جاري الحفظ...' : 'حفظ المؤهلات'}
          </button>
        </div>
      )}
    </div>
  );
}

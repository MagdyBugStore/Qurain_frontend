/**
 * Session content section component
 */

import { EditButton } from '../shared/EditButton';
import { SaveCancelButtons } from '../shared/SaveCancelButtons';
import type { SessionContentItem } from '../../types';

interface SessionContentSectionProps {
  items: SessionContentItem[];
  isEditing: boolean;
  isApproved: boolean;
  isPending: boolean;
  onToggleEdit: () => void;
  onAdd: () => void;
  onUpdate: (index: number, field: 'title' | 'subject', value: string) => void;
  onDelete: (index: number) => void;
  onSave: () => Promise<void>;
  saving: boolean;
  onError?: (error: string) => void;
}

export function SessionContentSection({
  items,
  isEditing,
  isApproved,
  isPending,
  onToggleEdit,
  onAdd,
  onUpdate,
  onDelete,
  onSave,
  saving,
  onError,
}: SessionContentSectionProps) {
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
      {isApproved && !isPending && (
        <div className="absolute top-4 left-4">
          <EditButton onClick={onToggleEdit} />
        </div>
      )}
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">ماذا تتضمن الحصة؟</h2>
      {isEditing && !isPending ? (
        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={index} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={item.title}
                  onChange={(e) => onUpdate(index, 'title', e.target.value)}
                  placeholder="عنوان العنصر"
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-slate-900 dark:text-slate-100 font-bold"
                />
                <input
                  type="text"
                  value={item.subject}
                  onChange={(e) => onUpdate(index, 'subject', e.target.value)}
                  placeholder="وصف العنصر"
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
          {items.length === 0 && (
            <p className="text-slate-500 text-sm text-center py-4">لا توجد عناصر.</p>
          )}
          <div className="flex justify-center pt-4">
            <button
              onClick={handleAdd}
              className="px-6 py-3 bg-primary text-slate-900 font-bold rounded-lg hover:brightness-110 transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined">add</span>
              إضافة عنصر
            </button>
          </div>
          <div className="pt-4">
            <SaveCancelButtons
              onSave={handleSave}
              onCancel={onToggleEdit}
              saving={saving}
              saveLabel="حفظ محتوى الحصة"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {items.length > 0 ? (
              items.map((item, index) => (
                <div key={index} className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 sm:p-6 border border-slate-200 dark:border-slate-600">
                  <h3 className="font-bold text-lg mb-2 text-slate-900 dark:text-white">{item.title || 'عنصر'}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    {item.subject || 'وصف محتوى الحصة والأنشطة...'}
                  </p>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-8 text-slate-500">
                لا توجد عناصر متاحة
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

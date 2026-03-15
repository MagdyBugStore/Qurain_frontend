/**
 * Reusable save/cancel button group
 */

interface SaveCancelButtonsProps {
  onSave: () => void;
  onCancel: () => void;
  saving?: boolean;
  saveLabel?: string;
  cancelLabel?: string;
}

export function SaveCancelButtons({
  onSave,
  onCancel,
  saving = false,
  saveLabel = 'حفظ التغييرات',
  cancelLabel = 'إلغاء',
}: SaveCancelButtonsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 justify-end">
      <button
        onClick={onCancel}
        disabled={saving}
        className="px-6 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
      >
        {cancelLabel}
      </button>
      <button
        onClick={onSave}
        disabled={saving}
        className="px-6 py-2.5 bg-primary text-slate-900 font-bold rounded-lg hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {saving ? 'جاري الحفظ...' : saveLabel}
      </button>
    </div>
  );
}

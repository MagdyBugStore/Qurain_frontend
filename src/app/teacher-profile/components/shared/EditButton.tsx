/**
 * Reusable edit button component
 */

interface EditButtonProps {
  onClick: () => void;
  disabled?: boolean;
  title?: string;
}

export function EditButton({ onClick, disabled = false, title = 'تعديل' }: EditButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      title={title}
    >
      <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">edit</span>
    </button>
  );
}

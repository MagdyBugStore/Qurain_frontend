/**
 * Reusable edit button component
 */

import React from "react";

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
      className="p-2 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed z-10"
      title={title}
    >
      <span className="material-symbols-outlined text-slate-700 dark:text-slate-300 text-lg">edit</span>
    </button>
  );
}

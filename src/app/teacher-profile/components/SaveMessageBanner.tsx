/**
 * Save message banner component
 */

import type { SaveMessage } from '../types';

interface SaveMessageBannerProps {
  message: SaveMessage | null;
}

export function SaveMessageBanner({ message }: SaveMessageBannerProps) {
  if (!message) return null;

  return (
    <div
      className={`mb-4 sm:mb-6 rounded-xl p-3 sm:p-4 flex items-center gap-2 sm:gap-3 ${
        message.type === 'success'
          ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
          : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
      }`}
    >
      <span
        className={`material-symbols-outlined text-lg sm:text-xl ${
          message.type === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
        }`}
      >
        {message.type === 'success' ? 'check_circle' : 'error'}
      </span>
      <p
        className={`font-bold text-sm sm:text-base ${
          message.type === 'success'
            ? 'text-green-900 dark:text-green-200'
            : 'text-red-900 dark:text-red-200'
        }`}
      >
        {message.text}
      </p>
    </div>
  );
}

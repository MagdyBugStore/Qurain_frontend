/**
 * Pending status banner component
 */

interface PendingBannerProps {
  message?: string;
}

export function PendingBanner({
  message = 'سيتم مراجعة طلبك خلال 48 ساعة. سيتم إشعارك عند الموافقة على طلبك.',
}: PendingBannerProps) {
  return (
    <div className="mb-4 sm:mb-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
      <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 shrink-0">schedule</span>
      <div className="flex-1">
        <p className="font-bold text-sm sm:text-base text-amber-900 dark:text-amber-200">طلبك قيد المراجعة</p>
        <p className="text-xs sm:text-sm text-amber-700 dark:text-amber-300">{message}</p>
      </div>
    </div>
  );
}

/**
 * Date utility functions
 */

/**
 * Format date to Arabic format
 */
export function formatArabicDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  const arabicDays = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const arabicMonths = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];

  const dayName = arabicDays[d.getDay()];
  const day = d.getDate();
  const month = arabicMonths[d.getMonth()];
  const year = d.getFullYear();

  return `${dayName}، ${day} ${month} ${year}`;
}

/**
 * Format time to Arabic format
 */
export function formatArabicTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  const hours = d.getHours();
  const minutes = d.getMinutes();
  const period = hours >= 12 ? 'مساءً' : 'صباحاً';
  const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
  
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

/**
 * Get relative time in Arabic (e.g., "منذ ساعتين")
 */
export function getRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'الآن';
  if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
  if (diffHours < 24) return `منذ ${diffHours} ساعة`;
  if (diffDays === 1) return 'أمس';
  if (diffDays < 7) return `قبل ${diffDays} أيام`;
  if (diffDays < 30) return `قبل ${Math.floor(diffDays / 7)} أسابيع`;
  if (diffDays < 365) return `قبل ${Math.floor(diffDays / 30)} أشهر`;
  return `قبل ${Math.floor(diffDays / 365)} سنوات`;
}

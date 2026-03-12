/**
 * Calendar utility functions
 */

export interface CalendarDay {
  date: Date;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isToday: boolean;
}

/**
 * Get calendar days for a specific month
 */
export function getCalendarDays(year: number, month: number): CalendarDay[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday, 6 = Saturday

  const days: CalendarDay[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Add days from previous month
  const prevMonth = new Date(year, month - 1, 0);
  const daysInPrevMonth = prevMonth.getDate();
  
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(year, month - 1, daysInPrevMonth - i);
    days.push({
      date,
      dayOfMonth: date.getDate(),
      isCurrentMonth: false,
      isToday: false,
    });
  }

  // Add days from current month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const isToday = date.getTime() === today.getTime();
    days.push({
      date,
      dayOfMonth: day,
      isCurrentMonth: true,
      isToday,
    });
  }

  // Add days from next month to complete the grid (6 weeks = 42 days)
  const remainingDays = 42 - days.length;
  for (let day = 1; day <= remainingDays; day++) {
    const date = new Date(year, month + 1, day);
    days.push({
      date,
      dayOfMonth: day,
      isCurrentMonth: false,
      isToday: false,
    });
  }

  return days;
}

/**
 * Get Arabic month name
 */
export function getArabicMonthName(month: number): string {
  const months = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];
  return months[month];
}

/**
 * Check if two dates are the same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

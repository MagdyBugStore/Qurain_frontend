/**
 * Availability section component
 */

import React from 'react';
import { TIME_SLOTS, DAYS } from '../../constants/schedule';

interface AvailabilitySectionProps {
  availability: (string | null)[][];
  isApproved: boolean;
  isPending: boolean;
  onToggleSlot: (dayIndex: number, timeIndex: number) => void;
  onSetAvailability?: (availability: (string | null)[][]) => void;
  onSave: () => Promise<void>;
  saving: boolean;
  hasChanges: boolean;
  bookedUsersMap?: Record<string, { name: string; avatar?: string }>; // key: `${dayIndex}_${timeString}`
  onMonthChange?: (monthIndex: number) => void; // optional: notify parent to (re)load month data
  bookedSlotsSet?: Set<string>; // optional: fallback when names are not available
  onJoinSession?: (args: {
    slotKey: string;
    dayIndex: number;
    timeIndex: number;
    nextAt: Date | null;
    counterpartName?: string;
    counterpartAvatar?: string;
  }) => void;
}

export function AvailabilitySection({
  availability,
  isApproved,
  isPending,
  onToggleSlot,
  onSetAvailability,
  onSave,
  saving,
  hasChanges,
  bookedUsersMap,
  onMonthChange,
  bookedSlotsSet,
  onJoinSession,
}: AvailabilitySectionProps) {
  const MONTHS = React.useMemo(
    () => [
      'يناير',
      'فبراير',
      'مارس',
      'أبريل',
      'مايو',
      'يونيو',
      'يوليو',
      'أغسطس',
      'سبتمبر',
      'أكتوبر',
      'نوفمبر',
      'ديسمبر',
    ],
    []
  );
  const currentMonthIndex = React.useMemo(() => new Date().getMonth(), []);
  const [selectedMonthIndex, setSelectedMonthIndex] = React.useState<number>(currentMonthIndex);
  const VISIBLE_MONTHS = React.useMemo(
    () => MONTHS.map((m, i) => ({ label: m, idx: i })).filter((m) => m.idx >= currentMonthIndex),
    [MONTHS, currentMonthIndex]
  );

  const updateMonth = (nextIdx: number) => {
    setSelectedMonthIndex(nextIdx);
    onMonthChange?.(nextIdx);
  };
  // Helpers to compute next occurrence within selected month and render remaining time
  const availabilityIndexToJsDay = (idx: number): number => {
    const map: Record<number, number> = { 0: 6, 1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5 };
    return map[idx] ?? 0;
  };
  const parseArabicTimeToHM = (label: string): { h: number; m: number } => {
    try {
      const easternToWestern = (s: string) =>
        s
          .replace(/٠/g, '0')
          .replace(/١/g, '1')
          .replace(/٢/g, '2')
          .replace(/٣/g, '3')
          .replace(/٤/g, '4')
          .replace(/٥/g, '5')
          .replace(/٦/g, '6')
          .replace(/٧/g, '7')
          .replace(/٨/g, '8')
          .replace(/٩/g, '9');
      const plain = easternToWestern(String(label || '')).trim();
      const isPM = /م\b|PM\b|pm\b/.test(plain);
      const isAM = /ص\b|AM\b|am\b/.test(plain);
      const m = plain.match(/(\d{1,2})\s*[:٫.]\s*(\d{2})/);
      if (!m) return { h: 8, m: 0 };
      let h = parseInt(m[1], 10);
      const min = parseInt(m[2], 10);
      if (isPM && h < 12) h += 12;
      if (isAM && h === 12) h = 0;
      return { h, m: min };
    } catch {
      return { h: 8, m: 0 };
    }
  };
  const getMonthWindow = (monthIdx: number) => {
    const y = new Date().getFullYear();
    const start = new Date(y, monthIdx, 1, 0, 0, 0, 0);
    const end = new Date(y, monthIdx + 1, 0, 23, 59, 59, 999);
    return { start, end };
  };
  const computeNextOccurrenceInMonth = (monthIdx: number, availDayIndex: number, timeLabel: string): Date | null => {
    const jsDay = availabilityIndexToJsDay(availDayIndex);
    const { h, m } = parseArabicTimeToHM(timeLabel);
    const { start, end } = getMonthWindow(monthIdx);
    const now = new Date();
    const base = new Date(Math.max(start.getTime(), new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0).getTime()));
    let candidate = new Date(base);
    candidate.setHours(h, m, 0, 0);
    const delta = (jsDay - candidate.getDay() + 7) % 7;
    if (delta > 0) {
      candidate.setDate(candidate.getDate() + delta);
    } else if (delta === 0 && candidate < now) {
      candidate.setDate(candidate.getDate() + 7);
    }
    while (candidate <= end) {
      if (candidate >= now) return candidate;
      candidate = new Date(candidate);
      candidate.setDate(candidate.getDate() + 7);
    }
    return null;
  };
  const formatRemaining = (msDiff: number): string => {
    const totalMin = Math.max(0, Math.round(msDiff / 60000));
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    if (h <= 0) return `${m} دقيقة`;
    return `${h} س ${m} د`;
  };

  // Live countdown (يوم : ساعة : دقيقة : ثانية)
  const Countdown: React.FC<{ target: Date | null }> = ({ target }) => {
    const [now, setNow] = React.useState<Date>(() => new Date());
    React.useEffect(() => {
      const id = setInterval(() => setNow(new Date()), 1000);
      return () => clearInterval(id);
    }, []);
    if (!target) return <span className="text-[10px] sm:text-[11px] text-slate-500">-- : -- : -- : --</span>;
    let diff = target.getTime() - now.getTime();
    if (diff < 0) diff = 0;
    const sec = Math.floor(diff / 1000);
    const days = Math.floor(sec / 86400);
    const hours = Math.floor((sec % 86400) / 3600);
    const minutes = Math.floor((sec % 3600) / 60);
    const seconds = sec % 60;
    const pad = (n: number) => String(n).padStart(2, '0');
    return (
      <span className="font-bold text-[10px] sm:text-[11px] text-slate-700 dark:text-slate-300 tabular-nums">
        {pad(days)} : {pad(hours)} : {pad(minutes)} : {pad(seconds)}
      </span>
    );
  };
  // Log availability data for debugging
  React.useEffect(() => {
    // Count slots by type
    let availableCount = 0;
    let bookedCount = 0;
    let nullCount = 0;
    
    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
      for (let timeIndex = 0; timeIndex < 12; timeIndex++) {
        const slot = availability[dayIndex]?.[timeIndex];
        if (slot === 'available') availableCount++;
        else if (slot === 'booked') bookedCount++;
        else nullCount++;
      }
    }
    
  }, [availability]);

  const handleSave = async () => {
    try {
      await onSave();
    } catch (error) {
      console.error('Error in handleSave:', error);
    }
  };

  // Table is always editable (unless pending)
  const canEdit = !isPending;

  const computedAllAvailable = React.useMemo(() => {
    // True if every non-booked slot is 'available'
    for (let dayIndex = 0; dayIndex < DAYS.length; dayIndex++) {
      for (let timeIndex = 0; timeIndex < TIME_SLOTS.length; timeIndex++) {
        const status = availability[dayIndex]?.[timeIndex];
        if (status !== 'booked' && status !== 'available') {
          return false;
        }
      }
    }
    return true;
  }, [availability]);

  const handleToggleAll = (checked: boolean) => {
    if (!canEdit) return;
    if (onSetAvailability) {
      const nextMatrix: (string | null)[][] = availability.map((day) =>
        day.map((slot) => {
          if (slot === 'booked') return 'booked';
          return checked ? 'available' : null;
        })
      );
      onSetAvailability(nextMatrix);
      return;
    }
    // Fallback: toggle slot-by-slot (less efficient)
    for (let dayIndex = 0; dayIndex < DAYS.length; dayIndex++) {
      for (let timeIndex = 0; timeIndex < TIME_SLOTS.length; timeIndex++) {
        const status = availability[dayIndex]?.[timeIndex];
        if (status === 'booked') continue;
        if (checked && status !== 'available') {
          onToggleSlot(dayIndex, timeIndex);
        } else if (!checked && status === 'available') {
          onToggleSlot(dayIndex, timeIndex);
        }
      }
    }
  };

  return (
    <div id="availability" className="relative bg-white dark:bg-background-dark rounded-xl p-4 sm:p-6 lg:p-8 border border-primary/10 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-6 sm:mb-8">
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="material-symbols-outlined text-primary bg-primary/10 p-1.5 sm:p-2 rounded-lg text-lg sm:text-xl">event_available</span>
          <h3 className="text-lg sm:text-xl font-bold">جدول التوفر الأسبوعي</h3>
        </div>
        <div className="flex items-center gap-3" />
      </div>
      {/* Month filter - own row, nothing else with it */}
      <div className="mb-4">
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 px-2 py-1 w-full">
            <button
              type="button"
              aria-label="الشهر السابق"
              onClick={() => {
                const prev = selectedMonthIndex - 1;
                if (prev >= currentMonthIndex) updateMonth(prev);
              }}
              disabled={selectedMonthIndex <= currentMonthIndex}
              className={`p-1 rounded-full transition-colors ${
                selectedMonthIndex <= currentMonthIndex
                  ? 'opacity-40 cursor-not-allowed'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <span className="material-symbols-outlined text-slate-600 dark:text-slate-300 text-2xl">chevron_right</span>
            </button>
            <div className="flex items-center gap-1 overflow-x-auto px-1 flex-1">
              {VISIBLE_MONTHS.map(({ label: m, idx }) => {
                const active = idx === selectedMonthIndex;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => updateMonth(idx)}
                    className={`px-3 py-1 rounded-full text-sm md:text-base font-bold whitespace-nowrap transition-colors ${
                      active
                        ? 'bg-primary text-white'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {m}
                  </button>
                )
              })}
            </div>
            <button
              type="button"
              aria-label="الشهر التالي"
              onClick={() => {
                const next = selectedMonthIndex + 1;
                if (next < 12) updateMonth(next);
              }}
              disabled={selectedMonthIndex >= 11}
              className={`p-1 rounded-full transition-colors ${
                selectedMonthIndex >= 11
                  ? 'opacity-40 cursor-not-allowed'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <span className="material-symbols-outlined text-slate-600 dark:text-slate-300 text-2xl">chevron_left</span>
            </button>
          </div>
        </div>
      </div>
      <div className="mb-4 flex flex-wrap items-center gap-3 sm:gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-primary/20 rounded border border-primary/30"></div>
          <span className="text-slate-700 dark:text-slate-300 font-bold">متاح</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-slate-900/10 dark:bg-slate-900/30 rounded border border-slate-900/20"></div>
          <span className="text-slate-700 dark:text-slate-300 font-bold">محجوز</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-transparent rounded border border-slate-200 dark:border-slate-700"></div>
          <span className="text-slate-700 dark:text-slate-300 font-bold">غير متاح</span>
        </div>
      </div>
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <div className="min-w-[600px] sm:min-w-[800px] grid grid-cols-8 border-t border-slate-100 dark:border-slate-800">
          {/* Header Row */}
          <div className="p-2 sm:p-3 border-l border-b border-slate-100 dark:border-slate-800 text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50">الوقت</div>
          {DAYS.map((day) => (
            <div
              key={day}
              className="p-2 sm:p-3 border-l border-b border-slate-100 dark:border-slate-800 text-xs sm:text-sm font-bold text-center bg-slate-50 dark:bg-slate-800/50"
            >
              {day}
            </div>
          ))}
          {/* Time Rows */}
          {TIME_SLOTS.map((time, timeIndex) => (
            <React.Fragment key={timeIndex}>
              <div className="p-1.5 sm:p-2 border-l border-b border-slate-100 dark:border-slate-800 text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-bold">
                {time}
              </div>
              {DAYS.map((day, dayIndex) => {
                const status = availability[dayIndex]?.[timeIndex];
                const slotKey = `${dayIndex}_${TIME_SLOTS[timeIndex]}`;
                const isBookedFromStatus = status === 'booked';
                const bookedUser = bookedUsersMap?.[slotKey];
                const isBookedBySet = bookedSlotsSet?.has?.(slotKey) || false;
                const isBooked = isBookedFromStatus || !!bookedUser || isBookedBySet;
                const slotCanEdit = canEdit && !isBooked;
                return (
                  <div key={`${dayIndex}-${timeIndex}`} className="p-1 border-l border-b border-slate-100 dark:border-slate-800">
                    {isBooked && (
                      <div className="h-full w-full bg-slate-100 dark:bg-slate-900/30 rounded-xl border border-slate-300 dark:border-slate-700 min-h-[64px] flex flex-col items-center justify-center gap-1 px-2 py-1">
                        <div className="inline-flex items-center gap-2 max-w-full">
                          {bookedUser?.avatar ? (
                            <img
                              src={bookedUser.avatar}
                              alt={bookedUser.name}
                              className="w-6 h-6 rounded-full object-cover shrink-0"
                            />
                          ) : (
                            <span className="w-6 h-6 rounded-full bg-slate-300 text-slate-700 text-[11px] flex items-center justify-center font-bold shrink-0">
                              {bookedUser?.name?.slice(0, 1) || '؟'}
                            </span>
                          )}
                          <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 truncate">
                            {bookedUser?.name || 'محجوز'}
                          </span>
                        </div>
                        {(() => {
                          const nextAt = computeNextOccurrenceInMonth(selectedMonthIndex, dayIndex, TIME_SLOTS[timeIndex]);
                          if (!nextAt) return <span className="text-[10px] text-slate-500">-- : -- : -- : --</span>;
                          const now = new Date();
                          const diffMs = nextAt.getTime() - now.getTime();
                          const soon = diffMs <= 15 * 60 * 1000;
                          const near = diffMs <= 60 * 60 * 1000;
                          const btnColor = soon ? 'bg-red-600 hover:bg-red-700 text-white'
                            : near ? 'bg-amber-500 hover:bg-amber-600 text-white'
                            : 'bg-slate-300 hover:bg-slate-400 text-slate-800';
                          return (
                            <>
                              <Countdown target={nextAt} />
                              <button
                                type="button"
                                onClick={() =>
                                  onJoinSession?.({
                                    slotKey,
                                    dayIndex,
                                    timeIndex,
                                    nextAt,
                                    counterpartName: bookedUser?.name,
                                    counterpartAvatar: bookedUser?.avatar,
                                  })
                                }
                                className={`px-2 py-1 rounded-lg text-[10px] sm:text-xs font-bold transition-colors ${btnColor}`}
                                title="دخول الحصة"
                              >
                                دخول الحصة
                              </button>
                            </>
                          );
                        })()}
                      </div>
                    )}
                    {!isBooked && status === 'available' && (
                      <button
                        onClick={() => {
                          if (slotCanEdit) {
                            onToggleSlot(dayIndex, timeIndex);
                          }
                        }}
                        className={`h-full w-full bg-primary/20 rounded-lg border border-primary/30 min-h-[64px] flex items-center justify-center transition-colors ${
                          slotCanEdit ? 'cursor-pointer hover:bg-primary/30' : 'cursor-default'
                        }`}
                      >
                        <span className="text-xs sm:text-sm font-bold text-primary">متاح</span>
                      </button>
                    )}
                    {!isBooked && !status && (
                      <button
                        onClick={() => {
                          if (slotCanEdit) {
                            onToggleSlot(dayIndex, timeIndex);
                          }
                        }}
                        className={`h-full w-full min-h-[64px] rounded-lg ${
                          slotCanEdit ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50' : ''
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
      {hasChanges && !isPending && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </button>
        </div>
      )}
      {isPending && (
        <div className="mt-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <p className="text-sm text-amber-700 dark:text-amber-300">
            لا يمكنك تعديل جدول التوفر أثناء انتظار الموافقة على طلبك.
          </p>
        </div>
      )}
    </div>
  );
}

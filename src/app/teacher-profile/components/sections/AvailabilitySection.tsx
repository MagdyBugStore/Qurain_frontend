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
  onSave: () => Promise<void>;
  saving: boolean;
  hasChanges: boolean;
}

export function AvailabilitySection({
  availability,
  isApproved,
  isPending,
  onToggleSlot,
  onSave,
  saving,
  hasChanges,
}: AvailabilitySectionProps) {
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

  return (
    <div id="availability" className="relative bg-white dark:bg-background-dark rounded-xl p-4 sm:p-6 lg:p-8 border border-primary/10 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-6 sm:mb-8">
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="material-symbols-outlined text-primary bg-primary/10 p-1.5 sm:p-2 rounded-lg text-lg sm:text-xl">event_available</span>
          <h3 className="text-lg sm:text-xl font-bold">جدول التوفر الأسبوعي</h3>
        </div>
        <div className="flex gap-2">
          <button className="px-2 sm:px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded text-[10px] sm:text-xs font-bold whitespace-nowrap">الأسبوع الحالي</button>
        </div>
      </div>
      <div className="mb-4 flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-primary/20 rounded border border-primary/30"></div>
          <span className="text-slate-600 dark:text-slate-400">متاح</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-slate-900/10 dark:bg-slate-900/30 rounded border border-slate-900/20"></div>
          <span className="text-slate-600 dark:text-slate-400">محجوز</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-transparent rounded border border-slate-200 dark:border-slate-700"></div>
          <span className="text-slate-600 dark:text-slate-400">غير متاح</span>
        </div>
      </div>
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <div className="min-w-[600px] sm:min-w-[800px] grid grid-cols-8 border-t border-slate-100 dark:border-slate-800">
          {/* Header Row */}
          <div className="p-2 sm:p-3 border-l border-b border-slate-100 dark:border-slate-800 text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50">الوقت</div>
          {DAYS.map((day) => (
            <div
              key={day}
              className="p-2 sm:p-3 border-l border-b border-slate-100 dark:border-slate-800 text-[10px] sm:text-xs font-bold text-center bg-slate-50 dark:bg-slate-800/50"
            >
              {day}
            </div>
          ))}
          {/* Time Rows */}
          {TIME_SLOTS.map((time, timeIndex) => (
            <React.Fragment key={timeIndex}>
              <div className="p-1.5 sm:p-2 border-l border-b border-slate-100 dark:border-slate-800 text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">
                {time}
              </div>
              {DAYS.map((day, dayIndex) => {
                const status = availability[dayIndex]?.[timeIndex];
                const isBooked = status === 'booked';
                const slotCanEdit = canEdit && !isBooked;
                return (
                  <div key={`${dayIndex}-${timeIndex}`} className="p-1 border-l border-b border-slate-100 dark:border-slate-800">
                    {status === 'available' && (
                      <div
                        onClick={() => {
                          if (slotCanEdit) {
                            onToggleSlot(dayIndex, timeIndex);
                          }
                        }}
                        className={`h-full w-full bg-primary/20 rounded border border-primary/30 min-h-[35px] flex items-center justify-center transition-colors ${
                          slotCanEdit ? 'cursor-pointer hover:bg-primary/30' : 'cursor-default'
                        }`}
                      >
                        <span className="text-[10px] font-bold text-primary">متاح</span>
                      </div>
                    )}
                    {isBooked && (
                      <div className="h-full w-full bg-slate-900/10 dark:bg-slate-900/30 rounded border border-slate-900/20 min-h-[35px] flex items-center justify-center cursor-not-allowed opacity-60 pointer-events-none select-none">
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">محجوز</span>
                      </div>
                    )}
                    {!status && (
                      <div
                        onClick={() => {
                          if (slotCanEdit) {
                            onToggleSlot(dayIndex, timeIndex);
                          }
                        }}
                        className={`h-full w-full min-h-[35px] ${
                          slotCanEdit ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded' : ''
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

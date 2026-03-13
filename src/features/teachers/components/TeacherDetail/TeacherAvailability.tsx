/**
 * Teacher Availability Component
 * Displays teacher's weekly availability schedule
 */

import React from 'react';

interface TeacherAvailabilityProps {
  availability: (string | null)[][];
}

const timeSlots = [
  '٠٨:٠٠ ص', '٠٩:٠٠ ص', '١٠:٠٠ ص', '١١:٠٠ ص',
  '١٢:٠٠ م', '٠١:٠٠ م', '٠٢:٠٠ م', '٠٣:٠٠ م',
  '٠٤:٠٠ م', '٠٥:٠٠ م', '٠٦:٠٠ م', '٠٧:٠٠ م',
];

const days = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];

export function TeacherAvailability({ availability }: TeacherAvailabilityProps) {
  // Count available slots
  const availableCount = availability.flat().filter(slot => slot === 'available').length;
  const bookedCount = availability.flat().filter(slot => slot === 'booked').length;
  const totalSlots = availability.flat().length;

  return (
    <div className="bg-bg-card rounded-xl p-6 sm:p-8 border border-gray-200">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">event_available</span>
          <h2 className="text-xl font-bold text-text-dark border-r-4 border-primary pr-3">جدول التوفر الأسبوعي</h2>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1 bg-gray-100 rounded text-xs font-bold text-text-dark">الأسبوع الحالي</button>
          <button className="px-3 py-1 text-xs font-bold text-text-light hover:text-primary transition-colors">التالي</button>
        </div>
      </div>
      {/* Availability Summary */}
      {availableCount > 0 && (
        <div className="mb-6 p-4 bg-primary/5 rounded-lg border border-primary/10">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg">schedule</span>
              <span className="text-text-dark font-bold">{availableCount} وقت متاح</span>
            </div>
            {bookedCount > 0 && (
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-gray-500 text-lg">event_busy</span>
                <span className="text-text-light">{bookedCount} وقت محجوز</span>
              </div>
            )}
          </div>
        </div>
      )}
      <div className="mb-4 flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-primary/20 rounded border border-primary/30"></div>
          <span className="text-text-light">متاح</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-200 rounded border border-gray-300"></div>
          <span className="text-text-light">محجوز</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-transparent rounded border border-gray-300"></div>
          <span className="text-text-light">غير متاح</span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-[800px] grid grid-cols-8 border-t border-gray-200">
          <div className="p-3 border-l border-b border-gray-200 text-xs font-bold text-text-light bg-gray-50">الوقت</div>
          {days.map((day) => (
            <div key={day} className="p-3 border-l border-b border-gray-200 text-xs font-bold text-center bg-gray-50 text-text-dark">
              {day}
            </div>
          ))}
          {timeSlots.map((time, timeIndex) => (
            <React.Fragment key={timeIndex}>
              <div className="p-2 border-l border-b border-gray-200 text-xs text-text-light font-medium">
                {time}
              </div>
              {days.map((day, dayIndex) => {
                const status = availability[dayIndex]?.[timeIndex];
                return (
                  <div key={`${dayIndex}-${timeIndex}`} className="p-1 border-l border-b border-gray-200">
                    {status === 'available' && (
                      <div className="h-full w-full bg-primary/20 rounded border border-primary/30 min-h-[35px] flex items-center justify-center">
                        <span className="text-[10px] font-bold text-primary">متاح</span>
                      </div>
                    )}
                    {status === 'booked' && (
                      <div className="h-full w-full bg-gray-200 rounded border border-gray-300 min-h-[35px] flex items-center justify-center">
                        <span className="text-[10px] font-bold text-text-light">محجوز</span>
                      </div>
                    )}
                    {!status && <div className="h-full w-full min-h-[35px]"></div>}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

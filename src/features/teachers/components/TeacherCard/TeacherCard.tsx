/**
 * Teacher Card Component
 * Displays teacher information in a card format
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';
import { useAppStore } from '../../../../store/useAppStore';
import { getCurrencySymbol } from '../../../../shared/utils/currency';
// Firestore removed
import { TeacherService } from '../../../../services/teacherService';

interface Teacher {
  id: string;
  name: string;
  specialty: string;
  description: string;
  rating: number;
  reviews: number;
  price: number;
  currency?: string;
  image: string;
  tags: string[];
  hours: number;
  students: number;
  qualification: string;
  languages: string;
  completedSessions: number;
  gender?: string;
}

interface TeacherCardProps {
  teacher: Teacher;
}

export function TeacherCard({ teacher }: TeacherCardProps) {
  const { user: currentUser, userProfile } = useAuth();
  const openLoginModal = useAppStore((state) => state.openLoginModal);
  const isTeacher = userProfile?.accountType === 'teacher';
  const [hasAvailableSlots, setHasAvailableSlots] = useState<boolean | null>(null);
  const [loadingAvailability, setLoadingAvailability] = useState(true);

  // Time slots mapping (12 slots per day) matching teacher availability schedule
  const timeSlots = [
    '٠٨:٠٠ ص', '٠٩:٠٠ ص', '١٠:٠٠ ص', '١١:٠٠ ص',
    '١٢:٠٠ م', '٠١:٠٠ م', '٠٢:٠٠ م', '٠٣:٠٠ م',
    '٠٤:٠٠ م', '٠٥:٠٠ م', '٠٦:٠٠ م', '٠٧:٠٠ م',
  ];

  // Fetch availability and calculate available slots
  useEffect(() => {
    const checkAvailability = async () => {
      try {
        setLoadingAvailability(true);
        const teacherService = new TeacherService();
        
        // Fetch availability from Firestore
        let availability: (string | null)[][] = Array(7).fill(null).map(() => Array(12).fill(null));
        try {
          const availabilityData = await teacherService.getTeacherDetailById(teacher.id);
          if (availabilityData?.availability) {
            availability = availabilityData.availability;
          }
        } catch (error) {
          console.error('Error fetching availability:', error);
          setHasAvailableSlots(false);
          setLoadingAvailability(false);
          return;
        }

        // Fetch booked slots from subscriptions
        // NOTE: Firestore removed - using empty set
        const bookedSlotsSet = new Set<string>();

        // Calculate total available slots
        let availableCount = 0;
        for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
          const daySchedule = availability[dayIndex] || [];
          for (let timeIndex = 0; timeIndex < 12; timeIndex++) {
            const slotStatus = daySchedule[timeIndex];
            if (slotStatus === 'available') {
              const slotTime = timeSlots[timeIndex];
              const key = `${dayIndex}_${slotTime}`;
              if (!bookedSlotsSet.has(key)) {
                availableCount++;
              }
            }
          }
        }

        setHasAvailableSlots(availableCount > 0);
      } catch (error) {
        console.error('Error checking availability:', error);
        setHasAvailableSlots(false);
      } finally {
        setLoadingAvailability(false);
      }
    };

    checkAvailability();
  }, [teacher.id]);

  const handleBookClick = (e: React.MouseEvent) => {
    // If user is not logged in, prevent navigation and open login popup
    if (!currentUser) {
      e.preventDefault();
      e.stopPropagation();
      openLoginModal();
    }
    // If user is logged in, let the Link navigation happen (no popup)
  };

  return (
    <Link
      to={`/teachers/${teacher.id}`}
      className="bg-white dark:bg-[#1a170d] rounded-xl border border-[#e6e2de] dark:border-[#3a3528] overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full cursor-pointer max-w-sm w-full"
    >
      <div className="p-5 flex flex-col h-full">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-14 h-14 rounded-full bg-gray-200 overflow-hidden flex-shrink-0"
              style={{
                backgroundImage: `url(${teacher.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
            <div>
              <h3 className="font-bold text-[#181611] dark:text-white font-arabic text-lg leading-tight">
                {teacher.name}
              </h3>
              <div className="flex items-center gap-1 mt-1">
                <span className="material-symbols-outlined text-primary text-sm filled">star</span>
                <span className="text-sm font-bold text-[#181611] dark:text-white">
                  {teacher.rating}
                </span>
                <span className="text-xs text-[#8a8060]">({teacher.reviews})</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-lg font-bold text-primary font-arabic">
              {teacher.price} {getCurrencySymbol(teacher.currency as any)}
            </span>
            <span className="text-[10px] text-[#8a8060] font-arabic">/ساعة</span>
          </div>
        </div>
        <div className="space-y-2 mb-4 flex-grow">
          <div className="flex items-center gap-2 text-sm text-[#4d4738] dark:text-[#a09a8a] font-arabic">
            <span className="material-symbols-outlined text-base">school</span>
            <span>{teacher.qualification}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-[#4d4738] dark:text-[#a09a8a] font-arabic">
            <span className="material-symbols-outlined text-base">translate</span>
            <span>يتحدث: {teacher.languages}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-[#4d4738] dark:text-[#a09a8a] font-arabic">
            <span className="material-symbols-outlined text-base">schedule</span>
            <span>{teacher.completedSessions}+ حصة مكتملة</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {teacher.tags.map((tag, tagIndex) => (
            <span
              key={tagIndex}
              className="px-2 py-1 bg-[#f5f3f0] dark:bg-[#2d2a24] text-[#8a8060] text-xs rounded font-arabic"
            >
              {tag}
            </span>
          ))}
        </div>
        {!isTeacher && (
          <>
            {loadingAvailability ? (
              <div className="w-full py-2.5 rounded-lg border-2 border-gray-300 text-gray-400 font-bold text-sm font-arabic mt-auto text-center flex items-center justify-center">
                <span className="material-symbols-outlined animate-spin text-base mr-2">refresh</span>
                جاري التحقق...
              </div>
            ) : hasAvailableSlots ? (
              <button
                onClick={handleBookClick}
                className="w-full py-2.5 rounded-lg border-2 border-primary text-[#181611] dark:text-white font-bold text-sm hover:bg-primary hover:text-white transition-all font-arabic mt-auto text-center"
              >
                اشترك الآن
              </button>
            ) : (
              <div className="w-full py-2.5 rounded-lg border-2 border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 font-bold text-sm font-arabic mt-auto text-center">
                لا يوجد وقت متاح
              </div>
            )}
          </>
        )}
      </div>
    </Link>
  );
}

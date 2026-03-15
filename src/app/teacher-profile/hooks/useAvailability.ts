/**
 * Hook for managing availability schedule
 */

import React, { useState, useCallback, useEffect } from 'react';
import { TeacherService } from '../../../services/teacherService';
import type { TeacherApplication } from '../../../shared/types/teacher.types';
import { INITIAL_AVAILABILITY } from '../constants/schedule';

export interface UseAvailabilityReturn {
  availability: (string | null)[][];
  toggleSlot: (dayIndex: number, timeIndex: number) => void;
  saveAvailability: (onSuccess?: () => void, onError?: (error: string) => void) => Promise<void>;
  saving: boolean;
  setAvailability: (availability: (string | null)[][]) => void;
  refetch: () => Promise<void>;
  hasChanges: boolean;
  originalAvailability: (string | null)[][];
}

export function useAvailability(
  teacherApplication: TeacherApplication | null,
  isPending: boolean,
  initialAvailability?: (string | null)[][]
) {
  const [availability, setAvailability] = useState<(string | null)[][]>(
    initialAvailability || INITIAL_AVAILABILITY
  );
  const [originalAvailability, setOriginalAvailability] = useState<(string | null)[][]>(
    initialAvailability || INITIAL_AVAILABILITY
  );
  const [saving, setSaving] = useState(false);

  // Update availability when initial data changes
  useEffect(() => {
    if (initialAvailability) {
      setAvailability(initialAvailability);
      setOriginalAvailability(initialAvailability);
    } else {
      setAvailability(INITIAL_AVAILABILITY);
      setOriginalAvailability(INITIAL_AVAILABILITY);
    }
  }, [initialAvailability]);

  // Check if there are changes
  const hasChanges = useCallback(() => {
    if (!originalAvailability || !availability) return false;
    
    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
      for (let timeIndex = 0; timeIndex < 12; timeIndex++) {
        const current = availability[dayIndex]?.[timeIndex];
        const original = originalAvailability[dayIndex]?.[timeIndex];
        if (current !== original) {
          return true;
        }
      }
    }
    return false;
  }, [availability, originalAvailability]);

  const toggleSlot = useCallback((dayIndex: number, timeIndex: number) => {
    if (isPending) return;

    // Prevent toggling booked slots
    const currentStatus = availability[dayIndex]?.[timeIndex];
    if (currentStatus === 'booked') {
      return;
    }

    const updated = availability.map((day, dIdx) => {
      if (dIdx === dayIndex) {
        return day.map((slot, tIdx) => {
          if (tIdx === timeIndex) {
            // Cycle through: null -> 'available' -> null
            if (slot === null) return 'available';
            if (slot === 'available') return null;
            return slot;
          }
          return slot;
        });
      }
      return day;
    });
    setAvailability(updated);
  }, [availability, isPending]);

  const saveAvailability = useCallback(async (
    onSuccess?: () => void,
    onError?: (error: string) => void
  ) => {
    if (!teacherApplication?.id) {
      const errorMsg = 'Cannot save: missing teacherApplication.id';
      onError?.(errorMsg);
      return;
    }

    setSaving(true);
    try {
      const teacherService = new TeacherService();
      const teacherId = teacherApplication.userId || teacherApplication.id;

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
      
      await teacherService.saveAvailability({
        teacherId,
        schedule: availability as ('available' | 'booked' | null)[][],
      });

      // Update original availability after successful save
      setOriginalAvailability(availability);
      
      onSuccess?.();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ أثناء حفظ جدول التوفر';
      onError?.(errorMessage);
    } finally {
      setSaving(false);
    }
  }, [availability, teacherApplication]);

  const refetch = useCallback(async () => {
    if (!teacherApplication?.id) return;

    try {
      const teacherService = new TeacherService();
      const teacherId = teacherApplication.userId || teacherApplication.id;
      const profileData = await teacherService.getTeacherProfileData(teacherId);
      
      const newAvailability = profileData.availability && profileData.availability.schedule
        ? profileData.availability.schedule
        : INITIAL_AVAILABILITY;
      
      setAvailability(newAvailability);
      setOriginalAvailability(newAvailability);
    } catch (error) {
      console.error('Error refetching availability:', error);
    }
  }, [teacherApplication]);

  return {
    availability,
    toggleSlot,
    saveAvailability,
    saving,
    setAvailability,
    refetch,
    hasChanges: hasChanges(),
    originalAvailability,
  };
}

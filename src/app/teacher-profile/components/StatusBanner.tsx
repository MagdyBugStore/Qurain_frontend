/**
 * Status banner component for teacher application status
 */

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TEACHER_APPLICATION_STATUS } from '../../../constants/status';
import type { TeacherApplicationStatus } from '../../../constants/status';

interface StatusBannerProps {
  status?: TeacherApplicationStatus | null;
  hasApplication: boolean;
}

export function StatusBanner({ status, hasApplication }: StatusBannerProps) {
  const navigate = useNavigate();

  // If no application exists, redirect to complete data info
  useEffect(() => {
    if (!hasApplication) {
      navigate('/teacher-application', { replace: true });
    }
  }, [hasApplication, navigate]);

  // If no application exists, don't render anything (redirect will happen)
  if (!hasApplication) {
    return null;
  }

  // If status is pending
  if (status === TEACHER_APPLICATION_STATUS.PENDING) {
    return (
      <div className="mb-4 sm:mb-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
        <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 shrink-0">schedule</span>
        <div className="flex-1">
          <p className="font-bold text-sm sm:text-base text-amber-900 dark:text-amber-200">طلبك قيد المراجعة</p>
          <p className="text-xs sm:text-sm text-amber-700 dark:text-amber-300">
            سيتم مراجعة طلبك خلال 48 ساعة. سيتم إشعارك عند الموافقة على طلبك.
          </p>
        </div>
      </div>
    );
  }

  // If status is rejected
  if (status === TEACHER_APPLICATION_STATUS.REJECTED) {
    return (
      <div className="mb-4 sm:mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
        <span className="material-symbols-outlined text-red-600 dark:text-red-400 shrink-0">cancel</span>
        <div className="flex-1">
          <p className="font-bold text-sm sm:text-base text-red-900 dark:text-red-200">تم رفض طلبك</p>
          <p className="text-xs sm:text-sm text-red-700 dark:text-red-300">
            للأسف، تم رفض طلبك للانضمام كمعلم. يمكنك التواصل مع الدعم الفني للمزيد من المعلومات.
          </p>
        </div>
      </div>
    );
  }

  // If approved, don't show anything
  return null;
}

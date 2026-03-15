/**
 * Teacher Sidebar Component
 * Displays pricing card and booking actions
 */

import React from 'react';
import { useAppStore } from '../../../../store/useAppStore';
import { useAuth } from '../../../../contexts/AuthContext';
import type { TeacherApplication } from '../../../../shared/types/teacher.types';
import { getCurrencySymbol } from '../../../../shared/utils/currency';

interface TeacherSidebarProps {
  application: TeacherApplication;
  onBookSession: () => void;
  onSendMessage: () => void;
}

export function TeacherSidebar({
  application,
  onBookSession,
  onSendMessage,
}: TeacherSidebarProps) {
  const openLoginModal = useAppStore((state) => state.openLoginModal);
  const { user: currentUser, userProfile } = useAuth();
  const sessionPrice = application.hourlyRate || 0;
  const currency = getCurrencySymbol(application.currency);
  const isTeacher = userProfile?.accountType === 'teacher';
  
  const handleBookClick = () => {
    // If user is not logged in, open login modal
    if (!currentUser) {
      openLoginModal();
      return;
    }
    
    // Check if user is a teacher - teachers cannot book other teachers
    if (isTeacher) {
      alert('المعلمون لا يمكنهم حجز حصص مع معلمين آخرين');
      return;
    }
    
    // If user is logged in, navigate directly to booking page
    onBookSession();
  };

  return (
    <div className="space-y-6">
      {/* Pricing Card */}
      <div className="bg-bg-card rounded-xl border border-gray-200 overflow-hidden shadow-xl shadow-black/20">
        <div className="p-6 border-b border-gray-200 text-center">
          <div className="flex flex-col items-center mb-2">
            <span className="text-text-light font-medium mb-2">سعر الحصة</span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-text-dark">{sessionPrice}</span>
              <span className="text-sm text-text-light">{currency}</span>
              <span className="text-sm text-text-light">/ ساعة</span>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 text-green-400 text-sm mb-6">
            
          </div>
          <button
            onClick={handleBookClick}
            disabled={isTeacher}
            className="w-full bg-primary hover:bg-primary/90 text-text-dark font-bold text-lg py-3 rounded-lg shadow-lg shadow-primary/10 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isTeacher ? 'غير متاح للمعلمين' : 'اشترك الآن'}
          </button>
          {isTeacher && (
            <p className="text-center text-xs text-text-light mt-2">
              المعلمون لا يمكنهم حجز حصص مع معلمين آخرين
            </p>
          )}
        </div>
        <div className="p-6 bg-gray-50">
          <h4 className="text-text-dark font-bold mb-4 text-sm uppercase tracking-wider text-center">ماذا تتضمن الحصة؟</h4>
          {(() => {
            // Parse sessionContent from JSON string
            let sessionContent: Array<{ title: string; subject: string }> = [];
            try {
              if (application.sessionContent) {
                const parsed = JSON.parse(application.sessionContent);
                if (Array.isArray(parsed)) {
                  sessionContent = parsed;
                }
              }
            } catch (e) {
              // If parsing fails, use default items
            }

            // If no session content, show default items
            if (sessionContent.length === 0) {
              return (
                <ul className="space-y-0">
                  <li className="flex items-start gap-3 text-text-light text-sm pb-3 border-b border-gray-200">
                    <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">check_circle</span>
                    <span>خطة دراسية مخصصة</span>
                  </li>
                  <li className="flex items-start gap-3 text-text-light text-sm py-3 border-b border-gray-200">
                    <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">check_circle</span>
                    <span>مواد تعليمية مجانية</span>
                  </li>
                  <li className="flex items-start gap-3 text-text-light text-sm py-3 border-b border-gray-200">
                    <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">check_circle</span>
                    <span>تسجيل صوتي للحصة للمراجعة</span>
                  </li>
                  <li className="flex items-start gap-3 text-text-light text-sm pt-3">
                    <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">check_circle</span>
                    <span>شهادة إتمام المستوى</span>
                  </li>
                </ul>
              );
            }

            // Show real session content
            return (
              <ul className="space-y-0">
                {sessionContent.map((item, index) => (
                  <li
                    key={index}
                    className={`flex items-start gap-3 text-text-light text-sm ${
                      index < sessionContent.length - 1 ? 'pb-3 border-b border-gray-200' : 'pt-3'
                    }`}
                  >
                    <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">check_circle</span>
                    <div className="flex-1">
                      {item.title && (
                        <span className="font-bold text-text-dark block mb-1">{item.title}</span>
                      )}
                      <span>{item.subject || item.title}</span>
                    </div>
                  </li>
                ))}
              </ul>
            );
          })()}
        </div>
      </div>

    </div>
  );
}

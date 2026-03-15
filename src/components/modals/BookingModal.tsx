'use client'

import React from "react";
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../../store/useAppStore'
import { useAuth } from '../../contexts/AuthContext'

export default function BookingModal() {
  const isOpen = useAppStore((state) => state.isBookingModalOpen)
  const teacherId = useAppStore((state) => state.bookingTeacherId)
  const closeModal = useAppStore((state) => state.closeBookingModal)
  const openLoginModal = useAppStore((state) => state.openLoginModal)
  const { user: currentUser, userProfile } = useAuth()
  const navigate = useNavigate()

  const handleBookNow = () => {
    if (!currentUser) {
      // Close booking modal and open login modal
      closeModal()
      openLoginModal()
      return
    }
    
    // Check if user is a teacher - teachers cannot book other teachers
    if (userProfile?.accountType === 'teacher') {
      alert('المعلمون لا يمكنهم حجز حصص مع معلمين آخرين')
      closeModal()
      return
    }
    
    // Navigate to teacher booking page
    if (teacherId) {
      closeModal()
      navigate(`/teachers/${teacherId}/book`)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={closeModal}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-[#fdfcfb] shadow-2xl animate-in fade-in zoom-in duration-300">
        {/* Close Button */}
        <button
          onClick={closeModal}
          className="absolute left-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/5 text-text-muted transition-colors hover:bg-black/10 hover:text-text-main focus:outline-none"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>

        <div className="relative px-8 py-10">
          {/* Branding & Header */}
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary shadow-inner">
              <span className="material-symbols-outlined text-4xl">calendar_month</span>
            </div>
            <h2 className="text-2xl font-bold text-text-main">احجز حصة الآن</h2>
            <p className="mt-1 text-sm text-text-muted">
              {!currentUser
                ? 'سجّل الدخول أولاً لحجز حصة مع المعلم'
                : userProfile?.accountType === 'teacher'
                ? 'المعلمون لا يمكنهم حجز حصص مع معلمين آخرين'
                : 'اختر التاريخ والوقت المناسبين لحجز حصتك مع المعلم'
              }
            </p>
          </div>

          {/* Action Button */}
          <div className="space-y-4">
            <button
              type="button"
              onClick={handleBookNow}
              disabled={userProfile?.accountType === 'teacher'}
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-primary hover:bg-primary/90 py-3 px-4 text-base font-bold text-[#181611] transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-lg shadow-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined">event_available</span>
              <span>
                {!currentUser 
                  ? 'سجّل الدخول للبدء'
                  : userProfile?.accountType === 'teacher'
                  ? 'غير متاح للمعلمين'
                  : 'اختر الموعد'
                }
              </span>
            </button>

            {currentUser && (
              <button
                type="button"
                onClick={closeModal}
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-[#e4e2dc] bg-white py-3 px-4 text-base font-medium text-text-main transition-all hover:border-primary/30 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <span>إلغاء</span>
              </button>
            )}
          </div>

          {/* Footer */}
          {!currentUser && (
            <div className="mt-8 text-center">
              <p className="text-xs text-text-muted leading-relaxed">
                لا تملك حساباً؟{' '}
                <button
                  onClick={() => {
                    closeModal()
                    openLoginModal()
                  }}
                  className="font-medium text-primary hover:underline transition-colors"
                >
                  سجّل الدخول
                </button>
                {' '}لإنشاء حساب جديد تلقائياً
              </p>
            </div>
          )}
        </div>

        {/* Decorative Bottom Accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
      </div>
    </div>
  )
}

'use client'

import React from "react";
import { useState, useEffect } from 'react'
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom'
import Header from '../../../../components/layout/Header'
import { BookingService } from '../../../../services/bookingService'
import { useAuth } from '../../../../contexts/AuthContext'
import { getTeacherDisplayName, getTeacherTitle, getTeacherImageUrl } from '../../../../shared/utils/teacher'
import { getCurrencySymbol } from '../../../../shared/utils/currency'

export default function BookingConfirmPage() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const { user, userProfile } = useAuth()
  const [techCheckConfirmed, setTechCheckConfirmed] = useState(false)
  const [bookingConfirmed, setBookingConfirmed] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null)

  // Get subscription data from navigation state
  const subscriptionData = location.state as {
    selectedPlan: 'starter' | 'premium' | 'elite'
    planConfig: {
      id: string
      label: string
      sessionsPerMonth: number
      weeklyFrequency: string
      durationMinutes: number
    }
    selectedWeeklySlots: Array<{ dayIndex: number; time: string }>
    duration: number
    teacherData: any
    teacherName: string
    teacherTitle: string
    profileImage: string
    hourlyRate: number
    currency: string
    monthlyPrice: number
  }

  // Redirect if no data
  useEffect(() => {
    if (!subscriptionData || !user) {
      navigate(`/booking/${id}`)
    }
  }, [subscriptionData, user, id, navigate])

  const handleConfirm = async () => {
    if (!user || !subscriptionData) {
      setError('يجب تسجيل الدخول أولاً')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const bookingService = new BookingService()
      
      // Calculate next renewal date (30 days from now)
      const startDate = new Date()
      const nextRenewalDate = new Date(startDate)
      nextRenewalDate.setDate(nextRenewalDate.getDate() + 30)

      const subscriptionId = await bookingService.createSubscription({
        studentId: user.uid,
        studentName: userProfile?.displayName || user.displayName || user.email || 'طالب',
        studentEmail: user.email || '',
        teacherId: id || '',
        teacherName: subscriptionData.teacherName,
        planId: subscriptionData.selectedPlan,
        planLabel: subscriptionData.planConfig.label,
        sessionsPerMonth: subscriptionData.planConfig.sessionsPerMonth,
        weeklyFrequency: subscriptionData.planConfig.weeklyFrequency,
        durationMinutes: subscriptionData.planConfig.durationMinutes,
        weeklySlots: subscriptionData.selectedWeeklySlots,
        monthlyPrice: subscriptionData.monthlyPrice,
        currency: subscriptionData.currency,
        status: 'active',
        startDate,
        nextRenewalDate,
      })

      setSubscriptionId(subscriptionId)
      setBookingConfirmed(true)
    } catch (err) {
      console.error('Error creating subscription:', err)
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء حفظ الاشتراك. يرجى المحاولة مرة أخرى.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (bookingConfirmed) {
    return (
      <>
        <Header />
        <main className="flex-grow flex flex-col md:flex-row items-center justify-center p-6 gap-8 bg-background-light dark:bg-background-dark min-h-screen">
          {/* Success State */}
          <div className="w-full max-w-lg bg-white dark:bg-surface-dark rounded-xl shadow-lg border border-slate-200 dark:border-[#393528] overflow-hidden flex flex-col justify-center items-center h-fit min-h-[500px] text-center p-8 relative">
            {/* Decorative background pattern */}
            <div
              className="absolute inset-0 opacity-5 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(#f4c025 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />
            <div className="relative z-10 flex flex-col items-center gap-6 max-w-sm">
              {/* Success Animation */}
              <div className="relative size-24 mb-2">
                <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
                <div className="absolute inset-2 bg-primary/30 rounded-full"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="size-16 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/30">
                    <span className="material-symbols-outlined text-[#181611] text-4xl font-bold">check</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">تم الاشتراك بنجاح!</h2>
                <p className="text-slate-500 dark:text-[#bab29c]">
                  بارك الله في وقتك وعلمك. تم تفعيل اشتراكك الشهري بنجاح. سيتم تجديد الاشتراك تلقائياً كل شهر.
                </p>
              </div>
              <div className="w-full bg-slate-50 dark:bg-[#2c281e] rounded-lg p-4 border border-slate-100 dark:border-[#393528] flex flex-col gap-2">
                <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold">
                  رقم الاشتراك
                </p>
                <p className="text-xl font-mono font-bold text-slate-900 dark:text-white tracking-widest">
                  {subscriptionId ? `#${subscriptionId.substring(0, 8).toUpperCase()}` : '#QO-XXXX'}
                </p>
              </div>
              <div className="flex flex-col w-full gap-3 mt-4">
                <button className="w-full bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">calendar_add_on</span>
                  إضافة للتقويم
                </button>
                <Link
                  to="/"
                  className="text-primary hover:text-primary/80 text-sm font-bold py-2 transition-colors"
                >
                  العودة للرئيسية
                </Link>
              </div>
            </div>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="flex-grow flex flex-col md:flex-row items-center justify-center p-6 gap-8 bg-background-light dark:bg-background-dark min-h-screen">
        {/* Booking Confirmation */}
        <div className="w-full max-w-lg bg-white dark:bg-surface-dark rounded-xl shadow-lg border border-slate-200 dark:border-[#393528] overflow-hidden flex flex-col h-fit">
          <div className="p-6 border-b border-slate-100 dark:border-[#393528]">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">تأكيد الاشتراك</h1>
            <p className="text-slate-500 dark:text-[#bab29c] text-sm">
              يرجى مراجعة تفاصيل الاشتراك قبل التأكيد النهائي
            </p>
          </div>
          {error && (
            <div className="p-4 mx-6 mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}
          <div className="p-6 flex flex-col gap-6">
            {/* Teacher Card */}
            {subscriptionData && (
              <>
                <div className="flex gap-4 p-4 rounded-lg bg-slate-50 dark:bg-[#2c281e] border border-slate-100 dark:border-[#393528]">
                  <div
                    className="size-16 rounded-lg bg-cover bg-center shrink-0"
                    style={{
                      backgroundImage: `url('${subscriptionData.profileImage}')`,
                    }}
                  />
                  <div className="flex flex-col justify-center">
                    <h3 className="text-slate-900 dark:text-white font-bold text-lg">{subscriptionData.teacherName}</h3>
                    <p className="text-primary text-sm font-medium">{subscriptionData.teacherTitle}</p>
                  </div>
                </div>
                {/* Subscription Details */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                    <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined">workspace_premium</span>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-[#bab29c]">الباقة</p>
                      <p className="font-medium">{subscriptionData.planConfig.label}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                    <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined">event</span>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-[#bab29c]">عدد الجلسات</p>
                      <p className="font-medium">{subscriptionData.planConfig.sessionsPerMonth} جلسة شهرياً</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                    <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined">schedule</span>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-[#bab29c]">مدة الجلسة</p>
                      <p className="font-medium">{subscriptionData.planConfig.durationMinutes} دقيقة</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                    <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined">payments</span>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-[#bab29c]">السعر الشهري</p>
                      <p className="font-medium">{subscriptionData.monthlyPrice.toFixed(2)} {subscriptionData.currency}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                    <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined">calendar_month</span>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-[#bab29c]">المواعيد الأسبوعية</p>
                      <p className="font-medium">{subscriptionData.selectedWeeklySlots.length} موعد أسبوعياً</p>
                    </div>
                  </div>
                </div>
              </>
            )}
            <div className="h-px bg-slate-100 dark:bg-[#393528] w-full my-2"></div>
            {/* Tech Check */}
            <label className="group flex gap-3 items-start cursor-pointer">
              <div className="relative flex items-center pt-1">
                <input
                  className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-slate-300 dark:border-[#544e3b] bg-transparent text-primary checked:border-primary checked:bg-primary transition-all focus:ring-0 focus:ring-offset-0"
                  type="checkbox"
                  checked={techCheckConfirmed}
                  onChange={(e) => setTechCheckConfirmed(e.target.checked)}
                />
                <span className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-900 dark:text-[#181611] opacity-0 peer-checked:opacity-100">
                  <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path
                      clipRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      fillRule="evenodd"
                    />
                  </svg>
                </span>
              </div>
              <span className="text-sm text-slate-600 dark:text-slate-300 select-none group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                أقر بأنني قمت بإجراء فحص تقني للصوت والكاميرا وأن الاتصال بالإنترنت مستقر.
              </span>
            </label>
          </div>
          {/* Actions */}
          <div className="p-6 pt-0 flex gap-3">
            <button
              onClick={handleConfirm}
              disabled={!techCheckConfirmed || isSubmitting}
              className="flex-1 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-[#181611] font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-[#181611]"></div>
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">check_circle</span>
                  تأكيد الاشتراك
                </>
              )}
            </button>
            <Link
              to={`/teachers/${id}`}
              className="bg-transparent border border-slate-300 dark:border-[#544e3b] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#2c281e] font-medium py-3 px-6 rounded-lg transition-colors"
            >
              العودة
            </Link>
          </div>
        </div>
        {/* Arrow for visual flow (hidden on mobile) */}
        <div className="hidden md:flex flex-col items-center justify-center text-slate-300 dark:text-[#393528]">
          <span className="material-symbols-outlined text-4xl rotate-180">arrow_right_alt</span>
        </div>
      </main>
    </>
  )
}

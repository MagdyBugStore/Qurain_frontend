'use client'

import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from 'react-router-dom'
import Header from '../../../components/layout/Header'
import { useTeacherDetail } from '../../../features/teachers/hooks/useTeacherDetail'
import { getTeacherDisplayName, getTeacherTitle, getTeacherImageUrl } from '../../../shared/utils/teacher'
import { getCurrencySymbol } from '../../../shared/utils/currency'
import { useAuth } from '../../../contexts/AuthContext'
import { TeacherDetailHeader } from '../../../features/teachers/components/TeacherDetail/TeacherDetailHeader'
import { TeacherAvailability } from '../../../features/teachers/components/TeacherDetail/TeacherAvailability'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../../../config/firebase'
import { COLLECTIONS } from '../../../constants/firebaseCollections'

export default function BookingPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: teacherData, loading, error } = useTeacherDetail(id)
  const { userProfile } = useAuth()

  // Booking flow steps
  type PlanId = 'starter' | 'premium' | 'elite'
  type WeeklySlot = {
    dayIndex: number
    time: string
  }

  const [currentStep, setCurrentStep] = useState<1 | 2>(1)
  const [selectedPlan, setSelectedPlan] = useState<PlanId | null>(null)

  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [duration, setDuration] = useState<number>(30)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  // Get teacher data
  const teacherName = teacherData ? getTeacherDisplayName(teacherData.profile, teacherData.application) : ''
  const teacherTitle = teacherData ? getTeacherTitle(teacherData.application) : ''
  const profileImage = teacherData ? getTeacherImageUrl(teacherData.profile) : '/no-image.png'
  const hourlyRate = teacherData?.application.hourlyRate || 0
  const currency = teacherData ? getCurrencySymbol(teacherData.application.currency) : 'ر.س'
  const rating = teacherData?.rating || 0
  const reviewsCount = teacherData?.reviewsCount || 0

  const [selectedWeeklySlots, setSelectedWeeklySlots] = useState<WeeklySlot[]>([])
  const [bookedSlotsSet, setBookedSlotsSet] = useState<Set<string>>(new Set())

  // Fetch booked slots from subscriptions
  useEffect(() => {
    const fetchBookedSlots = async () => {
      console.log('[BookingPage] ===== FETCHING BOOKED SLOTS =====')
      console.log('[BookingPage] Teacher data:', teacherData)
      console.log('[BookingPage] Teacher ID from params:', id)
      
      if (!teacherData?.application?.userId && !id) {
        console.log('[BookingPage] No teacher data or ID, skipping fetch')
        return
      }

      try {
        const teacherId = teacherData?.application?.userId || id || ''
        console.log('[BookingPage] Using teacher ID:', teacherId)
        
        const subscriptionsQuery = query(
          collection(db, COLLECTIONS.SUBSCRIPTIONS),
          where('teacherId', '==', teacherId),
          where('status', '==', 'active')
        )
        
        console.log('[BookingPage] Query created, fetching subscriptions...')
        
        let subscriptionsSnapshot
        try {
          subscriptionsSnapshot = await getDocs(subscriptionsQuery)
          console.log('[BookingPage] Subscriptions fetched successfully:', subscriptionsSnapshot.size)
        } catch (queryError: any) {
          console.error('[BookingPage] Query error:', queryError)
          // If query fails due to missing index, try without status filter
          if (queryError?.code === 'failed-precondition' || queryError?.message?.includes('index')) {
            console.log('[BookingPage] Retrying query without status filter...')
            const fallbackQuery = query(
              collection(db, COLLECTIONS.SUBSCRIPTIONS),
              where('teacherId', '==', teacherId)
            )
            subscriptionsSnapshot = await getDocs(fallbackQuery)
            console.log('[BookingPage] Fallback query result:', subscriptionsSnapshot.size, 'subscriptions')
            
            // Filter by status in memory
            const filteredDocs = subscriptionsSnapshot.docs.filter(doc => {
              const data = doc.data()
              return data.status === 'active'
            })
            
            console.log('[BookingPage] Filtered active subscriptions:', filteredDocs.length)
            
            subscriptionsSnapshot = {
              docs: filteredDocs,
              size: filteredDocs.length,
            } as any
          } else {
            // Silently fail - permissions issue
            console.warn('[BookingPage] Could not fetch booked slots:', queryError.message)
            console.warn('[BookingPage] Error code:', queryError?.code)
            return
          }
        }
        
        const booked = new Set<string>()
        
        console.log('[BookingPage] Processing subscriptions...')
        subscriptionsSnapshot.docs.forEach((doc, index) => {
          const subscriptionData = doc.data()
          const weeklySlots = subscriptionData.weeklySlots || []
          
          console.log(`[BookingPage] Subscription ${index + 1}:`, {
            id: doc.id,
            teacherId: subscriptionData.teacherId,
            status: subscriptionData.status,
            weeklySlotsCount: weeklySlots.length,
            weeklySlots,
          })
          
          weeklySlots.forEach((slot: { dayIndex: number; time: string }) => {
            const key = `${slot.dayIndex}_${slot.time}`
            booked.add(key)
            console.log(`[BookingPage] Added booked slot: ${key} (dayIndex=${slot.dayIndex}, time=${slot.time})`)
          })
        })
        
        console.log('[BookingPage] Total booked slots:', booked.size)
        console.log('[BookingPage] Booked slots:', Array.from(booked))
        console.log('[BookingPage] ===== BOOKED SLOTS FETCH COMPLETED =====')
        
        setBookedSlotsSet(booked)
      } catch (error) {
        // Silently fail - permissions issue or other error
        console.error('[BookingPage] ===== BOOKED SLOTS FETCH FAILED =====')
        console.error('[BookingPage] Error fetching booked slots:', error)
        console.error('[BookingPage] Error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
        })
      }
    }

    if (teacherData) {
      fetchBookedSlots()
    } else {
      console.log('[BookingPage] No teacher data yet, waiting...')
    }
  }, [teacherData, id])

  // Subscription-like plans UI (step 1)
  const plans: {
    id: PlanId
    label: string
    sessionsPerMonth: number
    weeklyFrequency: string
    durationMinutes: number
    badge?: string
  }[] = [
    {
      id: 'starter',
      label: 'باقة الانطلاق',
      sessionsPerMonth: 8,
      weeklyFrequency: 'مرتين أسبوعياً',
      durationMinutes: 60,
    },
    {
      id: 'premium',
      label: 'باقة التميز',
      sessionsPerMonth: 12,
      weeklyFrequency: '3 مرات أسبوعياً',
      durationMinutes: 60,
      badge: 'الاكثر شيوعاً',
    },
    {
      id: 'elite',
      label: 'باقة الإتقان',
      sessionsPerMonth: 16,
      weeklyFrequency: '4 مرات أسبوعياً',
      durationMinutes: 60,
    },
  ]

  const getPlanMonthlyPrice = (plan: { sessionsPerMonth: number; durationMinutes: number }) => {
    if (!hourlyRate) return 0
    const pricePerSession = (hourlyRate * plan.durationMinutes) / 60
    return pricePerSession * plan.sessionsPerMonth
  }

  const handleSelectPlan = (planId: PlanId) => {
    setSelectedPlan(planId)
    // Keep 60 minutes by default to match UI reference
    setDuration(60)
    // Reset weekly selections when changing plan
    setSelectedWeeklySlots([])
    setSelectedTime('')
    // Move directly to step 2 when a package is selected
    setCurrentStep(2)
  }

  // Calculate total cost
  const totalCost = (hourlyRate * duration) / 60

  // Time slots mapping (12 slots per day) matching teacher availability schedule
  const availabilityTimeSlots = [
    '٠٨:٠٠ ص', '٠٩:٠٠ ص', '١٠:٠٠ ص', '١١:٠٠ ص',
    '١٢:٠٠ م', '٠١:٠٠ م', '٠٢:٠٠ م', '٠٣:٠٠ م',
    '٠٤:٠٠ م', '٠٥:٠٠ م', '٠٦:٠٠ م', '٠٧:٠٠ م',
  ]

  // Map JS day (0=Sunday) to our availability index (0=Saturday)
  const getAvailabilityDayIndex = (date: Date): number => {
    const jsDay = date.getDay() // 0=Sun ... 6=Sat
    const map: { [key: number]: number } = {
      0: 1, // Sunday -> index 1
      1: 2, // Monday -> index 2
      2: 3, // Tuesday -> index 3
      3: 4, // Wednesday -> index 4
      4: 5, // Thursday -> index 5
      5: 6, // Friday -> index 6
      6: 0, // Saturday -> index 0
    }
    return map[jsDay] ?? 0
  }

  // Map availability index (0=Saturday) back to JS day (0=Sunday)
  const getJsDayFromAvailabilityIndex = (availabilityIndex: number): number => {
    const map: { [key: number]: number } = {
      0: 6, // Saturday
      1: 0, // Sunday
      2: 1, // Monday
      3: 2, // Tuesday
      4: 3, // Wednesday
      5: 4, // Thursday
      6: 5, // Friday
    }
    return map[availabilityIndex] ?? 0
  }

  // Given availability day index and slot, find next actual Date for that weekday
  const getNextDateForAvailabilityDay = (availabilityDayIndex: number): Date => {
    const today = new Date()
    const jsTargetDay = getJsDayFromAvailabilityIndex(availabilityDayIndex)
    const result = new Date(today)
    let addDays = (jsTargetDay - today.getDay() + 7) % 7
    if (addDays === 0) addDays = 7 // always next week if same day to avoid past ambiguity
    result.setDate(today.getDate() + addDays)
    return result
  }

  // Format date for display
  const formatDate = (date: Date): string => {
    const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
    const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
  }

  // Get available time slots for selected date based on teacher availability from Firestore
  const getAvailableTimeSlots = (): string[] => {
    if (!teacherData?.availability || teacherData.availability.length === 0) {
      return []
    }

    const dayIndex = getAvailabilityDayIndex(selectedDate)
    const daySchedule = teacherData.availability[dayIndex] || []

    const slots: string[] = []
    availabilityTimeSlots.forEach((timeLabel, idx) => {
      if (daySchedule[idx] === 'available') {
        slots.push(timeLabel)
      }
    })

    return slots
  }

  // Generate calendar days
  const getCalendarDays = (): (Date | null)[] => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()
    
    const days: (Date | null)[] = []
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    
    return days
  }

  const handleConfirmBooking = () => {
    if (!hasValidWeeklySelection) {
      alert('يرجى اختيار المواعيد الأسبوعية المطلوبة')
      return
    }
    if (!selectedPlan) {
      alert('يرجى اختيار باقة')
      return
    }
    
    const planConfig = plans.find((p) => p.id === selectedPlan)
    if (!planConfig) {
      alert('خطأ في بيانات الباقة')
      return
    }

    // Navigate to confirmation page with all subscription data
    navigate(`/booking/${id}/confirm`, {
      state: {
        selectedPlan,
        planConfig,
        selectedWeeklySlots,
        duration,
        teacherData,
        teacherName,
        teacherTitle,
        profileImage,
        hourlyRate,
        currency,
        monthlyPrice: getPlanMonthlyPrice(planConfig),
      }
    })
  }

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const getMonthName = () => {
    const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
    return `${months[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`
  }

  const handleBackFromStep = () => {
    if (currentStep === 2) {
      setCurrentStep(1)
      return
    }
    // Default back to teacher page
    navigate(`/teachers/${id}`)
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="flex items-center justify-center min-h-screen bg-bg-main">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-text-light">جاري التحميل...</p>
          </div>
        </div>
      </>
    )
  }

  // Check if user is a teacher - teachers cannot book other teachers
  if (userProfile?.accountType === 'teacher') {
    return (
      <>
        <Header />
        <div className="flex items-center justify-center min-h-screen bg-bg-main">
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <div className="bg-red-50 p-4 rounded-full">
                <span className="material-symbols-outlined text-red-500 text-4xl">block</span>
              </div>
            </div>
            <h2 className="text-text-dark text-2xl font-bold mb-2">غير مسموح</h2>
            <p className="text-text-light mb-4">المعلمون لا يمكنهم حجز حصص مع معلمين آخرين</p>
            <Link to="/teachers" className="text-primary hover:underline">
              العودة إلى قائمة المعلمين
            </Link>
          </div>
        </div>
      </>
    )
  }

  if (error || !teacherData) {
    return (
      <>
        <Header />
        <div className="flex items-center justify-center min-h-screen bg-bg-main">
          <div className="text-center">
            <p className="text-text-light mb-4">المعلم غير موجود</p>
            <Link to="/teachers" className="text-primary hover:underline">
              العودة إلى قائمة المعلمين
            </Link>
          </div>
        </div>
      </>
    )
  }

  // Calculate total available slots for the teacher
  const calculateAvailableSlots = (): number => {
    if (!teacherData?.availability || teacherData.availability.length === 0) {
      return 0
    }

    let availableCount = 0
    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
      const daySchedule = teacherData.availability[dayIndex] || []
      for (let timeIndex = 0; timeIndex < 12; timeIndex++) {
        const slotStatus = daySchedule[timeIndex]
        // Check if slot is available and not booked
        if (slotStatus === 'available') {
          const slotTime = availabilityTimeSlots[timeIndex]
          const key = `${dayIndex}_${slotTime}`
          // Only count if not booked by subscriptions
          if (!bookedSlotsSet.has(key)) {
            availableCount++
          }
        }
      }
    }
    return availableCount
  }

  const totalAvailableSlots = calculateAvailableSlots()
  const availableWeeklySessions = totalAvailableSlots // Total available slots per week

  // Filter plans based on available slots
  const getAvailablePlans = () => {
    return plans.filter((plan) => {
      const requiredWeekly = Math.round(plan.sessionsPerMonth / 4)
      return availableWeeklySessions >= requiredWeekly
    })
  }

  const availablePlans = getAvailablePlans()
  const hasAvailableSlots = totalAvailableSlots > 0

  const timeSlots = getAvailableTimeSlots()
  const calendarDays = getCalendarDays()
  const selectedPlanConfig = selectedPlan ? plans.find((p) => p.id === selectedPlan) ?? null : null
  const requiredWeeklySessions = selectedPlanConfig
    ? Math.round(selectedPlanConfig.sessionsPerMonth / 4)
    : 0
  const weeklySessionsCount = selectedWeeklySlots.length
  const hasValidWeeklySelection =
    requiredWeeklySessions > 0
      ? weeklySessionsCount === requiredWeeklySessions
      : weeklySessionsCount > 0

  const isDateSelected = (date: Date | null): boolean => {
    if (!date) return false
    return date.toDateString() === selectedDate.toDateString()
  }

  return (
    <>
      <Header />
      {currentStep === 1 ? (
        // STEP 1: اختيار الباقة التعليمية (UI reference: booking-step1.html)
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 md:px-6 bg-background-light dark:bg-background-dark">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content Area - Plans */}
            <div className="flex-1 space-y-8">
              {/* Progress Section */}
              <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="space-y-1">
                  <h1 className="text-2xl font-black font-cairo text-slate-900 dark:text-white">
                    اختيار الباقة التعليمية
                  </h1>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">
                    الخطوة الأولى: حدد الخطة المناسبة لأهدافك في حفظ القرآن
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative flex items-center justify-center">
                    <svg className="w-10 h-10 transform -rotate-90">
                      <circle
                        className="text-slate-200 dark:text-slate-700"
                        cx="20"
                        cy="20"
                        r="16"
                        fill="transparent"
                        stroke="currentColor"
                        strokeWidth="3"
                      />
                      <circle
                        className="text-primary transition-all duration-500 ease-in-out"
                        cx="20"
                        cy="20"
                        r="16"
                        fill="transparent"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeDasharray="100"
                        strokeDashoffset="50"
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute text-[11px] font-bold text-slate-700 dark:text-slate-100 transition-all duration-300">
                      1/2
                    </span>
                  </div>
                </div>
              </div>

              {/* Plans Grid - centered on screen */}
              <div className="flex items-center justify-center min-h-[60vh]">
                {!hasAvailableSlots ? (
                  <div className="text-center py-12">
                    <div className="mb-4 flex justify-center">
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-full">
                        <span className="material-symbols-outlined text-yellow-500 text-4xl">schedule</span>
                      </div>
                    </div>
                    <h2 className="text-text-dark dark:text-white text-2xl font-bold mb-2">لا يوجد وقت متاح</h2>
                    <p className="text-text-light mb-4">المعلم لا يمتلك أي أوقات متاحة للحجز حالياً</p>
                    <Link to={`/teachers/${id}`} className="text-primary hover:underline">
                      العودة إلى صفحة المعلم
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
                    {availablePlans.map((plan) => {
                    const isSelected = selectedPlan === plan.id
                    const isPremium = plan.id === 'premium'
                    return (
                      <div
                        key={plan.id}
                        className={`group relative bg-white dark:bg-slate-900 rounded-xl border-2 p-6 flex flex-col transition-all ${
                          isPremium
                            ? 'border-primary shadow-lg shadow-primary/5'
                            : 'border-slate-100 dark:border-slate-800 hover:border-primary/50 dark:hover:border-primary/40 hover:shadow-xl'
                        } ${isSelected ? 'ring-2 ring-primary/60' : ''}`}
                      >
                        {plan.badge && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full font-cairo">
                            {plan.badge}
                          </div>
                        )}
                        <div className="mb-4 flex justify-between items-center">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold font-cairo ${
                              isPremium
                                ? 'bg-primary/10 text-primary'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            {plan.label}
                          </span>
                          <div className="flex items-center gap-1 text-primary">
                            <span className="material-symbols-outlined text-sm">schedule</span>
                            <span className="text-[10px] font-bold font-cairo">
                              {plan.durationMinutes} دقيقة
                            </span>
                          </div>
                        </div>
                        <h3 className="text-xl font-bold font-cairo mb-1">
                          {plan.sessionsPerMonth} جلسات شهرياً
                        </h3>
                        <div className="space-y-1 text-[11px] text-slate-500 dark:text-slate-400 font-cairo mb-4">
                          <p className="font-bold">
                            عدد الجلسات / الأسبوع: {plan.weeklyFrequency}
                          </p>
                          <p>
                            مدة الجلسة: {plan.durationMinutes} دقيقة
                          </p>
                        </div>
                        <div className="flex items-baseline gap-1 mb-4">
                          <span className="text-3xl font-black text-primary">
                            {hourlyRate ? getPlanMonthlyPrice(plan).toFixed(2) : '--'}
                          </span>
                          <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                            /شهر {hourlyRate ? currency : ''}
                          </span>
                        </div>
                        <div className="flex-1" />
                        <button
                          type="button"
                          onClick={() => handleSelectPlan(plan.id)}
                          className={`w-full py-3 px-4 rounded-lg font-bold font-cairo transition-all text-center ${
                            isSelected || isPremium
                              ? 'bg-primary text-white shadow-md shadow-primary/20 hover:scale-[1.02]'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 group-hover:bg-primary group-hover:text-white'
                          }`}
                        >
                          اختيار الباقة
                        </button>
                      </div>
                    )
                  })}
                  </div>
                )}
              </div>
            </div>

          </div>

        </main>
      ) : (
        // STEP 2: اختيار المواعيد (معاد تصميمها بناءً على booking-step2.html)
        <main className="flex-1 bg-bg-main">
          <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">الخطوة الثانية</p>
                <h2 className="text-sm font-bold font-cairo text-slate-900 dark:text-white">
                  اختيار المواعيد
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative flex items-center justify-center">
                  <svg className="w-10 h-10 transform -rotate-90">
                    <circle
                      className="text-slate-200 dark:text-slate-700"
                      cx="20"
                      cy="20"
                      r="16"
                      fill="transparent"
                      stroke="currentColor"
                      strokeWidth="3"
                    />
                    <circle
                      className="text-primary transition-all duration-500 ease-in-out"
                      cx="20"
                      cy="20"
                      r="16"
                      fill="transparent"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeDasharray="100"
                      strokeDashoffset="0"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute text-[11px] font-bold text-slate-700 dark:text-slate-100 transition-all duration-300">
                    2/2
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Main Calendar Section */}
              <div className="lg:col-span-8 space-y-6">
                {/* Tutor Header Card (styled like reference) */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center gap-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary/20">
                      <img
                        src={profileImage}
                        alt={teacherName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute bottom-1 right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900" />
                  </div>
                  <div className="text-center md:text-right flex-1">
                    <h2 className="text-2xl font-bold font-cairo mb-1 text-slate-900 dark:text-white">
                      {teacherName}
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-2">
                      {teacherTitle || 'معلم/ـة قرآن وتجويد مجاز'}
                    </p>
                    <div className="flex items-center justify-center md:justify-start gap-1 text-primary">
                      <span className="material-symbols-outlined text-sm">star</span>
                      <span className="text-sm font-bold">
                        {rating.toFixed(1)} ({reviewsCount} تقييم)
                      </span>
                    </div>
                  </div>
                  <div className="w-full md:w-auto text-center md:text-right border-t md:border-t-0 md:border-r border-slate-100 dark:border-slate-800 pt-4 md:pt-0 md:pr-6">
                    <span className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">
                      مدة الحصة
                    </span>
                    <span className="inline-flex items-center gap-2 text-primary font-bold text-lg font-cairo">
                      <span className="material-symbols-outlined text-xl">schedule</span>
                      {duration} دقيقة
                    </span>
                  </div>
                </div>

                

                {/* Weekly Slot Grid (جدول المواعيد الأسبوعية) */}
                {teacherData.availability && teacherData.availability.length > 0 && (
                  <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mt-4">
                    <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <h3 className="font-bold font-cairo text-lg text-slate-900 dark:text-white">
                        جدول المواعيد الأسبوعية
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                        <span className="material-symbols-outlined text-sm">info</span>
                        <div className="flex flex-col">
                          <span>
                            {selectedPlan
                              ? `اختر مواعيد تناسب خطة ${
                                  plans.find((p) => p.id === selectedPlan)?.sessionsPerMonth
                                } حصص`
                              : 'اختر المواعيد الأسبوعية المناسبة لك'}
                          </span>
                          {selectedPlanConfig && (
                            <span className="text-xs mt-1">
                              عدد الحصص الأسبوعية المطلوبة لهذه الباقة:{' '}
                              <span className="font-bold text-primary">
                                {requiredWeeklySessions}
                              </span>{' '}
                              حصة في الأسبوع
                              {weeklySessionsCount > 0 && (
                                <> — تم اختيار {weeklySessionsCount} حصة</>
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <div className="inline-flex min-w-full p-6 gap-3">
                        {['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'].map(
                          (dayLabel, availabilityDayIndex) => {
                            const daySchedule = teacherData.availability[availabilityDayIndex] || []
                            
                            // Log for first day only to avoid spam
                            if (availabilityDayIndex === 0) {
                              console.log('[BookingPage] ===== PROCESSING AVAILABILITY FOR DISPLAY =====')
                              console.log('[BookingPage] Full availability array:', teacherData.availability)
                              console.log('[BookingPage] Day schedule for', dayLabel, ':', daySchedule)
                              console.log('[BookingPage] Day schedule details:', daySchedule.map((status, idx) => ({
                                time: availabilityTimeSlots[idx],
                                status,
                                idx
                              })))
                              console.log('[BookingPage] Booked slots set size:', bookedSlotsSet.size)
                              console.log('[BookingPage] Booked slots set:', Array.from(bookedSlotsSet))
                            }
                            
                            // Get booked slots from availability schedule (primary source)
                            // This should already include booked slots from subscriptions if they were merged
                            const bookedSlotsFromSchedule = availabilityTimeSlots.filter(
                              (_slot, idx) => daySchedule[idx] === 'booked',
                            )
                            
                            // Get booked slots from subscriptions (secondary source - fallback)
                            const bookedSlotsFromSubscriptions = availabilityTimeSlots.filter(
                              (slot) => {
                                const key = `${availabilityDayIndex}_${slot}`
                                const isBooked = bookedSlotsSet.has(key)
                                if (availabilityDayIndex === 0 && isBooked) {
                                  console.log(`[BookingPage] Found booked slot from subscriptions: ${key}`)
                                }
                                return isBooked
                              },
                            )
                            
                            if (availabilityDayIndex === 0) {
                              console.log('[BookingPage] Booked slots from schedule:', bookedSlotsFromSchedule)
                              console.log('[BookingPage] Booked slots from subscriptions:', bookedSlotsFromSubscriptions)
                              console.log('[BookingPage] Day schedule statuses:', daySchedule.map((status, idx) => ({
                                time: availabilityTimeSlots[idx],
                                status,
                                idx
                              })))
                            }
                            
                            // Combine both sources and remove duplicates
                            const allBookedSlots = Array.from(new Set([
                              ...bookedSlotsFromSchedule,
                              ...bookedSlotsFromSubscriptions,
                            ]))
                            
                            if (availabilityDayIndex === 0) {
                              console.log('[BookingPage] All booked slots (combined):', allBookedSlots)
                            }
                            
                            // Available slots are those that are 'available' and not booked
                            // Priority: if marked as 'booked' in schedule, it's booked
                            // Otherwise, check subscriptions set
                            const availableSlots = availabilityTimeSlots.filter(
                              (slot) => {
                                const idx = availabilityTimeSlots.indexOf(slot)
                                const scheduleStatus = daySchedule[idx]
                                
                                // If explicitly marked as booked in schedule, it's booked
                                if (scheduleStatus === 'booked') {
                                  if (availabilityDayIndex === 0) {
                                    console.log(`[BookingPage] Slot ${slot} is marked as booked in schedule`)
                                  }
                                  return false
                                }
                                
                                // If marked as available, check if it's also in bookedSlotsSet
                                if (scheduleStatus === 'available') {
                                  const key = `${availabilityDayIndex}_${slot}`
                                  const isNotBooked = !bookedSlotsSet.has(key)
                                  
                                  if (availabilityDayIndex === 0 && !isNotBooked) {
                                    console.log(`[BookingPage] Slot ${slot} is available in schedule but booked in subscriptions (key: ${key})`)
                                  }
                                  
                                  return isNotBooked
                                }
                                
                                // If null or undefined, it's not available
                                return false
                              },
                            )
                            
                            if (availabilityDayIndex === 0) {
                              console.log('[BookingPage] Available slots:', availableSlots)
                              console.log('[BookingPage] ===== AVAILABILITY PROCESSING COMPLETED =====')
                            }
                            
                            const hasSlots = availableSlots.length > 0 || allBookedSlots.length > 0
                            return (
                              <div
                                key={dayLabel}
                                className="flex-1 min-w-[120px] flex flex-col gap-4"
                              >
                                <div className="text-center font-bold font-cairo p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-slate-100">
                                  {dayLabel}
                                </div>
                                <div className="space-y-2">
                                  {/* Show booked slots as disabled */}
                                  {allBookedSlots.map((slot) => (
                                    <button
                                      key={`booked-${slot}`}
                                      type="button"
                                      disabled={true}
                                      className="w-full py-2 px-3 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-400 dark:text-slate-500 opacity-60 cursor-not-allowed bg-slate-100 dark:bg-slate-800 line-through"
                                      title="محجوز"
                                    >
                                      {slot}
                                    </button>
                                  ))}
                                  {/* Show available slots */}
                                  {hasSlots ? (
                                    availableSlots.map((slot) => {
                                      const isSelected = selectedWeeklySlots.some(
                                        (s) =>
                                          s.dayIndex === availabilityDayIndex && s.time === slot,
                                      )
                                      const isDisabled = 
                                        !isSelected &&
                                        requiredWeeklySessions > 0 &&
                                        selectedWeeklySlots.length >= requiredWeeklySessions
                                      return (
                                        <button
                                          key={slot}
                                          type="button"
                                          disabled={isDisabled}
                                          onClick={() => {
                                            const alreadySelected = selectedWeeklySlots.some(
                                              (s) =>
                                                s.dayIndex === availabilityDayIndex &&
                                                s.time === slot,
                                            )

                                            if (alreadySelected) {
                                              // إلغاء اختيار هذا الموعد
                                              setSelectedWeeklySlots((prev) =>
                                                prev.filter(
                                                  (s) =>
                                                    !(
                                                      s.dayIndex === availabilityDayIndex &&
                                                      s.time === slot
                                                    ),
                                                ),
                                              )
                                              // في حالة كان هذا هو الموعد الوحيد، نفرغ عرض الوقت المختار
                                              if (
                                                selectedWeeklySlots.length === 1 &&
                                                selectedWeeklySlots[0].dayIndex ===
                                                  availabilityDayIndex &&
                                                selectedWeeklySlots[0].time === slot
                                              ) {
                                                setSelectedTime('')
                                              }
                                              return
                                            }

                                            setSelectedWeeklySlots((prev) => [
                                              ...prev,
                                              { dayIndex: availabilityDayIndex, time: slot },
                                            ])

                                            const nextDate = getNextDateForAvailabilityDay(
                                              availabilityDayIndex,
                                            )
                                            setSelectedDate(nextDate)
                                            setSelectedTime(slot)
                                          }}
                                          className={`w-full py-2 px-3 border rounded-lg text-sm transition-colors ${
                                            isSelected
                                              ? 'border-primary bg-primary text-white'
                                              : isDisabled
                                              ? 'border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 opacity-50 cursor-not-allowed bg-slate-50 dark:bg-slate-800'
                                              : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-primary'
                                          }`}
                                        >
                                          {slot}
                                        </button>
                                      )
                                    })
                                  ) : (
                                    <></>
                                  )}
                                </div>
                              </div>
                            )
                          },
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar Summary Section */}
              <aside className="lg:col-span-4">
                <div className="sticky top-24 space-y-6">
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-md">
                    <h3 className="text-xl font-bold font-cairo mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                      ملخص الاشتراك
                    </h3>
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1 uppercase tracking-wider">
                            الباقة المختارة
                          </label>
                          <p className="font-bold text-sm">
                            {selectedPlan
                              ? `${plans.find((p) => p.id === selectedPlan)?.sessionsPerMonth} حصص شهرياً`
                              : 'لم يتم اختيار باقة'}
                          </p>
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1 uppercase tracking-wider">
                            مدة الحصة
                          </label>
                          <p className="font-bold text-sm">{duration} دقيقة</p>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-2 uppercase tracking-wider">
                          موعد الحجز
                        </label>
                        <div className="space-y-2">
                          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                            <span className="material-symbols-outlined text-primary">
                              calendar_today
                            </span>
                            <div className="flex-1">
                            <p className="text-sm font-bold">{formatDate(selectedDate)}</p>
                              <p className="text-xs text-slate-500">
                                {weeklySessionsCount > 0
                                  ? `تم اختيار ${weeklySessionsCount} من ${requiredWeeklySessions || weeklySessionsCount} مواعيد أسبوعية`
                                  : 'لم يتم اختيار مواعيد بعد'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-slate-600 dark:text-slate-400">سعر الحصة</span>
                          <span className="font-medium">
                            {totalCost.toFixed(2)}
                            {currency}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mb-6">
                          <span className="text-slate-600 dark:text-slate-400 font-cairo">
                            الإجمالي شهرياً
                          </span>
                          <span className="text-2xl font-bold text-primary font-body">
                            {selectedPlanConfig ? getPlanMonthlyPrice(selectedPlanConfig).toFixed(2) : totalCost.toFixed(2)}
                            {currency}
                          </span>
                        </div>
                        <div className="bg-primary/5 p-3 rounded-lg flex items-start gap-3 mb-6">
                          <span className="material-symbols-outlined text-primary text-sm mt-0.5">
                            verified_user
                          </span>
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                            سيتم تجديد الاشتراك تلقائياً كل شهر. يمكنك الإلغاء في أي وقت من إعدادات حسابك.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleConfirmBooking}
                          disabled={!hasValidWeeklySelection || !selectedPlan}
                          className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all font-cairo text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          تأكيد الاشتراك
                          <span className="material-symbols-outlined">arrow_back</span>
                        </button>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="w-full text-center text-sm font-bold text-slate-500 hover:text-primary transition-colors py-2 font-cairo"
                  >
                    العودة لاختيار الباقة
                  </button>
                </div>
              </aside>
            </div>
          </div>
        </main>
      )}
    </>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTeacherDetail } from '../../../features/teachers/hooks/useTeacherDetail'
import { getTeacherDisplayName, getTeacherTitle, getTeacherImageUrl } from '../../../shared/utils/teacher'
import { getCurrencySymbol } from '../../../shared/utils/currency'
import { SubscriptionService } from '../../../services/subscriptionService'
import { useRequireAuth } from '../../../hooks/useRequireAuth'
import { useRequireProfileComplete } from '../../../hooks/useRequireProfileComplete'
import { useAppStore } from '../../../store/useAppStore'

type PlanId = 'starter' | 'premium' | 'elite'

type WeeklySlot = {
  dayIndex: number
  time: string
}

export const availabilityTimeSlots = [
  '٠٨:٠٠ ص', '٠٩:٠٠ ص', '١٠:٠٠ ص', '١١:٠٠ ص',
  '١٢:٠٠ م', '٠١:٠٠ م', '٠٢:٠٠ م', '٠٣:٠٠ م',
  '٠٤:٠٠ م', '٠٥:٠٠ م', '٠٦:٠٠ م', '٠٧:٠٠ م',
]

export function useBookingFlow() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: teacherData, loading, error } = useTeacherDetail(id)
  const { user, userProfile } = useRequireAuth()
  useRequireProfileComplete()
  const addToast = useAppStore((state) => state.addToast)

  const [currentStep, setCurrentStep] = useState<1 | 2>(1)
  const [selectedPlan, setSelectedPlan] = useState<PlanId | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [duration, setDuration] = useState<number>(30)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedWeeklySlots, setSelectedWeeklySlots] = useState<WeeklySlot[]>([])
  const [bookedSlotsSet, setBookedSlotsSet] = useState<Set<string>>(new Set())

  const teacherName = teacherData ? getTeacherDisplayName(teacherData.profile, teacherData.application) : ''
  const teacherTitle = teacherData ? getTeacherTitle(teacherData.application) : ''
  const profileImage = teacherData ? getTeacherImageUrl(teacherData.profile) : '/no-image.png'
  const hourlyRate = teacherData?.application.hourlyRate || 0
  const currency = teacherData ? getCurrencySymbol(teacherData.application.currency) : 'ر.س'
  const rating = teacherData?.rating || 0
  const reviewsCount = teacherData?.reviewsCount || 0

  useEffect(() => {
    const fetchBookedSlots = async () => {
      if (!teacherData?.application?.userId && !id) {
        return
      }

      try {
        const teacherId = teacherData?.application?.userId || id || ''
        const subscriptionService = new SubscriptionService()
        const booked = await subscriptionService.getBookedSlotsForTeacher(teacherId)
        setBookedSlotsSet(booked)
      } catch (error) {
        console.error('Error fetching booked slots for booking page:', error)
        addToast('حدث خطأ في تحميل المواعيد المتاحة. سيتم عرض الأوقات المتاحة فقط بدون مراعاة الحجوزات السابقة.', 'error')
      }
    }

    if (teacherData) {
      void fetchBookedSlots()
    }
  }, [teacherData, id])

  const plans = [
    {
      id: 'starter' as PlanId,
      label: 'باقة الانطلاق',
      sessionsPerMonth: 8,
      weeklyFrequency: 'مرتين أسبوعياً',
      durationMinutes: 60,
    },
    {
      id: 'premium' as PlanId,
      label: 'باقة التميز',
      sessionsPerMonth: 12,
      weeklyFrequency: '3 مرات أسبوعياً',
      durationMinutes: 60,
      badge: 'الاكثر شيوعاً',
    },
    {
      id: 'elite' as PlanId,
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
    setDuration(60)
    setSelectedWeeklySlots([])
    setSelectedTime('')
    setCurrentStep(2)
  }

  const totalCost = (hourlyRate * duration) / 60

  const getAvailabilityDayIndex = (date: Date): number => {
    const jsDay = date.getDay()
    const map: { [key: number]: number } = {
      0: 1,
      1: 2,
      2: 3,
      3: 4,
      4: 5,
      5: 6,
      6: 0,
    }
    return map[jsDay] ?? 0
  }

  const getJsDayFromAvailabilityIndex = (availabilityIndex: number): number => {
    const map: { [key: number]: number } = {
      0: 6,
      1: 0,
      2: 1,
      3: 2,
      4: 3,
      5: 4,
      6: 5,
    }
    return map[availabilityIndex] ?? 0
  }

  const getNextDateForAvailabilityDay = (availabilityDayIndex: number): Date => {
    const today = new Date()
    const jsTargetDay = getJsDayFromAvailabilityIndex(availabilityDayIndex)
    const result = new Date(today)
    let addDays = (jsTargetDay - today.getDay() + 7) % 7
    if (addDays === 0) addDays = 7
    result.setDate(today.getDate() + addDays)
    return result
  }

  const formatDate = (date: Date): string => {
    const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
    const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
  }

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

  const getCalendarDays = (): (Date | null)[] => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days: (Date | null)[] = []

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

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
    navigate(`/teachers/${id}`)
  }

  const calculateAvailableSlots = (): number => {
    if (!teacherData?.availability || teacherData.availability.length === 0) {
      return 0
    }

    let availableCount = 0
    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
      const daySchedule = teacherData.availability[dayIndex] || []
      for (let timeIndex = 0; timeIndex < 12; timeIndex++) {
        const slotStatus = daySchedule[timeIndex]
        if (slotStatus === 'available') {
          const slotTime = availabilityTimeSlots[timeIndex]
          const key = `${dayIndex}_${slotTime}`
          if (!bookedSlotsSet.has(key)) {
            availableCount++
          }
        }
      }
    }
    return availableCount
  }

  const totalAvailableSlots = calculateAvailableSlots()
  const availableWeeklySessions = totalAvailableSlots

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

  return {
    state: {
      id,
      teacherData,
      loading,
      error,
      userProfile,
      currentStep,
      selectedPlan,
      selectedDate,
      selectedTime,
      duration,
      currentMonth,
      selectedWeeklySlots,
      bookedSlotsSet,
      plans,
      teacherName,
      teacherTitle,
      profileImage,
      hourlyRate,
      currency,
      rating,
      reviewsCount,
      totalCost,
      totalAvailableSlots,
      availablePlans,
      hasAvailableSlots,
      timeSlots,
      calendarDays,
      selectedPlanConfig,
      requiredWeeklySessions,
      weeklySessionsCount,
      hasValidWeeklySelection,
    },
    actions: {
      setCurrentStep,
      setSelectedDate,
      setSelectedTime,
      setDuration,
      setSelectedWeeklySlots,
      getPlanMonthlyPrice,
      handleSelectPlan,
      handleConfirmBooking,
      handlePrevMonth,
      handleNextMonth,
      getMonthName,
      handleBackFromStep,
      getNextDateForAvailabilityDay,
      isDateSelected,
      formatDate,
    },
  }
}


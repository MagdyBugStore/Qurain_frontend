'use client'

import React from "react";
import { Link } from 'react-router-dom'
import Header from '../../../components/layout/Header'
import { TeacherDetailHeader } from '../../../features/teachers/components/TeacherDetail/TeacherDetailHeader'
import { TeacherAvailability } from '../../../features/teachers/components/TeacherDetail/TeacherAvailability'
import { useBookingFlow, availabilityTimeSlots } from '../../../features/booking/hooks/useBookingFlow'

export default function BookingPage() {
  const {
    state,
    actions,
  } = useBookingFlow()

  const {
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
  } = state

  const {
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
  } = actions

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
                            
                            // Get booked slots from availability schedule (primary source)
                            // This should already include booked slots from subscriptions if they were merged
                            const bookedSlotsFromSchedule = availabilityTimeSlots.filter(
                              (_slot, idx) => daySchedule[idx] === 'booked',
                            )
                            
                            // Get booked slots from subscriptions (secondary source - fallback)
                            const bookedSlotsFromSubscriptions = availabilityTimeSlots.filter(
                              (slot) => {
                                const key = `${availabilityDayIndex}_${slot}`
                                return bookedSlotsSet.has(key)
                              },
                            )
                            
                            // Combine both sources and remove duplicates
                            const allBookedSlots = Array.from(new Set([
                              ...bookedSlotsFromSchedule,
                              ...bookedSlotsFromSubscriptions,
                            ]))
                            
                            // Available slots are those that are 'available' and not booked
                            // Priority: if marked as 'booked' in schedule, it's booked
                            // Otherwise, check subscriptions set
                            const availableSlots = availabilityTimeSlots.filter(
                              (slot) => {
                                const idx = availabilityTimeSlots.indexOf(slot)
                                const scheduleStatus = daySchedule[idx]
                                
                                // If explicitly marked as booked in schedule, it's booked
                                if (scheduleStatus === 'booked') {
                                  return false
                                }
                                
                                // If marked as available, check if it's also in bookedSlotsSet
                                if (scheduleStatus === 'available') {
                                  const key = `${availabilityDayIndex}_${slot}`
                                  return !bookedSlotsSet.has(key)
                                }
                                
                                // If null or undefined, it's not available
                                return false
                              },
                            )
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

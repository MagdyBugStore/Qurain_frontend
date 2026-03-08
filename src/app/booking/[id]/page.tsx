'use client'

import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from 'react-router-dom'
import Header from '../../../components/layout/Header'
import { useTeacherDetail } from '../../../features/teachers/hooks/useTeacherDetail'
import { getTeacherDisplayName, getTeacherTitle, getTeacherImageUrl } from '../../../shared/utils/teacher'
import { getCurrencySymbol } from '../../../shared/utils/currency'
import { useAuth } from '../../../contexts/AuthContext'

export default function BookingPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: teacherData, loading, error } = useTeacherDetail(id)
  const { userProfile } = useAuth()
  
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

  // Calculate total cost
  const totalCost = (hourlyRate * duration) / 60

  // Format date for display
  const formatDate = (date: Date): string => {
    const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
    const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
  }

  // Get available time slots for selected date
  const getAvailableTimeSlots = (): string[] => {
    // Mock time slots - should be fetched based on selected date and teacher availability
    const morningSlots = ['08:00 ص', '08:30 ص', '09:00 ص', '09:30 ص', '10:00 ص', '10:30 ص', '11:00 ص', '11:30 ص']
    const eveningSlots = ['02:00 م', '02:30 م', '04:00 م', '04:30 م', '05:00 م']
    return [...morningSlots, ...eveningSlots]
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
    if (!selectedTime) {
      alert('يرجى اختيار وقت للحصة')
      return
    }
    // Navigate to confirmation page
    navigate(`/booking/${id}/confirm`, {
      state: {
        date: selectedDate,
        time: selectedTime,
        duration,
        teacherData
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

  const timeSlots = getAvailableTimeSlots()
  const calendarDays = getCalendarDays()
  const isDateSelected = (date: Date | null): boolean => {
    if (!date) return false
    return date.toDateString() === selectedDate.toDateString()
  }

  return (
    <>
      <Header />
      <main className="flex-1 flex justify-center py-8 px-4 md:px-10 bg-bg-main">
        <div className="w-full max-w-[1200px] flex flex-col lg:flex-row gap-8">
          <div className="flex-1 flex flex-col gap-6">
            {/* Teacher Profile Header */}
            <div className="bg-bg-card rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-right">
                <div className="relative">
                  <div 
                    className="bg-center bg-no-repeat bg-cover rounded-full size-24 border-2 border-primary"
                    style={{ backgroundImage: `url("${profileImage}")` }}
                  />
                  <div className="absolute bottom-0 right-0 bg-green-500 size-4 rounded-full border-2 border-bg-card" />
                </div>
                <div className="flex flex-col justify-center flex-1">
                  <div className="flex flex-col sm:flex-row justify-between items-center mb-1">
                    <h1 className="text-text-dark text-2xl font-bold leading-tight">{teacherName}</h1>
                    <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full mt-2 sm:mt-0">
                      متاح الآن
                    </span>
                  </div>
                  <p className="text-text-light text-base font-normal mb-2">{teacherTitle}</p>
                  <div className="flex items-center justify-center sm:justify-start gap-4 text-sm text-text-light">
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-primary text-[18px] filled">star</span>
                      <span className="text-text-dark font-bold">{rating.toFixed(1)}</span>
                      <span>({reviewsCount} تقييم)</span>
                    </div>
                    <div className="w-px h-4 bg-gray-200" />
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-text-light text-[18px]">translate</span>
                      <span>العربية, English</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Calendar and Time Selection */}
            <div className="bg-bg-card border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col lg:flex-row">
              {/* Calendar Section */}
              <div className="p-6 lg:w-[45%] border-b lg:border-b-0 lg:border-l border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <button
                    onClick={handlePrevMonth}
                    className="p-2 hover:bg-gray-50 rounded-full text-text-dark transition-colors"
                  >
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                  <h3 className="text-text-dark text-lg font-bold">{getMonthName()}</h3>
                  <button
                    onClick={handleNextMonth}
                    className="p-2 hover:bg-gray-50 rounded-full text-text-dark transition-colors"
                  >
                    <span className="material-symbols-outlined">chevron_left</span>
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-y-4 mb-2">
                  {['سبت', 'أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة'].map((day) => (
                    <span key={day} className="text-text-light text-xs font-bold text-center">{day}</span>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {calendarDays.map((date, index) => {
                    if (!date) {
                      return <span key={index} className="h-10" />
                    }
                    const isSelected = isDateSelected(date)
                    const isToday = date.toDateString() === new Date().toDateString()
                    const isPast = date < new Date() && !isToday
                    
                    return (
                      <button
                        key={index}
                        onClick={() => !isPast && setSelectedDate(date)}
                        disabled={isPast}
                        className={`size-10 rounded-full flex items-center justify-center text-sm transition-colors ${
                          isSelected
                            ? 'bg-primary text-[#181611] font-bold shadow-md'
                            : isPast
                            ? 'text-text-light opacity-50 cursor-not-allowed'
                            : 'text-text-dark hover:bg-gray-50 border border-gray-200'
                        }`}
                      >
                        {date.getDate()}
                      </button>
                    )
                  })}
                </div>
                <div className="mt-6 flex items-center justify-center gap-6 text-xs text-text-light">
                  <div className="flex items-center gap-2">
                    <span className="size-3 rounded-full bg-primary" />
                    <span>محدد</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="size-3 rounded-full border border-gray-200 bg-transparent" />
                    <span>متاح</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="size-3 rounded-full bg-transparent opacity-50 text-text-light">•</span>
                    <span>محجوز</span>
                  </div>
                </div>
              </div>

              {/* Time Selection Section */}
              <div className="p-6 flex-1 flex flex-col">
                <div className="mb-8">
                  <label className="block text-text-light text-sm font-medium mb-3">مدة الدرس</label>
                  <div className="flex bg-gray-50 p-1 rounded-lg w-full max-w-md border border-gray-200">
                    <label className="flex-1 cursor-pointer">
                      <input
                        className="peer sr-only"
                        name="duration"
                        type="radio"
                        value="60"
                        checked={duration === 60}
                        onChange={() => setDuration(60)}
                      />
                      <div className="text-center py-2 rounded-md text-sm font-medium text-text-light peer-checked:bg-primary peer-checked:text-[#181611] peer-checked:font-bold peer-checked:shadow-md transition-all">
                        60 دقيقة
                      </div>
                    </label>
                    <label className="flex-1 cursor-pointer">
                      <input
                        className="peer sr-only"
                        name="duration"
                        type="radio"
                        value="45"
                        checked={duration === 45}
                        onChange={() => setDuration(45)}
                      />
                      <div className="text-center py-2 rounded-md text-sm font-medium text-text-light peer-checked:bg-primary peer-checked:text-[#181611] peer-checked:font-bold peer-checked:shadow-md transition-all">
                        45 دقيقة
                      </div>
                    </label>
                    <label className="flex-1 cursor-pointer">
                      <input
                        className="peer sr-only"
                        name="duration"
                        type="radio"
                        value="30"
                        checked={duration === 30}
                        onChange={() => setDuration(30)}
                      />
                      <div className="text-center py-2 rounded-md text-sm font-medium text-text-light peer-checked:bg-primary peer-checked:text-[#181611] peer-checked:font-bold peer-checked:shadow-md transition-all">
                        30 دقيقة
                      </div>
                    </label>
                  </div>
                </div>
                <h3 className="text-text-dark text-lg font-bold mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">schedule</span>
                  المواعيد المتاحة - {formatDate(selectedDate)}
                </h3>
                <div className="space-y-6 overflow-y-auto max-h-[400px] pr-2">
                  <div>
                    <h4 className="text-text-light text-xs font-bold uppercase tracking-wider mb-3">صباحاً</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {timeSlots.filter(slot => slot.includes('ص')).map((slot) => (
                        <button
                          key={slot}
                          onClick={() => setSelectedTime(slot)}
                          className={`py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                            selectedTime === slot
                              ? 'bg-primary text-[#181611] font-bold shadow-md ring-2 ring-primary ring-offset-2 ring-offset-white'
                              : 'border-gray-200 bg-transparent text-text-dark hover:border-primary hover:text-primary'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-text-light text-xs font-bold uppercase tracking-wider mb-3">مساءً</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {timeSlots.filter(slot => slot.includes('م')).map((slot) => (
                        <button
                          key={slot}
                          onClick={() => setSelectedTime(slot)}
                          className={`py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                            selectedTime === slot
                              ? 'bg-primary text-[#181611] font-bold shadow-md ring-2 ring-primary ring-offset-2 ring-offset-white'
                              : 'border-gray-200 bg-transparent text-text-dark hover:border-primary hover:text-primary'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Summary Sidebar */}
          <div className="lg:w-[320px] shrink-0">
            <div className="sticky top-24">
              <div className="bg-bg-card border border-gray-200 rounded-xl p-6 shadow-md flex flex-col gap-6">
                <h3 className="text-text-dark text-lg font-bold pb-4 border-b border-gray-200">ملخص الحجز</h3>
                <div className="flex flex-col gap-5">
                  <div className="flex items-start gap-3">
                    <div className="bg-gray-50 p-2 rounded-lg text-primary">
                      <span className="material-symbols-outlined">calendar_month</span>
                    </div>
                    <div>
                      <p className="text-text-light text-xs mb-0.5">التاريخ</p>
                      <p className="text-text-dark font-bold text-sm">{formatDate(selectedDate)}</p>
                    </div>
                  </div>
                  {selectedTime && (
                    <div className="flex items-center gap-3">
                      <div className="bg-gray-50 p-2 rounded-lg text-primary">
                        <span className="material-symbols-outlined">schedule</span>
                      </div>
                      <div>
                        <p className="text-text-light text-xs mb-0.5">الوقت</p>
                        <p className="text-text-dark font-bold text-sm leading-tight">{selectedTime}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <div className="bg-gray-50 p-2 rounded-lg text-primary">
                      <span className="material-symbols-outlined">video_camera_front</span>
                    </div>
                    <div>
                      <p className="text-text-light text-xs mb-0.5">نوع الجلسة</p>
                      <p className="text-text-dark font-bold text-sm">تجويد - أونلاين</p>
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-200 mt-2">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-text-light text-sm">التكلفة الإجمالية</span>
                    <span className="text-text-dark text-xl font-bold">{totalCost.toFixed(2)}{currency}</span>
                  </div>
                  <button
                    onClick={handleConfirmBooking}
                    disabled={!selectedTime}
                    className="w-full bg-primary hover:bg-primary/90 text-[#181611] font-bold py-3 px-4 rounded-xl transition-all transform active:scale-[0.98] shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>تأكيد الحجز</span>
                    <span className="material-symbols-outlined text-[20px]">check_circle</span>
                  </button>
                  <p className="text-center text-text-light text-xs mt-3">
                    يمكنك إلغاء الحجز مجاناً قبل 24 ساعة
                  </p>
                </div>
              </div>
              <div className="mt-6 bg-gray-50/50 border border-gray-200 border-dashed rounded-xl p-4 flex gap-3">
                <span className="material-symbols-outlined text-text-light">headset_mic</span>
                <div>
                  <p className="text-text-dark text-sm font-bold">تحتاج مساعدة؟</p>
                  <p className="text-text-light text-xs mt-1">
                    تواصل مع فريق الدعم الفني للمساعدة في حجز موعدك.
                  </p>
                  <a className="text-primary text-xs font-bold mt-2 inline-block hover:underline" href="#">
                    تحدث معنا
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

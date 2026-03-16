'use client'

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import Header from '../../components/layout/Header'
import { useStudentProfile } from '../../hooks/useStudentProfile'
import { StudentService } from '../../services/studentService'
import { SubscriptionService, type StudentSubscription } from '../../services/subscriptionService'
import { formatArabicDate, formatArabicTime, getRelativeTime } from '../../shared/utils/date'
import { getCalendarDays, getArabicMonthName, isSameDay } from '../../shared/utils/calendar'
import type { StudentSession, MemorizationLog } from '../../shared/types/student.types'

type TabType = 'overview' | 'schedule' | 'memorization' | 'achievements'

export default function StudentProfilePage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const { user, userProfile } = useAuth()
  const [studentService] = useState(() => new StudentService())
  const [subscriptionService] = useState(() => new SubscriptionService())

  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })
  const [allSessions, setAllSessions] = useState<StudentSession[]>([])
  const [sessionsLoading, setSessionsLoading] = useState(false)
  const [activeSubscription, setActiveSubscription] = useState<StudentSubscription | null>(null)
  const [subscriptionLoading, setSubscriptionLoading] = useState(false)

  // Memorization logs state
  const [allMemorizationLogs, setAllMemorizationLogs] = useState<MemorizationLog[]>([])
  const [allLogsLoading, setAllLogsLoading] = useState(false)
  
  // Goals layout state (column or row) - auto based on card size
  const [goalsLayout, setGoalsLayout] = useState<'column' | 'row'>('column')
  const goalsContainerRef = useRef<HTMLDivElement>(null)

  // Fetch dynamic student data
  const {
    weeklyTasks,
    upcomingSession,
    memorizationLogs,
    activities,
    stats,
    loading,
    error,
    updateTaskStatus,
  } = useStudentProfile(user?.uid)

  // Fetch active subscription once user is available
  useEffect(() => {
    const fetchSubscription = async () => {
      if (!user?.uid) return
      try {
        setSubscriptionLoading(true)
        const sub = await subscriptionService.getActiveSubscriptionForStudent(user.uid)
        setActiveSubscription(sub)
      } catch (err) {
        console.error('Error fetching active subscription for student:', err)
      } finally {
        setSubscriptionLoading(false)
      }
    }

    fetchSubscription()
  }, [user?.uid, subscriptionService])

  // Fetch all sessions when schedule tab is active
  useEffect(() => {
    if (activeTab === 'schedule' && user?.uid) {
      setSessionsLoading(true)
      studentService.getSessions(user.uid)
        .then(sessions => {
          setAllSessions(sessions)
        })
        .catch(err => {
          console.error('Error fetching sessions:', err)
        })
        .finally(() => {
          setSessionsLoading(false)
        })
    }
  }, [activeTab, user?.uid, studentService])

  // Fetch all memorization logs when memorization tab is active
  useEffect(() => {
    if (activeTab === 'memorization' && user?.uid) {
      setAllLogsLoading(true)
      studentService.getMemorizationLogs(user.uid)
        .then(logs => {
          setAllMemorizationLogs(logs)
        })
        .catch(err => {
          console.error('Error fetching memorization logs:', err)
        })
        .finally(() => {
          setAllLogsLoading(false)
        })
    }
  }, [activeTab, user?.uid, studentService])

  // Calendar calculations
  const calendarDays = useMemo(() => {
    return getCalendarDays(currentMonth.getFullYear(), currentMonth.getMonth())
  }, [currentMonth])

  // Get sessions for a specific date
  const getSessionsForDate = (date: Date): StudentSession[] => {
    return allSessions.filter(session => {
      const sessionDate = new Date(session.scheduledDate)
      return isSameDay(sessionDate, date)
    })
  }

  // Get session type label
  const getSessionTypeLabel = (type?: string): string => {
    const labels: Record<string, string> = {
      memorization: 'حفظ',
      recitation: 'تلاوة',
      review: 'مراجعة',
      test: 'اختبار',
    }
    return labels[type || 'memorization'] || 'حفظ'
  }

  // Navigate months (from start of current month until end of the year فقط)
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const now = new Date()
      const minMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const maxMonth = new Date(now.getFullYear(), 11, 1) // ديسمبر من نفس السنة

      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }

      if (newDate < minMonth || newDate > maxMonth) {
        return prev
      }
      return newDate
    })
  }

  // Get month buttons from الشهر الحالي إلى نهاية السنة
  const monthButtons = useMemo(() => {
    const now = new Date()
    const startMonthIndex = now.getMonth()
    const year = now.getFullYear()

    const buttons: { date: Date; label: string; isActive?: boolean }[] = []

    for (let month = startMonthIndex; month < 12; month++) {
      const date = new Date(year, month, 1)
      buttons.push({
        date,
        label: getArabicMonthName(month),
        isActive:
          date.getFullYear() === currentMonth.getFullYear() &&
          date.getMonth() === currentMonth.getMonth(),
      })
    }

    return buttons
  }, [currentMonth])

  // Calculate monthly stats for current month
  const monthlyStats = useMemo(() => {
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    monthEnd.setHours(23, 59, 59, 999)

    const monthSessions = allSessions.filter(session => {
      const sessionDate = new Date(session.scheduledDate)
      return sessionDate >= monthStart && sessionDate <= monthEnd
    })

    const completedSessions = monthSessions.filter(s => s.status === 'completed').length
    const pendingSessions = monthSessions.filter(s => s.status === 'scheduled').length

    return {
      completed: completedSessions,
      pending: pendingSessions,
    }
  }, [allSessions])

  // Auto-detect goals layout based on card width
  useEffect(() => {
    const container = goalsContainerRef.current
    if (!container) return

    const updateLayout = () => {
      const width = container.offsetWidth
      const height = container.offsetHeight
      
      setGoalsLayout(width < 300 ? 'column' : 'row')
    }

    // Initial check
    updateLayout()

    // Watch for resize
    const resizeObserver = new ResizeObserver(updateLayout)
    resizeObserver.observe(container)

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  // Get student data from userProfile
  const studentName = userProfile?.displayName ||
    `${userProfile?.firstName || ''} ${userProfile?.lastName || ''}`.trim() ||
    user?.displayName ||
    'الطالب'

  // Map internal IDs from onboarding steps to human‑readable Arabic labels
  const levelLabels: Record<string, string> = {
    beginner: 'مبتدئ',
    intermediate: 'متوسط',
    advanced: 'متقدم',
  }

  const ageGroupLabels: Record<string, string> = {
    child: 'طفل (5-12 سنة)',
    youth: 'ناشئ (13-18 سنة)',
    adult: 'بالغ (18+ سنة)',
  }

  const learningGoalLabels: Record<string, string> = {
    memorization: 'حفظ',
    ijaza: 'إجازة',
    recitation: 'تصحيح التلاوة',
    understanding: 'فهم المعاني',
  }

  const mainGoalLabels: Record<string, string> = {
    memorization: 'حفظ القرآن الكريم',
    contemplation: 'تدبر القرآن',
    recitation: 'تلاوة القرآن',
  }

  const studentLevel =
    (userProfile?.level && levelLabels[userProfile.level]) || 'غير محدد'
  const studentPhoto = userProfile?.photoURL || user?.photoURL || ''

  const ageGroup =
    (userProfile?.ageGroup && ageGroupLabels[userProfile.ageGroup]) || 'غير محدد'

  const selectedGoals =
    (userProfile?.goals || [])
      .map((g: string) => mainGoalLabels[g] || null)
      .filter(Boolean) as string[]

  const selectedLearningGoals =
    (userProfile?.learningGoal || [])
      .map((g: string) => learningGoalLabels[g] || null)
      .filter(Boolean) as string[]

  const tabs = [
    { id: 'overview' as TabType, label: 'نظرة عامة' },
    { id: 'schedule' as TabType, label: 'جدول الحصص' },
    { id: 'memorization' as TabType, label: 'سجل الحفظ' },
  ]

  const navItems = [
    { id: 'overview', icon: 'dashboard', label: 'نظرة عامة' },
    { id: 'schedule', icon: 'calendar_month', label: 'جدول الحصص' },
    { id: 'memorization', icon: 'menu_book', label: 'سجل الحفظ' },
  ]

  // Helper function to get task status display
  const getTaskStatusDisplay = (status: string) => {
    if (status === 'completed') return 'منتهي';
    if (status === 'in_progress') return 'قيد التنفيذ';
    if (status === 'pending') return 'قادم';
    return 'قادم';
  }

  // Helper function to check if task is completed
  const isTaskCompleted = (status: string) => {
    return status === 'completed';
  }

  return (
    <>
      <Header />
      <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 antialiased">
        <main className="flex-1 max-w-[1400px] mx-auto w-full p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar: Profile Info - Fixed Layout */}
          <aside className="lg:col-span-3 space-y-6">
            {/* Profile Card - Always Visible - Improved UI/UX */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
              {/* Profile Header */}
              <div className="flex flex-col items-center text-center mb-6">
                <div className="relative group mb-4">
                  <div className="size-24 rounded-full border-2 border-primary/30 p-0.5">
                    {studentPhoto ? (
                      <img
                        alt="صورة المستخدم"
                        className="w-full h-full rounded-full object-cover"
                        src={studentPhoto}
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                        <span className="material-symbols-outlined text-5xl text-primary/60">person</span>
                      </div>
                    )}
                  </div>
                  <button className="absolute bottom-0 left-0 size-8 p-4 bg-primary text-white rounded-full shadow-md border-2 border-white dark:border-slate-900 hover:scale-110 transition-transform flex items-center justify-center">
                    <span className="material-symbols-outlined text-base">edit</span>
                  </button>
                </div>

                {/* Student Name - Larger and Prominent */}
                <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">
                  {studentName}
                </h2>
                <div className="flex flex-wrap gap-2 mb-2">
                  <span className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold">
                    {ageGroup}
                  </span>
                </div>
                {/* Level Badge */}
                <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-bold mb-4">
                  {studentLevel}
                </span>
              </div>
              
              {/* Goals Section - Grid Layout */}
              {(selectedGoals.length > 0 || selectedLearningGoals.length > 0) && (
                <div 
                  ref={goalsContainerRef}
                  className="mb-6 pb-6 border-b border-slate-100 dark:border-slate-800"
                >
                  <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4">الأهداف</h3>
                  
                  <div className={`grid gap-4 ${
                    goalsLayout === 'column' 
                      ? 'grid-cols-1' 
                      : 'grid-cols-1 sm:grid-cols-2'
                  }`}>
                    {/* Main Goals with Tags */}
                    {selectedGoals.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-3">
                          <span className="material-symbols-outlined text-lg text-primary">flag</span>
                          <span className="font-medium">الأهداف الرئيسية</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {selectedGoals.map((goal, index) => (
                            <span
                              key={index}
                              className="px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-xs font-semibold border border-amber-200 dark:border-amber-800"
                            >
                              {goal}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Learning Goals with Tags */}
                    {selectedLearningGoals.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-3">
                          <span className="material-symbols-outlined text-lg text-primary">school</span>
                          <span className="font-medium">الهدف التعليمي</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {selectedLearningGoals.map((goal, index) => (
                            <span
                              key={index}
                              className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs font-semibold border border-blue-200 dark:border-blue-800"
                            >
                              {goal}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Stats & Subscription */}
              <div className="grid grid-cols-1 gap-4">
                {/* Total Sessions */}
                <div className="flex flex-col items-center p-4 bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                    <span className="material-symbols-outlined text-primary text-xl">event</span>
                  </div>
                  <span className="text-3xl font-black text-primary mb-1">
                    {stats?.totalSessions ?? 0}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium text-center">
                    إجمالي الحصص
                  </span>
                </div>

                {/* Active Subscription */}
                <div className="p-4 bg-gradient-to-br from-amber-50 to-amber-100/60 dark:from-[#3b3320] dark:to-[#1f1b13] rounded-xl border border-amber-200 dark:border-amber-700">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-amber-500 text-xl">workspace_premium</span>
                      <h3 className="text-sm font-bold text-slate-800 dark:text-amber-50">الاشتراك الحالي</h3>
                    </div>
                    {subscriptionLoading && (
                      <div className="size-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                    )}
                  </div>
                  {activeSubscription ? (
                    <div className="space-y-1 text-xs text-slate-700 dark:text-amber-100">
                      <p className="font-bold text-sm">
                        {activeSubscription.planLabel} • {activeSubscription.sessionsPerMonth} جلسة / شهر
                      </p>
                      <p>
                        عدد الحصص الأسبوعية: <span className="font-semibold">{activeSubscription.weeklyFrequency}</span>
                      </p>
                      <p>
                        المدة: <span className="font-semibold">{activeSubscription.durationMinutes} دقيقة</span>
                      </p>
                      <p>
                        السعر الشهري:{' '}
                        <span className="font-semibold">
                          {activeSubscription.monthlyPrice.toFixed(2)} {activeSubscription.currency}
                        </span>
                      </p>
                      {activeSubscription.nextRenewalDate && (
                        <p className="text-[11px] text-slate-600 dark:text-amber-200/80 mt-1">
                          التجديد القادم: {formatArabicDate(activeSubscription.nextRenewalDate)}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-600 dark:text-amber-100">
                      لا يوجد اشتراك نشط حالياً. يمكنك حجز باقة اشتراك من صفحة المعلمين.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Navigation - Mobile Only */}
            <nav className="lg:hidden bg-white dark:bg-slate-900 rounded-xl p-2 shadow-sm border border-slate-100 dark:border-slate-800 space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as TabType)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === item.id
                      ? 'bg-primary text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                >
                  <span className="material-symbols-outlined">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>

            {/* Schedule Tab Specific Content */}
            {activeTab === 'schedule' && (
              <>
                {/* Next Session Highlight */}
                {upcomingSession ? (
                  <div className="bg-white dark:bg-slate-800/50 p-6 rounded-2xl border border-primary/20 shadow-sm relative overflow-hidden">
                    <div className="absolute -top-4 -left-4 size-20 bg-primary/10 rounded-full blur-2xl"></div>
                    <h3 className="text-slate-500 dark:text-slate-400 text-sm font-bold mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-sm">event_upcoming</span>
                      الجلسة القادمة
                    </h3>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="size-14 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden border-2 border-primary">
                        {upcomingSession.teacherPhoto ? (
                          <img
                            alt="صورة المعلم"
                            className="w-full h-full object-cover"
                            src={upcomingSession.teacherPhoto}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-200 dark:bg-slate-600">
                            <span className="material-symbols-outlined text-slate-400">person</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-lg">{upcomingSession.teacherName}</p>
                        <span className="text-xs bg-primary/20 text-slate-700 dark:text-slate-200 px-2 py-0.5 rounded">
                          {getSessionTypeLabel(upcomingSession.sessionType)}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-3 border-t border-slate-100 dark:border-slate-700 pt-4">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <span className="material-symbols-outlined text-lg">calendar_today</span>
                        <span className="text-sm">{formatArabicDate(upcomingSession.scheduledDate)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <span className="material-symbols-outlined text-lg">schedule</span>
                        <span className="text-sm">
                          {formatArabicTime(upcomingSession.scheduledDate)} ({upcomingSession.duration} دقيقة)
                        </span>
                      </div>
                    </div>
                    {upcomingSession.meetingLink ? (
                      <a
                        href={upcomingSession.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full mt-6 py-2 border border-primary text-primary font-bold rounded-lg hover:bg-primary hover:text-background-dark transition-all text-center block"
                      >
                        دخول الجلسة
                      </a>
                    ) : (
                      <></>
                    )}
                  </div>
                ) : (
                  <div className="bg-white dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 text-center">
                    <span className="material-symbols-outlined text-4xl text-slate-400 mb-2">event_busy</span>
                    <h3 className="text-slate-500 dark:text-slate-400 text-sm font-bold mb-2">لا توجد جلسة قادمة</h3>
                    <p className="text-xs text-slate-400">احجز حصة جديدة للبدء</p>
                  </div>
                )}

                {/* Progress Stats */}
                <div className="bg-white dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
                  <h3 className="font-bold mb-4">إحصائيات الشهر</h3>
                  {sessionsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-background-light dark:bg-background-dark rounded-xl">
                        <p className="text-2xl font-bold text-primary">{monthlyStats.completed}</p>
                        <p className="text-xs text-slate-500">حصة مكتملة</p>
                      </div>
                      <div className="p-3 bg-background-light dark:bg-background-dark rounded-xl">
                        <p className="text-2xl font-bold text-primary">{monthlyStats.pending}</p>
                        <p className="text-xs text-slate-500">قيد الانتظار</p>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </aside>

          {/* Main Content Area */}
          <div className="lg:col-span-9 space-y-8">
            {/* Navigation Tabs - Desktop Only */}
            <div className="hidden lg:flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-8 py-4 whitespace-nowrap transition-colors ${activeTab === tab.id
                      ? 'text-primary border-b-2 border-primary font-bold'
                      : 'text-slate-500 dark:text-slate-400 hover:text-primary'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Overview Content */}
            {activeTab === 'overview' && (
              <>
                {/* Top Row: Upcoming Session & Weekly Tasks */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                  {/* Upcoming Session Card */}
                  {upcomingSession ? (
                    <div className="bg-primary rounded-xl p-6 shadow-lg text-white flex flex-col overflow-hidden relative h-auto">
                      <div className="z-10">
                        <div className="flex items-center gap-2 mb-4 opacity-90">
                          <span className="material-symbols-outlined text-sm">schedule</span>
                          <span className="text-sm font-medium">الحصة القادمة</span>
                        </div>
                        <h4 className="text-xl font-bold mb-1">{upcomingSession.title}</h4>
                        <p className="opacity-80 text-sm">
                          {formatArabicDate(upcomingSession.scheduledDate)} • {formatArabicTime(upcomingSession.scheduledDate)}
                        </p>
                      </div>
                      <div className="mt-6 flex justify-between items-end z-10">
                        <div className="flex items-center gap-2">
                          {upcomingSession.teacherPhoto ? (
                            <div className="size-8 rounded-full border border-white/30 overflow-hidden">
                              <img
                                alt="صورة المعلم"
                                className="w-full h-full object-cover"
                                src={upcomingSession.teacherPhoto}
                              />
                            </div>
                          ) : (
                            <div className="size-8 rounded-full border border-white/30 bg-white/20 flex items-center justify-center">
                              <span className="material-symbols-outlined text-sm">person</span>
                            </div>
                          )}
                          <span className="text-sm font-medium">{upcomingSession.teacherName}</span>
                        </div>
                        {upcomingSession.meetingLink ? (
                          <a
                            href={upcomingSession.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-white text-primary px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors"
                          >
                            دخول الحلقة
                          </a>
                        ) : (
                          <button
                            onClick={() => navigate(`/technical-check/${upcomingSession.id}`)}
                            className="bg-white text-primary px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors"
                          >
                            الدخول للحصة
                          </button>
                        )}
                      </div>
                      {/* Decoration Pattern */}
                      <div className="absolute -right-8 -bottom-8 opacity-10">
                        <span className="material-symbols-outlined text-[120px]">mosque</span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-primary/10 rounded-xl p-6 shadow-sm border border-primary/20 flex flex-col items-center justify-center text-center min-h-[200px]">
                      <span className="material-symbols-outlined text-4xl text-primary mb-2">event_busy</span>
                      <p className="text-slate-600 dark:text-slate-400">لا توجد حصة قادمة</p>
                    </div>
                  )}

                  {/* Weekly Tasks Section */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-bold">المهام المطلوبة خلال الأسبوع</h4>

                    </div>

                    {loading ? (
                      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 p-8 flex items-center justify-center">
                        <div className="text-center">
                          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                          <p className="mt-4 text-slate-500 text-sm">جاري تحميل المهام...</p>
                        </div>
                      </div>
                    ) : weeklyTasks.length > 0 ? (
                      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 max-h-[400px] overflow-y-auto">
                        {weeklyTasks.map((task) => {
                          const isCompleted = isTaskCompleted(task.status);
                          return (
                            <div
                              key={task.id}
                              className={`p-4 flex items-center justify-between transition-colors ${isCompleted
                                  ? 'bg-green-50/50 dark:bg-green-900/10'
                                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                }`}
                            >
                              <div className="flex items-center gap-4 flex-1 min-w-0">
                                <div
                                  className={`size-10 rounded-lg flex items-center justify-center shrink-0 ${isCompleted
                                      ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                      : 'bg-primary/10 text-primary'
                                    }`}
                                >
                                  {isCompleted ? (
                                    <span className="material-symbols-outlined">check_circle</span>
                                  ) : (
                                    <span className="material-symbols-outlined">schedule</span>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <p className={`font-bold truncate ${isCompleted ? 'line-through text-slate-500' : ''}`}>
                                      {task.title}
                                    </p>
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium shrink-0 ${isCompleted
                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                        : 'bg-primary/20 text-primary'
                                      }`}>
                                      {getTaskStatusDisplay(task.status)}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                                    <span className="flex items-center gap-1">
                                      <span className="material-symbols-outlined text-sm">calendar_today</span>
                                      {formatArabicDate(task.dueDate)}
                                    </span>
                                    {task.teacherName && (
                                      <span className="flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm">person</span>
                                        {task.teacherName}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              {!isCompleted && (
                                <button
                                  onClick={() => updateTaskStatus(task.id, 'in_progress')}
                                  className="px-4 py-2 bg-primary text-background-dark text-xs font-bold rounded-lg hover:bg-primary/90 transition-colors shrink-0"
                                >
                                  ابدأ المهمة
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 p-8 text-center">
                        <span className="material-symbols-outlined text-4xl text-slate-400 mb-2">task_alt</span>
                        <p className="text-slate-500">لا توجد مهام هذا الأسبوع</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Log of Surahs (Completed) */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-bold">آخر الإنجازات في سجل الحفظ</h4>

                    </div>
                    {loading ? (
                      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 p-8 flex items-center justify-center">
                        <div className="text-center">
                          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                          <p className="mt-4 text-slate-500 text-sm">جاري تحميل سجل الحفظ...</p>
                        </div>
                      </div>
                    ) : memorizationLogs.length > 0 ? (
                      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
                        {memorizationLogs.map((log) => (
                          <div key={log.id} className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="size-10 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 flex items-center justify-center">
                                <span className="material-symbols-outlined">task_alt</span>
                              </div>
                              <div>
                                <p className="font-bold">{log.surah}</p>
                                <p className="text-xs text-slate-500">{log.description}</p>
                              </div>
                            </div>
                            <div className="text-left">
                              <p className="text-sm font-medium">{formatArabicDate(log.loggedDate)}</p>
                              {log.grade && (
                                <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500">
                                  {log.grade}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 p-8 text-center">
                        <span className="material-symbols-outlined text-4xl text-slate-400 mb-2">menu_book</span>
                        <p className="text-slate-500">لا توجد سجلات حفظ بعد</p>
                      </div>
                    )}
                  </div>
                  {/* Activity Feed */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-bold">النشاط الأخير</h4>
                    {loading ? (
                      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 p-8 flex items-center justify-center">
                        <div className="text-center">
                          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                          <p className="mt-4 text-slate-500 text-sm">جاري تحميل النشاطات...</p>
                        </div>
                      </div>
                    ) : activities.length > 0 ? (
                      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
                        <div className="relative space-y-6 before:absolute before:right-[15px] before:top-2 before:bottom-0 before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800">
                          {activities.map((activity) => (
                            <div key={activity.id} className="relative pr-8">
                              <div className="absolute right-0 top-1 size-8 rounded-full bg-primary/20 flex items-center justify-center border-4 border-white dark:border-slate-900">
                                <div className="size-2 rounded-full bg-primary"></div>
                              </div>
                              <p className="text-sm leading-relaxed font-bold">{activity.title}</p>
                              <p className="text-xs text-slate-500 mt-1">{activity.description}</p>
                              <p className="text-xs text-slate-400 mt-1">{getRelativeTime(activity.createdAt)}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 p-8 text-center">
                        <span className="material-symbols-outlined text-4xl text-slate-400 mb-2">history</span>
                        <p className="text-slate-500">لا توجد نشاطات حديثة</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Schedule Tab Content */}
            {activeTab === 'schedule' && (
              <>
                {/* Month Selection & Filter */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                  <div className="flex items-center bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <button
                      onClick={() => navigateMonth('prev')}
                      className="px-4 py-2 rounded-lg text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">chevron_right</span>
                    </button>
                    {monthButtons.map((month, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentMonth(month.date)}
                        className={`px-6 py-2 rounded-lg transition-colors ${month.isActive
                            ? 'bg-primary text-background-dark font-bold shadow-sm'
                            : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'
                          }`}
                      >
                        {month.label}
                      </button>
                    ))}
                    <button
                      onClick={() => navigateMonth('next')}
                      className="px-4 py-2 rounded-lg text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">chevron_left</span>
                    </button>
                  </div>
                  
                </div>

                {/* Calendar View */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                  {/* Week Header */}
                  <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="py-4 text-center font-bold text-sm text-slate-600 dark:text-slate-400 border-l border-slate-200 dark:border-slate-700">
                      الأحد
                    </div>
                    <div className="py-4 text-center font-bold text-sm text-slate-600 dark:text-slate-400 border-l border-slate-200 dark:border-slate-700">
                      الإثنين
                    </div>
                    <div className="py-4 text-center font-bold text-sm text-slate-600 dark:text-slate-400 border-l border-slate-200 dark:border-slate-700">
                      الثلاثاء
                    </div>
                    <div className="py-4 text-center font-bold text-sm text-slate-600 dark:text-slate-400 border-l border-slate-200 dark:border-slate-700">
                      الأربعاء
                    </div>
                    <div className="py-4 text-center font-bold text-sm text-slate-600 dark:text-slate-400 border-l border-slate-200 dark:border-slate-700">
                      الخميس
                    </div>
                    <div className="py-4 text-center font-bold text-sm text-slate-600 dark:text-slate-400 border-l border-slate-200 dark:border-slate-700">
                      الجمعة
                    </div>
                    <div className="py-4 text-center font-bold text-sm text-slate-600 dark:text-slate-400">
                      السبت
                    </div>
                  </div>

                  {/* Calendar Grid */}
                  {sessionsLoading ? (
                    <div className="p-8 flex items-center justify-center">
                      <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <p className="mt-4 text-slate-500 text-sm">جاري تحميل الحصص...</p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-7 auto-rows-[160px]">
                      {calendarDays.map((day, index) => {
                        const daySessions = getSessionsForDate(day.date)
                        const today = new Date()
                        today.setHours(0, 0, 0, 0)
                        const isToday = isSameDay(day.date, today)

                        return (
                          <div
                            key={index}
                            className={`p-1 border-b border-l border-slate-100 dark:border-slate-700 relative ${isToday ? 'bg-primary/5' : ''
                              } ${!day.isCurrentMonth ? 'opacity-40' : ''}`}
                          >
                            <span
                              className={`absolute top-2 right-2 text-xs ${isToday
                                  ? 'text-primary font-bold'
                                  : day.isCurrentMonth
                                    ? 'text-slate-400'
                                    : 'text-slate-300'
                                }`}
                            >
                              {day.dayOfMonth}
                            </span>
                            <div className="mt-6 space-y-1">
                              {daySessions.slice(0, 2).map((session) => {
                                const isCompleted = session.status === 'completed'
                                const isScheduled = session.status === 'scheduled'
                                const isTodaySession = isSameDay(new Date(session.scheduledDate), today)

                                return (
                                  <div
                                    key={session.id}
                                    className={`p-2 rounded-lg cursor-pointer transition-all ${isTodaySession
                                        ? 'bg-primary border-r-4 border-background-dark shadow-md'
                                        : isCompleted
                                          ? 'bg-slate-100 dark:bg-slate-700 border-r-4 border-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                                          : 'bg-primary/10 border-r-4 border-primary hover:bg-primary/20'
                                      }`}
                                  >
                                    <div className="flex items-center gap-2 mb-1">
                                      {session.teacherPhoto ? (
                                        <img
                                          className="size-6 rounded-full border border-primary/30"
                                          alt="صورة المعلم"
                                          src={session.teacherPhoto}
                                        />
                                      ) : (
                                        <div className="size-6 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center">
                                          <span className="material-symbols-outlined text-xs">person</span>
                                        </div>
                                      )}
                                      <p
                                        className={`text-[10px] font-bold truncate ${isTodaySession ? 'text-background-dark' : ''
                                          }`}
                                      >
                                        {session.teacherName}
                                      </p>
                                    </div>
                                    <p
                                      className={`text-[10px] ${isTodaySession
                                          ? 'text-background-dark/80 font-medium'
                                          : 'text-slate-600 dark:text-slate-300'
                                        }`}
                                    >
                                      {getSessionTypeLabel(session.sessionType)} - {formatArabicTime(session.scheduledDate)}
                                    </p>
                                  </div>
                                )
                              })}
                              {daySessions.length > 2 && (
                                <p className="text-[10px] text-slate-500 text-center mt-1">
                                  +{daySessions.length - 2} أكثر
                                </p>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Legend */}
                <div className="mt-4 flex gap-6 text-sm text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="size-3 bg-primary rounded-full"></span>
                    <span>حصة اليوم</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="size-3 bg-primary/20 rounded-full border border-primary"></span>
                    <span>حصص مجدولة</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="size-3 bg-slate-200 dark:bg-slate-600 rounded-full"></span>
                    <span>حصص سابقة</span>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'memorization' && (
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">سجل الحفظ</h3>
                    <p className="text-slate-500">جميع سجلات حفظك للقرآن الكريم</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-500">
                      إجمالي السجلات: <span className="font-bold text-primary">{allMemorizationLogs.length}</span>
                    </span>
                  </div>
                </div>

                {/* Memorization Logs List */}
                {allLogsLoading ? (
                  <div className="bg-white dark:bg-slate-900 rounded-xl p-8 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-center">
                    <div className="text-center">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      <p className="mt-4 text-slate-500 text-sm">جاري تحميل سجل الحفظ...</p>
                    </div>
                  </div>
                ) : allMemorizationLogs.length > 0 ? (
                  <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
                    {allMemorizationLogs.map((log) => (
                      <div key={log.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <div className="flex items-start gap-4">
                          <div className="size-12 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-2xl">menu_book</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-4 mb-2">
                              <div>
                                <h4 className="text-lg font-bold mb-1">{log.surah}</h4>
                                <p className="text-sm text-slate-600 dark:text-slate-400">{log.description}</p>
                              </div>
                              {log.grade && (
                                <span className="px-3 py-1 rounded-full text-xs bg-primary/20 text-primary font-medium shrink-0">
                                  {log.grade}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-3 flex-wrap">
                              <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">calendar_today</span>
                                {formatArabicDate(log.loggedDate)}
                              </span>
                              {log.juz && (
                                <span className="flex items-center gap-1">
                                  <span className="material-symbols-outlined text-sm">auto_stories</span>
                                  الجزء {log.juz}
                                </span>
                              )}
                              {log.fromAyah && log.toAyah && (
                                <span className="flex items-center gap-1">
                                  <span className="material-symbols-outlined text-sm">numbers</span>
                                  من آية {log.fromAyah} إلى آية {log.toAyah}
                                </span>
                              )}
                              {log.teacherName && (
                                <span className="flex items-center gap-1">
                                  <span className="material-symbols-outlined text-sm">person</span>
                                  {log.teacherName}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white dark:bg-slate-900 rounded-xl p-12 shadow-sm border border-slate-100 dark:border-slate-800 text-center">
                    <span className="material-symbols-outlined text-6xl text-slate-400 mb-4">menu_book</span>
                    <h4 className="text-lg font-bold mb-2">لا توجد سجلات حفظ</h4>
                    <p className="text-slate-500">ابدأ بحفظ القرآن الكريم وسيتم تسجيل تقدمك هنا</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'achievements' && (
              <div className="bg-white dark:bg-slate-900 rounded-xl p-8 shadow-sm border border-slate-100 dark:border-slate-800">
                <h3 className="text-xl font-bold mb-4">الإنجازات</h3>
                <p className="text-slate-500">سيتم إضافة محتوى الإنجازات هنا</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  )
}

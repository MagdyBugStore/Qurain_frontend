'use client'

import React, { useState } from "react";
import { useAuth } from '../../contexts/AuthContext'
import Header from '../../components/layout/Header'

type TabType = 'overview' | 'schedule' | 'memorization' | 'achievements'

export default function StudentProfilePage() {
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const { user, userProfile } = useAuth()

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

  const memorizationLogs = [
    {
      surah: 'سورة النحل',
      description: 'حفظ من آية ١ إلى آية ٤٠',
      date: '١٨ مايو ٢٠٢٤',
      grade: 'ممتاز',
    },
    {
      surah: 'سورة الحجر',
      description: 'مراجعة كامل السورة',
      date: '١٥ مايو ٢٠٢٤',
      grade: 'جيد جداً',
    },
    {
      surah: 'سورة إبراهيم',
      description: 'إتمام الجزء الثالث عشر',
      date: '١٠ مايو ٢٠٢٤',
      grade: 'ممتاز',
    },
  ]

  const activities = [
    {
      text: 'حجزت موعداً جديداً مع الشيخ عبدالله القحطاني.',
      boldText: 'حجزت',
      time: 'منذ ساعتين',
    },
    {
      text: 'أتممت اختبار التجويد بنجاح في المستوى المتقدم.',
      boldText: 'اختبار التجويد',
      time: 'أمس',
    },
    {
      text: 'حصلت على وسام "المثابر" لالتزامك لمدة ٣٠ يوماً.',
      boldText: '"المثابر"',
      time: 'قبل يومين',
    },
  ]

  // Weekly tasks data
  const weeklyTasks = [
    {
      id: 1,
      title: 'حفظ سورة الكهف من آية ١ إلى آية ٤٠',
      date: 'الأحد، ١٧ نوفمبر',
      status: 'completed',
      teacher: 'الشيخ عبدالله القحطاني',
    },
    {
      id: 2,
      title: 'مراجعة سورة الحجر كاملة',
      date: 'الإثنين، ١٨ نوفمبر',
      status: 'completed',
      teacher: 'الشيخ أحمد محمد',
    },
    {
      id: 3,
      title: 'تسميع سورة الإسراء من آية ١ إلى آية ٥٠',
      date: 'الأربعاء، ٢٠ نوفمبر',
      status: 'upcoming',
      teacher: 'الشيخ عبدالله القحطاني',
    },
    {
      id: 4,
      title: 'حفظ سورة مريم من آية ١ إلى آية ٣٠',
      date: 'الجمعة، ٢٢ نوفمبر',
      status: 'upcoming',
      teacher: 'أ. هدى خالد',
    },
    {
      id: 5,
      title: 'مراجعة الجزء الثالث عشر',
      date: 'السبت، ٢٣ نوفمبر',
      status: 'upcoming',
      teacher: 'الشيخ أحمد محمد',
    },
  ]

  // Removed achievements preview data per requirements

  return (
    <>
      <Header />
      <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 antialiased">
        <main className="flex-1 max-w-[1400px] mx-auto w-full p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar: Profile Info or Schedule Sidebar */}
          <aside className="lg:col-span-3 space-y-6">
            {activeTab === 'schedule' ? (
              <>
                {/* Book New Session CTA */}
                <button className="w-full py-4 bg-primary text-background-dark font-bold rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 hover:brightness-105 transition-all">
                  <span className="material-symbols-outlined">add_circle</span>
                  <span>حجز حصة جديدة</span>
                </button>

                {/* Next Session Highlight */}
                <div className="bg-white dark:bg-slate-800/50 p-6 rounded-2xl border border-primary/20 shadow-sm relative overflow-hidden">
                  <div className="absolute -top-4 -left-4 size-20 bg-primary/10 rounded-full blur-2xl"></div>
                  <h3 className="text-slate-500 dark:text-slate-400 text-sm font-bold mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-sm">event_upcoming</span>
                    الجلسة القادمة
                  </h3>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="size-14 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden border-2 border-primary">
                      <img
                        alt="صورة المعلم"
                        className="w-full h-full object-cover"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuD0H2QhKjCtwLk6Q3Wf8WYbXlxyFO26HtU6LcHw5kWhXDAq_QPyI1udZwVGGAF6eTuHtHUpusNLOY6habaPYG9P4y9R834rxlkqlbJB5RjtzkrsTAXogG5lczdTcBaaWlfjx87efFll5fu_RoyKZZyjWijWyuAr6CZPnEM8REoXXBoGEnTJB28_om5bxFxzSC8zf8ZaLE35JB7-dBK2G9V_ioikgmtybdwZ4Cjiu1RiVs58UrDWSyeaHAOiD0KrCpiSuiZQ6dWWa1Aa"
                      />
                    </div>
                    <div>
                      <p className="font-bold text-lg">الشيخ عبدالله عمر</p>
                      <span className="text-xs bg-primary/20 text-slate-700 dark:text-slate-200 px-2 py-0.5 rounded">
                        حفظ القرآن
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3 border-t border-slate-100 dark:border-slate-700 pt-4">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <span className="material-symbols-outlined text-lg">calendar_today</span>
                      <span className="text-sm">اليوم، 14 نوفمبر</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <span className="material-symbols-outlined text-lg">schedule</span>
                      <span className="text-sm">04:30 مساءً (45 دقيقة)</span>
                    </div>
                  </div>
                  <button className="w-full mt-6 py-2 border border-primary text-primary font-bold rounded-lg hover:bg-primary hover:text-background-dark transition-all">
                    دخول الجلسة
                  </button>
                </div>

                {/* Progress Stats */}
                <div className="bg-white dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
                  <h3 className="font-bold mb-4">إحصائيات الشهر</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-background-light dark:bg-background-dark rounded-xl">
                      <p className="text-2xl font-bold text-primary">12</p>
                      <p className="text-xs text-slate-500">حصة مكتملة</p>
                    </div>
                    <div className="p-3 bg-background-light dark:bg-background-dark rounded-xl">
                      <p className="text-2xl font-bold text-primary">4</p>
                      <p className="text-xs text-slate-500">قيد الانتظار</p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center">
                  <div className="relative group">
                    <div className="size-32 rounded-full border-4 border-primary/20 p-1 mb-4">
                      {studentPhoto ? (
                        <img
                          alt="صورة المستخدم الكبيرة"
                          className="w-full h-full rounded-full object-cover"
                          src={studentPhoto}
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                          <span className="material-symbols-outlined text-4xl text-slate-400">person</span>
                        </div>
                      )}
                    </div>
                    <button className="absolute bottom-4 left-0 bg-primary text-white p-2 rounded-full shadow-lg border-2 border-white dark:border-slate-900">
                      <span className="material-symbols-outlined text-sm">edit</span>
                    </button>
                  </div>
                  <h3 className="text-xl font-bold mb-1">{studentName}</h3>
                  <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-6">
                    {studentLevel}
                  </span>

                  {/* Extra real data from onboarding flow (بدون ميزانية) */}
                  <div className="w-full space-y-3 mb-4">
                    <div className="flex flex-wrap gap-2 justify-center text-xs">
                      <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        الفئة العمرية: <span className="font-bold">{ageGroup}</span>
                      </span>
                    </div>

                    {selectedGoals.length > 0 && (
                      <div className="text-xs text-slate-600 dark:text-slate-300">
                        <span className="font-bold">الأهداف الرئيسية: </span>
                        <span>{selectedGoals.join(' • ')}</span>
                      </div>
                    )}

                    {selectedLearningGoals.length > 0 && (
                      <div className="text-xs text-slate-600 dark:text-slate-300">
                        <span className="font-bold">الهدف التعليمي: </span>
                        <span>{selectedLearningGoals.join(' • ')}</span>
                      </div>
                    )}
                  </div>
                  <div className="w-full grid grid-cols-2 gap-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex flex-col items-center">
                      <span className="text-2xl font-bold text-primary">١٥٠</span>
                      <span className="text-xs text-slate-500">إجمالي الحصص</span>
                    </div>
                    <div className="flex flex-col items-center border-r border-slate-100 dark:border-slate-800">
                      <span className="text-2xl font-bold text-primary">١٨</span>
                      <span className="text-xs text-slate-500">أجزاء محفوظة</span>
                    </div>
                  </div>
                </div>
                <nav className="bg-white dark:bg-slate-900 rounded-xl p-2 shadow-sm border border-slate-100 dark:border-slate-800 space-y-1">
                  {navItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id as TabType)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                        activeTab === item.id
                          ? 'bg-primary text-white'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className="material-symbols-outlined">{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
                  ))}
                </nav>
              </>
            )}
          </aside>

          {/* Main Content Area */}
          <div className="lg:col-span-9 space-y-8">
            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-8 py-4 whitespace-nowrap transition-colors ${
                    activeTab === tab.id
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
                  <div className="bg-primary rounded-xl p-6 shadow-lg text-white flex flex-col overflow-hidden relative h-auto">
                    <div className="z-10">
                      <div className="flex items-center gap-2 mb-4 opacity-90">
                        <span className="material-symbols-outlined text-sm">schedule</span>
                        <span className="text-sm font-medium">الحصة القادمة</span>
                      </div>
                      <h4 className="text-xl font-bold mb-1">تسميع سورة الإسراء</h4>
                      <p className="opacity-80 text-sm">الأحد، ٢٢ مايو • ٠٦:٣٠ مساءً</p>
                    </div>
                    <div className="mt-6 flex justify-between items-end z-10">
                      <div className="flex items-center gap-2">
                        <div className="size-8 rounded-full border border-white/30 overflow-hidden">
                          <img
                            alt="صورة المعلم"
                            className="w-full h-full object-cover"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuATkUyF19AckE7-EAcEpTWbRp5BQ0QDZNDQTcP5IXl3SwoL-89c4tiTdoUn-9IGSenrFQScQT4lWpcUyRRnAkDF-6_Fx2S982e836ZjDcJGeTjNYQkXPgIfjL6-zeFPuUtEaWELB7cXJgFspyWWdg7i8WfUM8r0xiGqv1KCpwEOW4QF4dwXP5KzcJVYDwH_jRvtKe7zqBGMv5SH8aDAo1dk4ioSVPjNYTeeoJZeuboSlu-jQmO9SY2C560OiDtk4rRxVyYWuqXfIL3H"
                          />
                        </div>
                        <span className="text-sm font-medium">الشيخ عبدالله القحطاني</span>
                      </div>
                      <button className="bg-white text-primary px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors">
                        دخول الحلقة
                      </button>
                    </div>
                    {/* Decoration Pattern */}
                    <div className="absolute -right-8 -bottom-8 opacity-10">
                      <span className="material-symbols-outlined text-[120px]">mosque</span>
                    </div>
                  </div>

                  {/* Weekly Tasks Section */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-bold">المهام المطلوبة خلال الأسبوع</h4>
                      <button className="text-primary text-sm font-bold flex items-center gap-1">
                        عرض الكل <span className="material-symbols-outlined text-xs">arrow_back</span>
                      </button>
                    </div>
                    
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 max-h-[400px] overflow-y-auto">
                      {weeklyTasks.map((task) => (
                        <div
                          key={task.id}
                          className={`p-4 flex items-center justify-between transition-colors ${
                            task.status === 'completed'
                              ? 'bg-green-50/50 dark:bg-green-900/10'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                          }`}
                        >
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div
                              className={`size-10 rounded-lg flex items-center justify-center shrink-0 ${
                                task.status === 'completed'
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                  : 'bg-primary/10 text-primary'
                              }`}
                            >
                              {task.status === 'completed' ? (
                                <span className="material-symbols-outlined">check_circle</span>
                              ) : (
                                <span className="material-symbols-outlined">schedule</span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <p className={`font-bold truncate ${task.status === 'completed' ? 'line-through text-slate-500' : ''}`}>
                                  {task.title}
                                </p>
                                {task.status === 'completed' && (
                                  <span className="px-2 py-0.5 rounded text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-medium shrink-0">
                                    منتهي
                                  </span>
                                )}
                                {task.status === 'upcoming' && (
                                  <span className="px-2 py-0.5 rounded text-xs bg-primary/20 text-primary font-medium shrink-0">
                                    قادم
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                                <span className="flex items-center gap-1">
                                  <span className="material-symbols-outlined text-sm">calendar_today</span>
                                  {task.date}
                                </span>
                                <span className="flex items-center gap-1">
                                  <span className="material-symbols-outlined text-sm">person</span>
                                  {task.teacher}
                                </span>
                              </div>
                            </div>
                          </div>
                          {task.status === 'upcoming' && (
                            <button className="px-4 py-2 bg-primary text-background-dark text-xs font-bold rounded-lg hover:bg-primary/90 transition-colors shrink-0">
                              ابدأ المهمة
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Log of Surahs (Completed) */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-bold">آخر الإنجازات في سجل الحفظ</h4>
                      
                    </div>
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
                      {memorizationLogs.map((log, index) => (
                        <div key={index} className="p-4 flex items-center justify-between">
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
                            <p className="text-sm font-medium">{log.date}</p>
                            <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500">
                              {log.grade}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Activity Feed */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-bold">النشاط الأخير</h4>
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
                      <div className="relative space-y-6 before:absolute before:right-[15px] before:top-2 before:bottom-0 before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800">
                        {activities.map((activity, index) => (
                          <div key={index} className="relative pr-8">
                            <div className="absolute right-0 top-1 size-8 rounded-full bg-primary/20 flex items-center justify-center border-4 border-white dark:border-slate-900">
                              <div className="size-2 rounded-full bg-primary"></div>
                            </div>
                            <p className="text-sm leading-relaxed">
                              {activity.text.split(activity.boldText).map((part, i, arr) => (
                                <React.Fragment key={i}>
                                  {part}
                                  {i < arr.length - 1 && <span className="font-bold">{activity.boldText}</span>}
                                </React.Fragment>
                              ))}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">{activity.time}</p>
                          </div>
                        ))}
                      </div>
                    </div>
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
                    <button className="px-6 py-2 rounded-lg text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                      أكتوبر
                    </button>
                    <button className="px-8 py-2 rounded-lg bg-primary text-background-dark font-bold shadow-sm">
                      نوفمبر
                    </button>
                    <button className="px-6 py-2 rounded-lg text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                      ديسمبر
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                      <span className="material-symbols-outlined text-lg">filter_list</span>
                      تصفية
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                      <span className="material-symbols-outlined text-lg">print</span>
                      طباعة
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
                  <div className="grid grid-cols-7 auto-rows-[160px]">
                    {/* Days (Mocking some sessions) */}
                    <div className="p-2 border-b border-l border-slate-100 dark:border-slate-700 text-slate-400 text-xs">
                      10
                    </div>
                    <div className="p-2 border-b border-l border-slate-100 dark:border-slate-700 text-slate-400 text-xs">
                      11
                    </div>
                    {/* Booked Session Card */}
                    <div className="p-1 border-b border-l border-slate-100 dark:border-slate-700 relative group">
                      <span className="absolute top-2 right-2 text-slate-400 text-xs">12</span>
                      <div className="mt-6 bg-primary/10 border-r-4 border-primary p-2 rounded-lg cursor-pointer hover:bg-primary/20 transition-all">
                        <div className="flex items-center gap-2 mb-1">
                          <img
                            className="size-6 rounded-full border border-primary/30"
                            alt="صورة المعلم"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBVODR98Y43--A6Z7tgN20lDZ5a6YY34nIhDtbZER9JnaPrw6kf5UYg7MikkFhpvzLElr1-guvbciOoRgJMi5pHI5gGyul5WuvDkIt3R7FXojG3ZniVNjJwnKjjinu4PYKvOzLBz1AWfzs7W_tIDfkSH0_4FSK06Hb_ZXNJjBLMCFLrEvFZ_KUA21XW_85-G3ilFZh0cGSq5rdK42dPR0qkmhlSTUG8tH9-RB2KOh6pipJV2ChW7TVznmSKDBhsawktic6W7v-nPNI6"
                          />
                          <p className="text-[10px] font-bold truncate">الشيخ أحمد م.</p>
                        </div>
                        <p className="text-[10px] text-slate-600 dark:text-slate-300">حفظ - 04:00 م</p>
                      </div>
                    </div>
                    <div className="p-2 border-b border-l border-slate-100 dark:border-slate-700 text-slate-400 text-xs">
                      13
                    </div>
                    {/* Today */}
                    <div className="p-1 border-b border-l border-slate-100 dark:border-slate-700 bg-primary/5 relative">
                      <span className="absolute top-2 right-2 text-primary font-bold text-xs">14</span>
                      <div className="mt-6 bg-primary border-r-4 border-background-dark p-2 rounded-lg cursor-pointer shadow-md">
                        <div className="flex items-center gap-2 mb-1">
                          <img
                            className="size-6 rounded-full border border-background-dark/20"
                            alt="صورة المعلم"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBWDMEjH0HpF9e16mYRnDAUs7CxFNyPY5noRNemszVJh4_-oHyAbbtTRzO3eWOEO0CTFwwMm7-LOs_Mw7nnMT8POQPZrnuNS2pDa-RXjgPgU7iPYyPs8F0VRflFYtKLls8996CWsOVdtf3okgzFExAqRsvzL5AnZSFfrZmIV2sxnt2YhRbwN6BM-7DlD8wUkau7wiDITAttESfxMgdxpGDVHeIHAwUwq1_Na81_4dkFoUq7I6FNx-viCuDzxnnlUGXlyInwT5mPAyTq"
                          />
                          <p className="text-[10px] font-bold text-background-dark truncate">الشيخ عبدالله ع.</p>
                        </div>
                        <p className="text-[10px] text-background-dark/80 font-medium">حفظ - 04:30 م</p>
                      </div>
                    </div>
                    <div className="p-2 border-b border-l border-slate-100 dark:border-slate-700 text-slate-400 text-xs">
                      15
                    </div>
                    <div className="p-2 border-b border-slate-100 dark:border-slate-700 text-slate-400 text-xs">
                      16
                    </div>
                    {/* Second Row */}
                    <div className="p-2 border-b border-l border-slate-100 dark:border-slate-700 text-slate-400 text-xs">
                      17
                    </div>
                    <div className="p-1 border-b border-l border-slate-100 dark:border-slate-700 relative">
                      <span className="absolute top-2 right-2 text-slate-400 text-xs">18</span>
                      <div className="mt-6 bg-slate-100 dark:bg-slate-700 border-r-4 border-slate-400 p-2 rounded-lg cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-600 transition-all">
                        <div className="flex items-center gap-2 mb-1">
                          <img
                            className="size-6 rounded-full"
                            alt="صورة المعلم"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBl6BPUXT-O5JwRzWIKfoDzQMOVsGZ6Mptgr1I6KJ4Cwlxshc-LvBNsejLGg04KCUGgXYPD2nNVLAV5bxhku8vZaRugWfk9MEClEXuT-AmsnePYLqes1uaLoFDuhB5fW7uISxzIKD6RWutzeiQEP2ZSsv-IA2rFg4Ygc-gb_bYoKueCGLaSIJyYzX2kl1dzZkCd2hjhgCZYuxXHdNWLSWTa7SZ0qXYAeqtxYCe97naPvUifbF_O2z_npD53fb_2nDG1IfBcrCEhyXtg"
                          />
                          <p className="text-[10px] font-bold truncate">أ. هدى خالد</p>
                        </div>
                        <p className="text-[10px] text-slate-500">تلاوة - 05:00 م</p>
                      </div>
                    </div>
                    <div className="p-2 border-b border-l border-slate-100 dark:border-slate-700 text-slate-400 text-xs">
                      19
                    </div>
                    <div className="p-2 border-b border-l border-slate-100 dark:border-slate-700 text-slate-400 text-xs">
                      20
                    </div>
                    <div className="p-1 border-b border-l border-slate-100 dark:border-slate-700 relative">
                      <span className="absolute top-2 right-2 text-slate-400 text-xs">21</span>
                      <div className="mt-6 bg-primary/10 border-r-4 border-primary p-2 rounded-lg cursor-pointer hover:bg-primary/20 transition-all">
                        <p className="text-[10px] font-bold">الشيخ أحمد م.</p>
                        <p className="text-[10px] text-slate-600 dark:text-slate-300">حفظ - 04:00 م</p>
                      </div>
                    </div>
                    <div className="p-2 border-b border-l border-slate-100 dark:border-slate-700 text-slate-400 text-xs">
                      22
                    </div>
                    <div className="p-2 border-b border-slate-100 dark:border-slate-700 text-slate-400 text-xs">
                      23
                    </div>
                  </div>
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
              <div className="bg-white dark:bg-slate-900 rounded-xl p-8 shadow-sm border border-slate-100 dark:border-slate-800">
                <h3 className="text-xl font-bold mb-4">سجل الحفظ</h3>
                <p className="text-slate-500">سيتم إضافة محتوى سجل الحفظ هنا</p>
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

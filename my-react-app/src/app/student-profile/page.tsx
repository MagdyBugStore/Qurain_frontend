'use client'

import React, { useState } from "react";
import Header from '../../components/layout/Header'

type TabType = 'overview' | 'schedule' | 'memorization' | 'achievements'

export default function StudentProfilePage() {
  const [activeTab, setActiveTab] = useState<TabType>('overview')

  const tabs = [
    { id: 'overview' as TabType, label: 'نظرة عامة' },
    { id: 'schedule' as TabType, label: 'جدول الحصص' },
    { id: 'memorization' as TabType, label: 'سجل الحفظ' },
    { id: 'achievements' as TabType, label: 'الإنجازات' },
  ]

  const navItems = [
    { id: 'overview', icon: 'dashboard', label: 'نظرة عامة' },
    { id: 'schedule', icon: 'calendar_month', label: 'جدول الحصص' },
    { id: 'memorization', icon: 'menu_book', label: 'سجل الحفظ' },
    { id: 'achievements', icon: 'workspace_premium', label: 'الإنجازات' },
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

  const achievements = [
    { icon: 'military_tech', label: 'أسبوع مثالي', bgClass: 'bg-amber-50 dark:bg-amber-900/20', iconClass: 'text-primary' },
    { icon: 'auto_stories', label: 'حافظ الأجزاء', bgClass: 'bg-blue-50 dark:bg-blue-900/20', iconClass: 'text-blue-500' },
    { icon: 'rocket_launch', label: 'انطلاقة سريعة', bgClass: 'bg-purple-50 dark:bg-purple-900/20', iconClass: 'text-purple-500' },
  ]

  return (
    <>
      <Header />
      <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 antialiased">
        <main className="flex-1 max-w-[1400px] mx-auto w-full p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar: Profile Info */}
          <aside className="lg:col-span-3 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center">
              <div className="relative group">
                <div className="size-32 rounded-full border-4 border-primary/20 p-1 mb-4">
                  <img
                    alt="صورة المستخدم الكبيرة"
                    className="w-full h-full rounded-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDaHCQpQDIhRCTg8znqGbspw1A1F6Zar1Syu1aLwWIQat1CNApShCs6EKLwGnERa9BLy_zwlwOAPw7sLW8qgsiPJIiXGWL4B0KMcMnHdJcvbOIrtiSKYYlhWoiyKFRz7ol7BumuHGknAqEeSUXxfrzxk6sHDfrepKu8GiXJcm8IJpTCYIlEKrMDSvQP_eE-ePAzmoROe-xBU2UtjrP8j93LQuthyn4pLtWeWolZnyevkFcf-cE_8Ugxc-6zr4dclaScsP8KvndSVtUa"
                  />
                </div>
                <button className="absolute bottom-4 left-0 bg-primary text-white p-2 rounded-full shadow-lg border-2 border-white dark:border-slate-900">
                  <span className="material-symbols-outlined text-sm">edit</span>
                </button>
              </div>
              <h3 className="text-xl font-bold mb-1">أحمد محمد العامري</h3>
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-6">
                المستوى المتقدم - تجويد
              </span>
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
                {/* Top Row: Goal Progress & Upcoming Session */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Circular Progress Card */}
                  <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="space-y-2">
                      <h4 className="text-lg font-bold">هدف الحفظ الحالي</h4>
                      <p className="text-sm text-slate-500">حفظ سورة الكهف</p>
                      <div className="pt-4">
                        <span className="text-3xl font-bold text-primary">٧٥٪</span>
                        <p className="text-xs text-slate-400 mt-1">بقي ٥ صفحات للإتمام</p>
                      </div>
                    </div>
                    <div className="relative size-28 flex items-center justify-center">
                      <svg className="size-full" viewBox="0 0 100 100">
                        <circle
                          className="text-slate-100 dark:text-slate-800"
                          cx="50"
                          cy="50"
                          fill="transparent"
                          r="40"
                          stroke="currentColor"
                          strokeWidth="8"
                        />
                        <circle
                          className="text-primary"
                          cx="50"
                          cy="50"
                          fill="transparent"
                          r="40"
                          stroke="currentColor"
                          strokeDasharray="251.2"
                          strokeDashoffset="62.8"
                          strokeLinecap="round"
                          strokeWidth="8"
                        />
                      </svg>
                      <span className="absolute material-symbols-outlined text-primary text-3xl">auto_awesome</span>
                    </div>
                  </div>

                  {/* Upcoming Session Card */}
                  <div className="bg-primary rounded-xl p-6 shadow-lg text-white flex flex-col justify-between overflow-hidden relative">
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
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Log of Surahs (Completed) */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-bold">آخر الإنجازات في سجل الحفظ</h4>
                      <button className="text-primary text-sm font-bold flex items-center gap-1">
                        عرض الكل <span className="material-symbols-outlined text-xs">arrow_back</span>
                      </button>
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

                {/* Bottom Section: Achievements Preview */}
                <div className="space-y-4 pb-12">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-bold">آخر الأوسمة</h4>
                    <button className="text-primary text-sm font-bold">كل الإنجازات</button>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    {achievements.map((achievement, index) => (
                      <div
                        key={index}
                        className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col items-center gap-2 w-32 shadow-sm"
                      >
                        <div className={`size-16 rounded-full ${achievement.bgClass} flex items-center justify-center`}>
                          <span className={`material-symbols-outlined text-3xl ${achievement.iconClass}`}>
                            {achievement.icon}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-center">{achievement.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Other Tabs Content */}
            {activeTab === 'schedule' && (
              <div className="bg-white dark:bg-slate-900 rounded-xl p-8 shadow-sm border border-slate-100 dark:border-slate-800">
                <h3 className="text-xl font-bold mb-4">جدول الحصص</h3>
                <p className="text-slate-500">سيتم إضافة محتوى جدول الحصص هنا</p>
              </div>
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

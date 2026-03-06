'use client'

import React from "react";
import { Link } from 'react-router-dom'

export default function TeacherApplicationReviewPage() {
  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col">
      {/* Header */}
      <header className="w-full bg-white dark:bg-slate-900 shadow-sm py-4 px-6 flex justify-between items-center">
        <div className="flex items-center gap-2 text-primary font-bold text-lg">
          <span className="material-symbols-outlined">star</span>
          <span>طلب الانضمام</span>
        </div>
        <div className="relative cursor-pointer text-gray-500 hover:text-primary transition-colors">
          <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
          <span className="material-symbols-outlined">notifications</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center px-4 py-12 mb-12">
        {/* Large Status Icon Container */}
        <div className="bg-[#FDF6E3] dark:bg-primary/10 rounded-full p-8 mb-6 shadow-sm border border-primary/20">
          <span className="material-symbols-outlined text-[80px] text-primary">hourglass_empty</span>
        </div>

        {/* Heading */}
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4 text-center">
          طلبك قيد المراجعة
        </h1>

        {/* Descriptive Text */}
        <div className="max-w-xl text-center space-y-3 mb-8">
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg">
            شكراً لانضمامك إلينا كمعلم. يقوم فريقنا حالياً بمراجعة طلبك وكافة المستندات المرفقة 
            لضمان أفضل جودة تعليمية.
          </p>
          <p className="text-slate-600 dark:text-slate-400 font-medium">
            سيتم التواصل معك لتحديد موعد المقابلة قريباً.
          </p>
        </div>

        {/* Action Button */}
        <Link
          to="/"
          className="bg-primary hover:bg-primary/90 text-white font-bold py-3 px-8 rounded-lg shadow-md transition-colors duration-200 mb-6 w-full sm:w-auto text-center"
        >
          العودة للرئيسية
        </Link>

        {/* Help Link */}
        <a 
          href="#" 
          className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-primary text-sm transition-colors"
        >
          <span className="material-symbols-outlined">help</span>
          هل تحتاج للمساعدة؟ تواصل معنا
        </a>
      </main>

      {/* Process Steps Section */}
      <section className="w-full bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 py-10 mt-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {/* Step 1: Initial Application (Completed) */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm flex flex-col items-center text-center opacity-80">
              <div className="rounded-full p-3 mb-3 bg-green-50 dark:bg-green-900/30">
                <span className="material-symbols-outlined text-[#28A745] text-2xl">check_circle</span>
              </div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-1">التقديم الأولي</h3>
              <p className="text-xs font-medium text-[#28A745]">تم التحقق من البيانات الأساسية</p>
            </div>

            {/* Step 2: Certificate Review (Active) */}
            <div className="bg-[#FEF9E7] dark:bg-primary/10 p-5 rounded-xl border-2 border-primary shadow-md flex flex-col items-center text-center relative z-10">
              {/* Active Indicator Pulse */}
              <span className="absolute top-3 right-3 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
              </span>
              <div className="bg-primary/10 text-primary rounded-full p-3 mb-3">
                <span className="material-symbols-outlined text-2xl">search</span>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1">مراجعة الشهادات</h3>
              <p className="text-xs text-primary font-medium">جاري التحقق من المؤهلات الأكاديمية</p>
            </div>

            {/* Step 3: Personal Interview (Future) */}
            <div className="bg-gray-50 dark:bg-slate-800 p-5 rounded-xl border border-gray-100 dark:border-slate-700 flex flex-col items-center text-center opacity-60">
              <div className="bg-gray-200 dark:bg-slate-700 text-gray-400 rounded-full p-3 mb-3">
                <span className="material-symbols-outlined text-2xl">person</span>
              </div>
              <h3 className="font-bold text-slate-500 dark:text-slate-400 mb-1">المقابلة الشخصية</h3>
              <p className="text-xs text-gray-400">سيتم التواصل لتحديد موعد</p>
            </div>

            {/* Step 4: Final Interview (Future) */}
            <div className="bg-gray-50 dark:bg-slate-800 p-5 rounded-xl border border-gray-100 dark:border-slate-700 flex flex-col items-center text-center opacity-60">
              <div className="bg-gray-200 dark:bg-slate-700 text-gray-400 rounded-full p-3 mb-3">
                <span className="material-symbols-outlined text-2xl">record_voice_over</span>
              </div>
              <h3 className="font-bold text-slate-500 dark:text-slate-400 mb-1">المقابلة النهائية</h3>
              <p className="text-xs text-gray-400">سيتم التواصل لتحديد موعد</p>
            </div>

            {/* Step 5: Final Activation (Future) */}
            <div className="bg-gray-50 dark:bg-slate-800 p-5 rounded-xl border border-gray-100 dark:border-slate-700 flex flex-col items-center text-center opacity-60">
              <div className="bg-gray-200 dark:bg-slate-700 text-gray-400 rounded-full p-3 mb-3">
                <span className="material-symbols-outlined text-2xl">verified</span>
              </div>
              <h3 className="font-bold text-slate-500 dark:text-slate-400 mb-1">التفعيل النهائي</h3>
              <p className="text-xs text-gray-400">الخطوة الأخيرة لبدء التدريس</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 py-6 border-t border-gray-100 dark:border-slate-800 text-center">
        <p className="text-slate-400 dark:text-slate-500 text-sm text-center">
          © 2024 منصة المعلمين. جميع الحقوق محفوظة
        </p>
      </footer>
    </div>
  )
}

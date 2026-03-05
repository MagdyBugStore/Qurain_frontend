'use client'

import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface AccountTypeSelectionProps {
  onSelect: (type: 'student' | 'teacher') => void
}

export default function AccountTypeSelection({ onSelect }: AccountTypeSelectionProps) {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [selectedType, setSelectedType] = useState<'student' | 'teacher' | null>(null);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleNext = () => {
    if (selectedType) {
      onSelect(selectedType);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark font-body">
      <header className="flex items-center justify-between whitespace-nowrap bg-transparent px-6 md:px-20 py-6 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="size-10 flex items-center justify-center rounded-lg bg-primary text-white">
            <span className="material-symbols-outlined text-2xl">school</span>
          </div>
          <h2 className="text-text-main dark:text-slate-100 text-xl font-bold leading-tight tracking-tight">
            قرآن أونلاين
          </h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-700"></div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm font-medium text-text-secondary dark:text-slate-300 hover:text-primary transition-colors"
          >
            <span>تسجيل الخروج</span>
            <span className="material-symbols-outlined text-[20px]">logout</span>
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 md:py-20">
        <div className="max-w-2xl w-full flex flex-col items-center">
          <div className="text-center mb-8">
            <h1 className="text-text-main dark:text-slate-100 text-2xl md:text-3xl font-bold leading-tight mb-3">
              اختر نوع الحساب
            </h1>
            <p className="text-text-secondary dark:text-slate-400 text-sm max-w-md mx-auto">
              حدد دورك للبدء في رحلتك التعليمية مع القرآن الكريم
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 md:gap-4 w-full mb-8">
            {/* Teacher Card */}
            <div
              onClick={() => setSelectedType('teacher')}
              className={`relative flex flex-col items-center bg-white dark:bg-slate-800 rounded-lg p-4 md:p-6 shadow-sm border-2 transition-all duration-300 cursor-pointer ${
                selectedType === 'teacher'
                  ? 'border-primary bg-primary/5'
                  : 'border-slate-200 dark:border-slate-700 hover:border-primary/50'
              }`}
            >
              <div className={`size-12 md:size-16 rounded-lg flex items-center justify-center mb-3 md:mb-4 transition-colors ${
                selectedType === 'teacher' ? 'bg-primary/10' : 'bg-primary/5'
              }`}>
                <span className="material-symbols-outlined text-3xl md:text-4xl text-primary">menu_book</span>
              </div>
              <h3 className="text-base md:text-xl font-bold text-text-main dark:text-slate-100 mb-1">معلم</h3>
              <p className="text-text-secondary dark:text-slate-400 text-center text-[10px] md:text-xs leading-relaxed">
                شارك معرفتك مع الطلاب
              </p>
              {selectedType === 'teacher' && (
                <div className="absolute top-2 left-2 md:top-2.5 md:left-2.5 size-5 md:size-6 rounded-full bg-primary flex items-center justify-center p-0.5">
                  <span className="material-symbols-outlined text-white text-sm">check</span>
                </div>
              )}
            </div>

            {/* Student Card */}
            <div
              onClick={() => setSelectedType('student')}
              className={`relative flex flex-col items-center bg-white dark:bg-slate-800 rounded-lg p-4 md:p-6 shadow-sm border-2 transition-all duration-300 cursor-pointer ${
                selectedType === 'student'
                  ? 'border-primary bg-primary/5'
                  : 'border-slate-200 dark:border-slate-700 hover:border-primary/50'
              }`}
            >
              <div className={`size-12 md:size-16 rounded-lg flex items-center justify-center mb-3 md:mb-4 transition-colors ${
                selectedType === 'student' ? 'bg-primary/10' : 'bg-primary/5'
              }`}>
                <span className="material-symbols-outlined text-3xl md:text-4xl text-primary">school</span>
              </div>
              <h3 className="text-base md:text-xl font-bold text-text-main dark:text-slate-100 mb-1">طالب</h3>
              <p className="text-text-secondary dark:text-slate-400 text-center text-[10px] md:text-xs leading-relaxed">
                ابدأ رحلتك في تعلم القرآن الكريم
              </p>
              {selectedType === 'student' && (
                <div className="absolute top-2 left-2 md:top-2.5 md:left-2.5 size-5 md:size-6 rounded-full bg-primary flex items-center justify-center p-0.5">
                  <span className="material-symbols-outlined text-white text-xs md:text-sm">check</span>
                </div>
              )}
            </div>
          </div>

          {selectedType && (
            <button
              onClick={handleNext}
              className="w-full md:w-auto min-w-[200px] py-3 px-8 bg-primary text-white font-bold rounded-lg hover:bg-primary-dark transition-all flex items-center justify-center gap-2 shadow-md"
            >
              <span>التالي</span>
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          )}
        </div>
      </main>

      <footer className="py-6 px-6 border-t border-slate-200 dark:border-slate-800 text-center text-text-secondary dark:text-slate-500 text-sm">
        <p>© 2024 جميع الحقوق محفوظة</p>
      </footer>
    </div>
  )
}

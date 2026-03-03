'use client'

import { useAppStore } from '@/store/useAppStore'

interface Step3LevelProps {
  onNext: () => void
  onBack?: () => void
}

export default function Step3Level({ onNext, onBack }: Step3LevelProps) {
  const { formData, updateFormData } = useAppStore()

  const levels = [
    {
      id: 'beginner',
      icon: 'child_care',
      title: 'مبتدئ',
      description: 'لا يجيد قراءة الحروف العربية أو يحتاج لتعلم الأساسيات من الصفر.',
    },
    {
      id: 'intermediate',
      icon: 'menu_book',
      title: 'متوسط',
      description: 'يقرأ الكلمات ولكن بتهجئة بطيئة، ويحتاج للتدريب على الوصل والطلاقة.',
    },
    {
      id: 'advanced',
      icon: 'verified',
      title: 'متقدم',
      description: 'يقرأ بطلاقة ويحتاج لتحسين التجويد وإتقان مخارج الحروف والصفات.',
    },
  ]

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-4xl font-black text-slate-900 dark:text-slate-100 mb-4 tracking-tight">
          المستوى الحالي
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed">
          ما هو مستوى الطالب في تلاوة القرآن حالياً؟ يساعدنا هذا في تخصيص الدروس
          المناسبة.
        </p>
      </div>

      <form className="space-y-4">
        {levels.map((level) => {
          const isSelected = formData.level === level.id
          return (
            <label
              key={level.id}
              className={`group relative flex items-start gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all ${
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-primary/50'
              }`}
            >
              <input
                type="radio"
                name="level"
                value={level.id}
                checked={isSelected}
                onChange={() => updateFormData({ level: level.id })}
                className="mt-1.5 h-5 w-5 text-primary focus:ring-primary border-slate-300 dark:border-slate-700"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="material-symbols-outlined text-primary text-xl">
                    {level.icon}
                  </span>
                  <span className="font-bold text-slate-900 dark:text-slate-100 text-lg">
                    {level.title}
                  </span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  {level.description}
                </p>
              </div>
            </label>
          )
        })}
      </form>

      <div className="mt-12 flex flex-col items-center gap-4">
        <button
          onClick={onNext}
          className="w-full bg-primary hover:bg-primary/90 text-slate-900 font-black py-4 px-8 rounded-xl transition-all flex items-center justify-center gap-2 text-lg shadow-lg shadow-primary/20"
        >
          المتابعة للخطوة التالية
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        {onBack && (
          <button
            onClick={onBack}
            className="text-slate-500 dark:text-slate-400 hover:text-primary transition-colors font-bold py-2 flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
            رجوع للخطوة السابقة
          </button>
        )}
      </div>
    </div>
  )
}

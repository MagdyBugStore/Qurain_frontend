'use client'

import React from "react";
import { useAppStore } from '../../store/useAppStore'

interface Step2AgeGroupProps {
  onNext: () => void
  onBack?: () => void
}

export default function Step2AgeGroup({ onNext, onBack: _onBack }: Step2AgeGroupProps) {
  const { formData, updateFormData } = useAppStore()
  void _onBack

  const ageGroups = [
    { id: 'child', label: 'طفل', ageRange: '5-12 سنة' },
    { id: 'youth', label: 'ناشئ', ageRange: '13-18 سنة' },
    { id: 'adult', label: 'بالغ', ageRange: '18+ سنة' },
  ]

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900">أخبرنا عنك</h1>
        <p className="text-slate-500 mt-2">
          لنبدأ بتحديد الفئة العمرية وتفضيلات المعلم لنقدم لك أفضل تجربة.
        </p>
      </div>

      <section>
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-800">
          <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">
            person_search
          </span>
          الفئة العمرية
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {ageGroups.map((group) => {
            const isSelected = formData.ageGroup === group.id
            return (
              <label key={group.id} className="cursor-pointer group">
                <input
                  type="radio"
                  name="age"
                  checked={isSelected}
                  onChange={() => updateFormData({ ageGroup: group.id })}
                  className="hidden peer"
                />
                <div
                  className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 shadow-sm transition-all hover:border-primary/30 ${
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-slate-100 bg-white'
                  }`}
                >
                  <span className="text-base font-bold text-slate-900">{group.label}</span>
                  <span className="text-xs text-slate-500 mt-1">{group.ageRange}</span>
                </div>
              </label>
            )
          })}
        </div>
      </section>

      <div className="pt-4">
        <button
          onClick={onNext}
          className="w-full bg-primary hover:bg-primary/90 text-background-dark font-extrabold py-5 rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-[0.98] text-center"
        >
          الاستمرار للخطوة التالية
        </button>
      </div>

      <div className="mt-4 p-8 rounded-3xl bg-primary/5 border border-primary/10 relative overflow-hidden">
        <div className="relative z-10 flex gap-5 items-start">
          <div className="bg-white p-3 rounded-xl shadow-sm">
            <span className="material-symbols-outlined text-primary">info</span>
          </div>
          <div>
            <h4 className="font-bold mb-2 text-slate-900">لماذا نسأل هذه الأسئلة؟</h4>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              تساعدنا هذه المعلومات في تخصيص تجربتك التعليمية واختيار المعلم الأنسب
              لمهاراتك وأهدافك في حفظ وتجويد القرآن الكريم.
            </p>
          </div>
        </div>
        <div className="absolute -right-8 -bottom-8 opacity-10">
          <span className="material-symbols-outlined text-9xl text-primary">menu_book</span>
        </div>
      </div>
    </div>
  )
}

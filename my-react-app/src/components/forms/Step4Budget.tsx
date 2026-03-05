'use client'

import React from "react";
import { useAppStore } from '../../store/useAppStore'

interface Step4BudgetProps {
  onComplete: () => void
  onBack?: () => void
}

export default function Step4Budget({ onComplete, onBack }: Step4BudgetProps) {
  const { formData, updateFormData } = useAppStore()

  const learningGoals = [
    { id: 'memorization', icon: 'menu_book', label: 'حفظ' },
    { id: 'ijaza', icon: 'verified', label: 'إجازة' },
    { id: 'recitation', icon: 'record_voice_over', label: 'تصحيح التلاوة' },
    { id: 'understanding', icon: 'psychology', label: 'فهم المعاني' },
  ]

  return (
    <div className="space-y-12">
      {/* Monthly Budget */}    
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="size-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined">savings</span>
          </div>
          <h3 className="text-xl font-bold">الميزانية الشهرية</h3>
        </div>
        <div className="bg-slate-50 dark:bg-white/5 p-8 rounded-xl border border-slate-200 dark:border-white/10">
          <div className="flex justify-center mb-8">
            <div className="text-center">
              <span className="text-5xl font-black text-primary">{formData.budget}</span>
              <span className="text-lg font-bold mr-2">ريال</span>
            </div>
          </div>
          <div className="relative px-2">
            <input
              type="range"
              min="50"
              max="1000"
              step="50"
              value={formData.budget}
              onChange={(e) => updateFormData({ budget: Number(e.target.value) })}
              className="range-slider w-full h-2 bg-slate-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between mt-4 text-sm font-semibold opacity-60">
              <span>50 ريال</span>
              <span>1000+ ريال</span>
            </div>
          </div>
        </div>
      </section>

      {/* Learning Goal */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="size-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined">auto_stories</span>
          </div>
          <h3 className="text-xl font-bold">الهدف التعليمي</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {learningGoals.map((goal) => {
            const isSelected = formData.learningGoal === goal.id
            return (
              <label key={goal.id} className="cursor-pointer group">
                <input
                  type="radio"
                  name="goal"
                  checked={isSelected}
                  onChange={() => updateFormData({ learningGoal: goal.id })}
                  className="hidden peer"
                />
                <div
                  className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all h-full text-center ${
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-slate-200 dark:border-white/10'
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-3xl mb-3 ${
                      isSelected ? 'text-primary' : 'text-slate-400'
                    }`}
                  >
                    {goal.icon}
                  </span>
                  <span className="text-sm font-bold">{goal.label}</span>
                </div>
              </label>
            )
          })}
        </div>
      </section>

      {/* Bottom Navigation */}
      <div className="mt-auto pt-8 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center gap-6">
        <button
          onClick={onComplete}
          className="w-full sm:w-auto px-12 py-4 bg-primary text-background-dark font-extrabold text-lg rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all"
        >
          إكمال الملف
        </button>
        {onBack && (
          <button
            onClick={onBack}
            className="text-slate-500 hover:text-primary font-bold transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined">arrow_forward</span>
            رجوع
          </button>
        )}
      </div>
    </div>
  )
}

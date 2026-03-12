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
            const currentGoals = formData.learningGoal || []
            const isSelected = Array.isArray(currentGoals) && currentGoals.includes(goal.id)
            return (
              <label key={goal.id} className="cursor-pointer group">
                <input
                  type="checkbox"
                  name="goal"
                  checked={isSelected}
                  onChange={() => {
                    const currentGoals = formData.learningGoal || []
                    const goalsArray = Array.isArray(currentGoals) ? currentGoals : []
                    if (isSelected) {
                      // Remove goal if already selected
                      updateFormData({ learningGoal: goalsArray.filter(id => id !== goal.id) })
                    } else {
                      // Add goal if not selected
                      updateFormData({ learningGoal: [...goalsArray, goal.id] })
                    }
                  }}
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
          className="w-full sm:w-auto px-12 py-4 bg-primary text-background-dark font-extrabold text-lg rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all text-center"
        >
          إكمال الملف
        </button>
       
      </div>
    </div>
  )
}

'use client'

import { useAppStore } from '@/store/useAppStore'

interface Step1GoalsProps {
  onNext: () => void
  onBack?: () => void
}

export default function Step1Goals({ onNext }: Step1GoalsProps) {
  const { formData, updateFormData } = useAppStore()

  const goals = [
    {
      id: 'memorization',
      icon: 'menu_book',
      title: 'حفظ القرآن الكريم',
      description: 'حفظ كتاب الله عز وجل بطريقة ميسرة ومتقنة مع خطط متابعة ذكية',
    },
    {
      id: 'contemplation',
      icon: 'psychology_alt',
      title: 'تدبر القرآن',
      description: 'فهم معاني الآيات والتعمق في مقاصد القرآن الكريم وأسراره البلاغية',
    },
    {
      id: 'recitation',
      icon: 'record_voice_over',
      title: 'تلاوة القرآن',
      description: 'تحسين النطق وإتقان أحكام التجويد والمخارج بأعلى معايير الإتقان',
    },
  ]

  const toggleGoal = (goalId: string) => {
    const currentGoals = formData.goals || []
    const newGoals = currentGoals.includes(goalId)
      ? currentGoals.filter((id) => id !== goalId)
      : [...currentGoals, goalId]
    updateFormData({ goals: newGoals })
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <h1 className="text-slate-900 text-3xl md:text-4xl font-black leading-tight">
          ما هو هدفك من تعلم القرآن؟
        </h1>
        <p className="text-slate-500 text-lg font-normal">
          يمكنك اختيار أكثر من مسار لتخصيص تجربتك التعليمية.
        </p>
      </div>

      <div className="grid gap-4">
        {goals.map((goal) => {
          const isSelected = formData.goals?.includes(goal.id)
          return (
            <label
              key={goal.id}
              className={`selection-card relative flex items-start gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all hover:border-primary/50 ${
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-slate-200 bg-white'
              }`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleGoal(goal.id)}
                className="peer absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full border-slate-300 text-primary focus:ring-primary/20 bg-transparent checked:bg-primary"
              />
              <div
                className={`icon-container flex items-center justify-center size-14 rounded-lg shrink-0 transition-colors ${
                  isSelected
                    ? 'bg-primary text-white'
                    : 'bg-slate-50 text-slate-400'
                }`}
              >
                <span className="material-symbols-outlined text-3xl">{goal.icon}</span>
              </div>
              <div className="flex flex-col gap-1 pr-2 pl-10">
                <h3 className="text-slate-900 text-lg font-bold">{goal.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{goal.description}</p>
              </div>
            </label>
          )
        })}
      </div>

      <div className="pt-6">
        <button
          onClick={onNext}
          className="w-full flex items-center justify-center h-14 bg-primary hover:bg-primary/90 text-slate-900 text-lg font-bold rounded-xl transition-all shadow-lg shadow-primary/20 active:scale-[0.98]"
        >
          <span>استمرار</span>
          <span className="material-symbols-outlined mr-2">arrow_back</span>
        </button>
      </div>
    </div>
  )
}

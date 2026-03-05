'use client'

import { useState } from 'react'
import Header from '../../components/layout/Header'
import LoginModal from '../../components/modals/LoginModal'
import Popup from '../../components/modals/Popup'
import EmailSignup from '../../components/forms/EmailSignup'
import Step1Goals from '../../components/forms/Step1Goals'
import Step2AgeGroup from '../../components/forms/Step2AgeGroup'
import Step3Level from '../../components/forms/Step3Level'
import Step4Budget from '../../components/forms/Step4Budget'
import { useAppStore } from '../../store/useAppStore'

export default function StartFreePage() {
  const [currentStep, setCurrentStep] = useState(1)
  const emailSubmitted = useAppStore((state) => state.emailSubmitted)
  const showEmailForm = !emailSubmitted

  const steps = [
    { number: 1, component: Step1Goals, title: 'ما هو هدفك من تعلم القرآن؟' },
    { number: 2, component: Step2AgeGroup, title: 'أخبرنا عنك' },
    { number: 3, component: Step3Level, title: 'المستوى الحالي' },
    { number: 4, component: Step4Budget, title: 'الميزانية والهدف' },
  ]

  const handleEmailSubmitted = () => {}

  const CurrentStepComponent = steps[currentStep - 1]?.component || Step1Goals

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Show email signup form first
  if (showEmailForm) {
    return (
      <div className="bg-background-light dark:bg-background-dark min-h-screen">
        <EmailSignup onEmailSubmitted={handleEmailSubmitted} />
      </div>
    )
  }

  // Show multi-step form after email submission
  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Progress Indicator */}
          <div className="mb-8 text-center">
            <div className="relative flex items-center justify-center w-16 h-16 mx-auto mb-4">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  className="text-slate-100"
                  cx="32"
                  cy="32"
                  fill="transparent"
                  r="28"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <circle
                  className="text-primary"
                  cx="32"
                  cy="32"
                  fill="transparent"
                  r="28"
                  stroke="currentColor"
                  strokeDasharray={175.9}
                  strokeDashoffset={175.9 - (175.9 * currentStep) / steps.length}
                  strokeLinecap="round"
                  strokeWidth="4"
                />
              </svg>
              <span className="absolute text-sm font-bold text-slate-900">
                {currentStep}/{steps.length}
              </span>
            </div>
            <p className="text-xs font-semibold text-primary uppercase tracking-wider">
              {steps[currentStep - 1]?.title}
            </p>
          </div>

          {/* Step Component */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <CurrentStepComponent onNext={handleNext} onBack={handleBack} />
          </div>
        </div>
      </main>
      <LoginModal />
      <Popup />
    </>
  )
}

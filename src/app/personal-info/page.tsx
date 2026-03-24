'use client'

import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useAppStore } from '../../store/useAppStore'
import { isProfileComplete } from '../../models/UserModel'
import Step1Goals from '../../components/forms/Step1Goals'
import Step2AgeGroup from '../../components/forms/Step2AgeGroup'
import Step3Level from '../../components/forms/Step3Level'

type Step = 'step1' | 'step2' | 'step3'

export default function PersonalInfoPage() {
  const navigate = useNavigate()
  const { user, userProfile, saveUserProfile } = useAuth()
  const { formData, resetFormData } = useAppStore()
  const [currentStep, setCurrentStep] = useState<Step>('step1')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!user) {
      return
    }

    // If accountType is missing, redirect to choose role page
    if (!userProfile?.accountType) {
      navigate('/choose-role', { replace: true })
      return
    }

    // If user is not a student, redirect to appropriate page
    if (userProfile.accountType !== 'student') {
      if (userProfile.accountType === 'teacher') {
        navigate('/teacher-application', { replace: true })
      } else {
        navigate('/choose-role', { replace: true })
      }
      return
    }

    // If profile is already complete, redirect to profile page
    if (userProfile && isProfileComplete(userProfile)) {
      const timer = setTimeout(() => {
        if (user?.id) {
          navigate(`/profile/${user.id}`, { replace: true })
        } else {
          navigate('/profile', { replace: true })
        }
      }, 100)
      return () => clearTimeout(timer)
    }

    // Keep current step as-is; do not reset progress on auth/profile re-renders.
  }, [user, userProfile, navigate])

  const handleStep1Complete = () => {
    setCurrentStep('step2')
  }

  const handleStep2Complete = () => {
    setCurrentStep('step3')
  }

  const handleCompleteProfile = async () => {
    if (isSubmitting) {
      return
    }

    // Save all form data to user profile
    const profileData = {
      ...formData,
      role: 'student' as const,
      accountType: 'student' as const,
      completed: true,
      profileCompletedAt: new Date().toISOString(),
      fullName: user?.fullName || '',
      firstName: user?.fullName?.split(' ')[0] || '',
      lastName: user?.fullName?.split(' ').slice(1).join(' ') || '',
      email: user?.email || '',
      photoURL: user?.avatar || '', // Save image URL from user account
      displayName: user?.fullName || '', // Save display name as well
    }

    try {
      setIsSubmitting(true)
      await saveUserProfile(profileData)
      resetFormData()

      // Redirect to profile with user ID
      if (user?.id) {
        navigate(`/profile/${user.id}`)
      } else {
        navigate('/profile')
      }
    } catch (error) {
      console.error('Failed to complete personal info:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStep3Complete = () => {
    void handleCompleteProfile()
  }

  const handleBack = () => {
    if (currentStep === 'step3') {
      setCurrentStep('step2')
    } else if (currentStep === 'step2') {
      setCurrentStep('step1')
    } else if (currentStep === 'step1') {
      // Go back to choose role page
      navigate('/choose-role')
    }
  }

  if (!user || !userProfile?.accountType || userProfile.accountType !== 'student') {
    return null
  }

  const getStepNumber = () => {
    if (currentStep === 'step1') return 1
    if (currentStep === 'step2') return 2
    if (currentStep === 'step3') return 3
    return 0
  }

  const getTotalSteps = () => {
    return 3
  }

  const getProgressPercentage = () => {
    const step = getStepNumber()
    const total = getTotalSteps()
    return (step / total) * 100
  }

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-primary/10 bg-white/50 dark:bg-background-dark/50 backdrop-blur-md px-6 md:px-20 py-4 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="text-primary">
            <span className="material-symbols-outlined text-3xl">auto_stories</span>
          </div>
          <div>
            <h2 className="text-lg font-bold leading-tight tracking-tight text-slate-900 dark:text-slate-100">
              إعداد ملف الطالب
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              تخصيص تجربتك التعليمية
            </p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="relative flex items-center justify-center w-14 h-14">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                className="text-slate-200 dark:text-slate-700"
                cx="28"
                cy="28"
                fill="transparent"
                r="24"
                stroke="currentColor"
                strokeWidth="4"
              />
              <circle
                className="text-primary"
                cx="28"
                cy="28"
                fill="transparent"
                r="24"
                stroke="currentColor"
                strokeDasharray={150.79}
                strokeDashoffset={150.79 - (getProgressPercentage() / 100) * 150.79}
                strokeWidth="4"
              />
            </svg>
            <span className="absolute text-sm font-bold text-slate-900 dark:text-slate-100">
              {getStepNumber()}/{getTotalSteps()}
            </span>
          </div>
          <button 
            onClick={handleBack}
            className="flex items-center justify-center rounded-full h-10 w-10 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            aria-label="رجوع"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex justify-center py-12 px-4">
        <div className="layout-content-container flex flex-col max-w-[640px] flex-1">
          {currentStep === 'step1' && (
            <Step1Goals onNext={handleStep1Complete} onBack={handleBack} />
          )}

          {currentStep === 'step2' && (
            <Step2AgeGroup onNext={handleStep2Complete} onBack={handleBack} />
          )}

          {currentStep === 'step3' && (
            <Step3Level onNext={handleStep3Complete} onBack={handleBack} />
          )}
        </div>
      </main>
    </div>
  )
}

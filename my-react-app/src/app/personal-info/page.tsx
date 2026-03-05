'use client'

import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useAppStore } from '../../store/useAppStore'
import { isProfileComplete } from '../../models/UserModel'
import AccountTypeSelection from '../../components/forms/AccountTypeSelection'
import Step1Goals from '../../components/forms/Step1Goals'
import Step2AgeGroup from '../../components/forms/Step2AgeGroup'
import Step3Level from '../../components/forms/Step3Level'
import Step4Budget from '../../components/forms/Step4Budget'

type AccountType = 'student' | 'teacher' | null
type Step = 'account-type' | 'step1' | 'step2' | 'step3' | 'step4'

export default function PersonalInfoPage() {
  const navigate = useNavigate()
  const { user, userProfile, saveUserProfile } = useAuth()
  const { formData, updateFormData, resetFormData } = useAppStore()
  const [accountType, setAccountType] = useState<AccountType>(null)
  const [currentStep, setCurrentStep] = useState<Step>('account-type')

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    // If profile is already complete, redirect to dashboard
    if (userProfile && isProfileComplete(userProfile)) {
      navigate('/dashboard')
      return
    }

    // Check if user has already selected account type
    if (userProfile?.accountType) {
      setAccountType(userProfile.accountType as AccountType)
      if (userProfile.accountType === 'student') {
        setCurrentStep('step1')
      } else {
        // Teacher flow - redirect to teacher application
        navigate('/teacher-application')
      }
    }
  }, [user, userProfile, navigate])

  const handleAccountTypeSelect = async (type: AccountType) => {
    setAccountType(type)
    if (type === 'student') {
      setCurrentStep('step1')
      // Save account type to profile
      if (user) {
        try {
          await saveUserProfile({ accountType: type })
        } catch (error) {
          console.error('Error saving account type:', error)
        }
      }
    } else {
      // Teacher flow - navigate to teacher application
      navigate('/teacher-application')
    }
  }

  const handleStep1Complete = () => {
    setCurrentStep('step2')
  }

  const handleStep2Complete = () => {
    setCurrentStep('step3')
  }

  const handleStep3Complete = () => {
    setCurrentStep('step4')
  }

  const handleStep4Complete = async () => {
    // Save all form data to user profile
    const profileData = {
      ...formData,
      accountType: 'student' as const,
      completed: true,
      firstName: user?.displayName?.split(' ')[0] || '',
      lastName: user?.displayName?.split(' ').slice(1).join(' ') || '',
      email: user?.email || '',
    }
    
    await saveUserProfile(profileData)
    resetFormData()
    
    // Redirect to profile with user ID
    if (user?.uid) {
      navigate(`/profile/${user.uid}`)
    } else {
      navigate('/profile')
    }
  }

  const handleBack = () => {
    if (currentStep === 'step4') {
      setCurrentStep('step3')
    } else if (currentStep === 'step3') {
      setCurrentStep('step2')
    } else if (currentStep === 'step2') {
      setCurrentStep('step1')
    } else if (currentStep === 'step1') {
      setCurrentStep('account-type')
    }
  }

  if (!user) {
    return null
  }

  const getStepNumber = () => {
    if (currentStep === 'step1') return 1
    if (currentStep === 'step2') return 2
    if (currentStep === 'step3') return 2
    if (currentStep === 'step4') return 3
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

  if (currentStep === 'account-type') {
    return <AccountTypeSelection onSelect={handleAccountTypeSelect} />
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

          {currentStep === 'step4' && (
            <Step4Budget onComplete={handleStep4Complete} onBack={handleBack} />
          )}
        </div>
      </main>
    </div>
  )
}

'use client'

import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import TeacherStep1 from '../../components/forms/teacher/TeacherStep1'
import TeacherStep2 from '../../components/forms/teacher/TeacherStep2'
import TeacherStep3 from '../../components/forms/teacher/TeacherStep3'

type TeacherStep = 'step1' | 'step2' | 'step3'

export default function TeacherApplicationPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState<TeacherStep>('step1')
  const [teacherFormData, setTeacherFormData] = useState({
    // Step 1
    fullName: '',
    email: '',
    phone: '',
    countryCode: '+966',
    gender: '',
    nationality: '',
    yearsOfExperience: 0,
    // Step 2
    educationLevel: '',
    certificates: [] as File[],
    // Step 3
    bio: '',
    subjects: [] as string[],
    hourlyRate: 0,
    currency: 'USD',
  })

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
  }, [user, navigate])

  const handleStep1Complete = (data: Partial<typeof teacherFormData>) => {
    setTeacherFormData(prev => ({ ...prev, ...data }))
    setCurrentStep('step2')
  }

  const handleStep2Complete = (data: Partial<typeof teacherFormData>) => {
    setTeacherFormData(prev => ({ ...prev, ...data }))
    setCurrentStep('step3')
  }

  const handleStep3Complete = async (data: Partial<typeof teacherFormData>) => {
    const finalData = { ...teacherFormData, ...data }
    
    // TODO: Save to backend
    console.log('Submitting teacher application:', finalData)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Navigate to review page
    navigate('/teacher-application/review')
  }

  const handleBack = () => {
    if (currentStep === 'step3') {
      setCurrentStep('step2')
    } else if (currentStep === 'step2') {
      setCurrentStep('step1')
    } else if (currentStep === 'step1') {
      navigate('/personal-info')
    }
  }

  const getProgressPercentage = () => {
    if (currentStep === 'step1') return 33
    if (currentStep === 'step2') return 66
    return 100
  }

  if (!user) {
    return null
  }

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-primary/10 bg-white dark:bg-slate-900 px-4 md:px-20 py-4 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg text-primary">
            <span className="material-symbols-outlined text-2xl">school</span>
          </div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {currentStep === 'step1' && 'طلب انضمام معلم'}
            {currentStep === 'step2' && 'طلب تقديم معلم'}
            {currentStep === 'step3' && 'إكمال الملف الشخصي للمدرس'}
          </h2>
        </div>
        <div className="flex items-center gap-4">
          {currentStep === 'step2' && (
            <button className="flex size-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              <span className="material-symbols-outlined">notifications</span>
            </button>
          )}
          <button 
            onClick={handleBack}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            aria-label="رجوع"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex justify-center py-8 px-4">
        <div className="max-w-[800px] w-full flex flex-col gap-8">
          {currentStep === 'step1' && (
            <TeacherStep1 
              formData={teacherFormData}
              onNext={handleStep1Complete}
              onBack={handleBack}
            />
          )}

          {currentStep === 'step2' && (
            <TeacherStep2 
              formData={teacherFormData}
              onNext={handleStep2Complete}
              onBack={handleBack}
            />
          )}

          {currentStep === 'step3' && (
            <TeacherStep3 
              formData={teacherFormData}
              allFormData={teacherFormData}
              onComplete={handleStep3Complete}
              onBack={handleBack}
            />
          )}
        </div>
      </main>
    </div>
  )
}

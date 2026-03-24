'use client'

import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useAppStore } from '../../store/useAppStore'
import { teacherApplicationApi } from '../../services/teacherApplicationApi'
import TeacherStep1 from '../../components/forms/teacher/TeacherStep1'
import TeacherStep2Combined from '../../components/forms/teacher/TeacherStep2Combined'
import TeacherStep3 from '../../components/forms/teacher/TeacherStep3'

type TeacherStep = 'step1' | 'step2' | 'step3'

export default function TeacherApplicationPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { addToast } = useAppStore()
  const [currentStep, setCurrentStep] = useState<TeacherStep>('step1')
  const [teacherFormData, setTeacherFormData] = useState({
    // Step 1
    fullName: '',
    email: '',
    phone: '',
    countryCode: '+20',
    gender: '',
    nationality: '',
    yearsOfExperience: 0,
    languages: [] as string[],
    title: '',
    // Step 2 (combined: education + bio + subjects + pricing)
    educationLevel: '',
    certificates: [] as File[],
    bio: '',
    introVideo: '' as string | undefined,
    ijazahs: [] as Array<{ title: string; description: string; image: string }>,
    // Teaching offer
    subjects: [] as string[],
    hourlyRate: 0,
    currency: 'SAR',
  })

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
  }, [user, navigate])

  // Load draft + resume step
  useEffect(() => {
    if (!user) return

    const loadDraft = async () => {
      try {
        const draft = await teacherApplicationApi.getMyApplication()
        if (!draft) return

        setTeacherFormData(prev => ({
          ...prev,
          ...(draft.step1 || {}),
          ...(draft.step2 || {}),
        }))

        if (draft.currentStep === 'review' || draft.currentStep === 'submitted') {
          setCurrentStep('step3')
        } else if (draft.currentStep === 'step2') {
          setCurrentStep('step2')
        } else {
          setCurrentStep('step1')
        }
      } catch (e) {
        // non-blocking
        console.error('Failed to load teacher application draft:', e)
      }
    }

    void loadDraft()
  }, [user])

  const handleStep1Complete = (data: Partial<typeof teacherFormData>) => {
    const merged = { ...teacherFormData, ...data }

    // Basic validation (UI also validates inside TeacherStep1; backend validates too)
    if (!merged.fullName || merged.fullName.trim().length < 3) {
      addToast('يرجى إدخال الاسم الكامل بشكل صحيح', 'error')
      return
    }
    if (!merged.countryCode) {
      addToast('يرجى اختيار كود الدولة', 'error')
      return
    }
    const phone = (merged.phone || '').toString().replace(/\s/g, '')
    if (!/^\d{7,15}$/.test(phone)) {
      addToast('يرجى إدخال رقم جوال صحيح', 'error')
      return
    }
    if (!merged.gender) {
      addToast('يرجى اختيار النوع', 'error')
      return
    }
    if (!merged.nationality) {
      addToast('يرجى اختيار الجنسية', 'error')
      return
    }
    if (!Array.isArray(merged.languages) || merged.languages.length === 0) {
      addToast('يرجى اختيار لغة واحدة على الأقل', 'error')
      return
    }

    setTeacherFormData(merged)

    // Save step1 draft to backend and move to step2
    void (async () => {
      try {
        await teacherApplicationApi.saveStep1({
          fullName: merged.fullName,
          email: merged.email,
          phone: merged.phone,
          countryCode: merged.countryCode,
          gender: merged.gender,
          nationality: merged.nationality,
          yearsOfExperience: merged.yearsOfExperience,
          languages: merged.languages,
          title: merged.title,
        })
        addToast('تم حفظ بيانات الخطوة الأولى', 'success')
        setCurrentStep('step2')
      } catch (e) {
        console.error('Failed to save step1 draft:', e)
        addToast('حدث خطأ أثناء حفظ بيانات الخطوة الأولى', 'error')
      }
    })()
  }

  const handleStep2Complete = async (data: Partial<typeof teacherFormData>) => {
    setTeacherFormData(prev => ({ ...prev, ...data }))
    setCurrentStep('step3')
  }

  const handleStep3Complete = async (data: Partial<typeof teacherFormData>) => {
    setTeacherFormData(prev => ({ ...prev, ...data }))
    navigate('/teacher-application/review')
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

  const handleLogout = async () => {
    await logout()
    navigate('/', { replace: true })
  }

  const getProgressPercentage = () => {
    if (currentStep === 'step1') return 50
    if (currentStep === 'step2') return 75
    return 100
  }

  if (!user) {
    return null
  }

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between whitespace-nowrap bg-transparent px-6 md:px-20 py-6 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="size-10 flex items-center justify-center rounded-lg bg-primary text-white">
              <span className="material-symbols-outlined text-2xl">school</span>
            </div>
            <h2 className="text-text-main dark:text-slate-100 text-xl font-bold leading-tight tracking-tight">
              قرآن أونلاين
            </h2>
          </div>
          <div className="hidden md:block h-8 w-[1px] bg-slate-200 dark:bg-slate-700"></div>
          <h2 className="hidden md:block text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
            طلب انضمام معلم
          </h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-700"></div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm font-medium text-text-secondary dark:text-slate-300 hover:text-primary transition-colors"
            aria-label="تسجيل الخروج"
          >
            <span>تسجيل الخروج</span>
            <span className="material-symbols-outlined text-[20px]">logout</span>
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
            <TeacherStep2Combined
              formData={teacherFormData}
              allFormData={teacherFormData}
              onComplete={handleStep2Complete}
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

'use client'

import React, { useEffect, useState } from "react";
import { useAuth } from '../../../contexts/AuthContext';
import { teacherApplicationApi } from '../../../services/teacherApplicationApi';
import type { Benefit, SessionContentItem } from '../../../app/teacher-profile/types';
import { stringifyBenefits, stringifySessionContent, parseBenefitsFromJSON, parseSessionContentFromJSON } from '../../../app/teacher-profile/utils/dataParsing';
import { useProfileManager } from '../../../hooks/useProfileManager';

interface TeacherStep3Props {
  formData: {
    subjects: string[]
    hourlyRate: number
    currency: string
  }
  // Optional: All form data from previous steps
  allFormData?: {
    fullName?: string
    email?: string
    phone?: string
    countryCode?: string
    gender?: string
    nationality?: string
    yearsOfExperience?: number
    educationLevel?: string
    certificates?: File[]
    languages?: string[]
    title?: string
  }
  onComplete: (data: Partial<TeacherStep3Props['formData']>) => void
  onBack: () => void
}

const availableSubjects = ['حفظ القرآن', 'تجويد', 'قراءات', 'تفسير']

export default function TeacherStep3({ formData, allFormData, onComplete, onBack }: TeacherStep3Props) {
  const [localData, setLocalData] = useState(formData)
  const [benefits, setBenefits] = useState<Benefit[]>([])
  const [sessionContentItems, setSessionContentItems] = useState<SessionContentItem[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)
  const { user, saveUserProfile } = useAuth()
  const { updateAccountType } = useProfileManager()

  const validateForm = () => {
    // Minimum and maximum reasonable hourly rate (e.g. between 5 and 500)
    if (!localData.hourlyRate || localData.hourlyRate <= 0) {
      return 'يرجى إدخال سعر ساعة أكبر من صفر'
    }
    if (localData.hourlyRate > 500) {
      return 'سعر الساعة المدخل مرتفع جداً، يرجى اختيار قيمة منطقية أقل من 500'
    }
    if (!localData.subjects || localData.subjects.length === 0) {
      return 'يرجى اختيار مادة تعليمية واحدة على الأقل'
    }
    return null
  }

  useEffect(() => {
    const loadDraft = async () => {
      if (!user) return
      try {
        const draft = await teacherApplicationApi.getMyApplication()
        if (draft?.step2?.teachingStyle) {
          setBenefits(parseBenefitsFromJSON(draft.step2.teachingStyle))
        }
        if (draft?.step2?.sessionContent) {
          setSessionContentItems(parseSessionContentFromJSON(draft.step2.sessionContent))
        }
      } catch (e) {
        // non-blocking
        console.error('Failed to load draft in step3:', e)
      }
    }
    void loadDraft()
  }, [user])

  const addBenefit = () => {
    if (benefits.length >= 3) {
      setValidationError('يمكن إضافة ثلاث فوائد كحد أقصى')
      return
    }
    setBenefits([...benefits, { title: '', subject: '' }])
  }
  const updateBenefit = (index: number, field: 'title' | 'subject', value: string) => {
    const updated = [...benefits]
    updated[index] = { ...updated[index], [field]: value }
    setBenefits(updated)
  }
  const deleteBenefit = (index: number) => {
    setBenefits(benefits.filter((_, i) => i !== index))
  }

  const addSessionContentItem = () => {
    setSessionContentItems([...sessionContentItems, { title: '', subject: '' }])
  }
  const updateSessionContentItem = (index: number, field: 'title' | 'subject', value: string) => {
    const updated = [...sessionContentItems]
    updated[index] = { ...updated[index], [field]: value }
    setSessionContentItems(updated)
  }
  const deleteSessionContentItem = (index: number) => {
    setSessionContentItems(sessionContentItems.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      setSubmitError('يجب تسجيل الدخول أولاً')
      return
    }

    const validationMessage = validateForm()
    if (validationMessage) {
      setValidationError(validationMessage)
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)
    setValidationError(null)

    try {
      const validBenefits = benefits.filter(b => b.title.trim() && b.subject.trim())
      const validSessionContent = sessionContentItems.filter(i => i.title.trim() && i.subject.trim())

      // First, get existing application to preserve educationLevel and bio
      const existingApp = await teacherApplicationApi.getMyApplication()
      
      // Save remaining step2 fields to backend draft, preserving existing educationLevel and bio
      await teacherApplicationApi.saveStep2({
        // Preserve existing required fields from Step2
        educationLevel: existingApp?.step2?.educationLevel || '',
        bio: existingApp?.step2?.bio || '',
        // Update fields from Step3
        subjects: localData.subjects,
        hourlyRate: localData.hourlyRate,
        currency: localData.currency,
        teachingStyle: validBenefits.length > 0 ? stringifyBenefits(validBenefits) : '',
        sessionContent: validSessionContent.length > 0 ? stringifySessionContent(validSessionContent) : '',
      } as any)
      
      // Update user profile with accountType
      // تحديث ملف المستخدم بنوع الحساب
      try {
        await saveUserProfile({ 
          accountType: 'teacher',
          firstName: allFormData?.fullName?.split(' ')[0] || '',
          lastName: allFormData?.fullName?.split(' ').slice(1).join(' ') || '',
          email: user.email || allFormData?.email || '',
        })

        // Ensure backend role is teacher (required for /teachers/me/* endpoints)
        await updateAccountType('teacher', { roleAlso: true });

        // Submit application (sets Teacher.approvalStatus => pending)
        await teacherApplicationApi.submit();
      } catch (profileError) {
        console.error('Error updating user profile:', profileError)
        // لا نفشل العملية بالكامل إذا فشل تحديث الملف، لكن نخبر المستخدم
        setSubmitError('تم استلام طلبك بنجاح، لكن حدث خطأ في تحديث ملفك الشخصي. سيتم مراجعة حالتك من قبل فريق الدعم.')
      }
      
      // Call onComplete callback
      onComplete(localData)
    } catch (error) {
      console.error('Error submitting teacher application:', error)
      setSubmitError('حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleSubject = (subject: string) => {
    setLocalData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
    }))
  }

  return (
    <>
      {/* Progress Section */}
      <div className="flex flex-col items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-primary/5">
        <div 
          className="relative flex h-20 w-20 items-center justify-center rounded-full"
          style={{
            background: 'radial-gradient(closest-side, white 79%, transparent 80% 100%), conic-gradient(#d5aa2a 100%, #e5e7eb 0)'
          }}
        >
          <span className="text-xl font-bold text-primary">3/3</span>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-slate-900 dark:text-slate-100">الخطوة الأخيرة</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">السيرة الذاتية واختيار المواد التعليمية</p>
        </div>
      </div>

      {/* Subjects Selection */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">auto_stories</span>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">المواد التي تدرسها</h3>
        </div>
        <div className="flex flex-wrap gap-3">
          {availableSubjects.map((subject) => (
            <button
              key={subject}
              type="button"
              onClick={() => toggleSubject(subject)}
              className={`flex items-center gap-2 px-6 py-2 rounded-full border-2 font-bold transition-all ${
                localData.subjects.includes(subject)
                  ? 'border-primary bg-primary text-white'
                  : 'border-primary/20 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-primary/50'
              }`}
            >
              {localData.subjects.includes(subject) && (
                <span className="material-symbols-outlined text-sm">check</span>
              )}
              {subject}
            </button>
          ))}
          <button
            type="button"
            className="flex items-center gap-2 px-6 py-2 rounded-full border-2 border-dashed border-primary/30 text-primary hover:bg-primary/5 transition-all"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            مادة أخرى
          </button>
        </div>
      </section>

      {/* Rate Preference */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">payments</span>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">تفضيلات السعر</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              سعر الجلسة المقترح (ساعة)
            </label>
            <div className="relative">
              <input
                type="number"
                value={localData.hourlyRate || ''}
                onChange={(e) => setLocalData(prev => ({ ...prev, hourlyRate: parseFloat(e.target.value) || 0 }))}
                className="w-full rounded-lg border-primary/20 bg-white dark:bg-slate-800 p-3 pr-10 focus:border-primary focus:ring-1 focus:ring-primary text-slate-900 dark:text-slate-100"
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">العملة المفضلة</label>
            <select
              value={localData.currency}
              onChange={(e) => setLocalData(prev => ({ ...prev, currency: e.target.value }))}
              className="w-full rounded-lg border-primary/20 bg-white dark:bg-slate-800 p-3 focus:border-primary focus:ring-1 focus:ring-primary text-slate-900 dark:text-slate-100"
            >
              <option value="USD">دولار أمريكي (USD)</option>
              <option value="SAR">ريال سعودي (SAR)</option>
              <option value="EGP">جنيه مصري (EGP)</option>
            </select>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">emoji_events</span>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            ما الثمار التي سيجنيها الطالب؟ <span className="text-slate-400 dark:text-slate-500 text-sm font-normal">(اختياري)</span>
          </h3>
        </div>
        <div className="space-y-4">
          {benefits.map((b, index) => (
            <div key={index} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg space-y-3 bg-white dark:bg-slate-800">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={b.title}
                  onChange={(e) => updateBenefit(index, 'title', e.target.value)}
                  placeholder="عنوان الفائدة"
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-slate-900 dark:text-slate-100 font-bold"
                />
                <input
                  type="text"
                  value={b.subject}
                  onChange={(e) => updateBenefit(index, 'subject', e.target.value)}
                  placeholder="وصف الفائدة"
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-slate-900 dark:text-slate-100"
                />
              </div>
              <button type="button" onClick={() => deleteBenefit(index)} className="text-red-500 text-sm hover:underline flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">delete</span>
                حذف
              </button>
            </div>
          ))}
          {benefits.length === 0 && (
            <p className="text-slate-500 text-sm text-center py-4">لا توجد فوائد. يمكنك إضافة فوائد يكتسبها الطالب من دراسته معك.</p>
          )}
          <div className="flex justify-center pt-2">
            <button
              type="button"
              onClick={addBenefit}
              disabled={benefits.length >= 3}
              className="px-6 py-3 bg-primary text-slate-900 font-bold rounded-lg hover:brightness-110 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined">add</span>
              {benefits.length >= 3 ? 'تم الوصول للحد الأقصى (3 فوائد)' : 'إضافة فائدة'}
            </button>
          </div>
        </div>
      </section>

      {/* Session Content Section */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">menu_book</span>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            ماذا تتضمن الحصة؟ <span className="text-slate-400 dark:text-slate-500 text-sm font-normal">(اختياري)</span>
          </h3>
        </div>
        <div className="space-y-4">
          {sessionContentItems.map((i, index) => (
            <div key={index} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg space-y-3 bg-white dark:bg-slate-800">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={i.title}
                  onChange={(e) => updateSessionContentItem(index, 'title', e.target.value)}
                  placeholder="عنوان العنصر"
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-slate-900 dark:text-slate-100 font-bold"
                />
                <input
                  type="text"
                  value={i.subject}
                  onChange={(e) => updateSessionContentItem(index, 'subject', e.target.value)}
                  placeholder="وصف العنصر"
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-slate-900 dark:text-slate-100"
                />
              </div>
              <button type="button" onClick={() => deleteSessionContentItem(index)} className="text-red-500 text-sm hover:underline flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">delete</span>
                حذف
              </button>
            </div>
          ))}
          {sessionContentItems.length === 0 && (
            <p className="text-slate-500 text-sm text-center py-4">لا توجد عناصر. يمكنك إضافة ما تتضمنه الحصة من أنشطة ومحتوى.</p>
          )}
          <div className="flex justify-center pt-2">
            <button type="button" onClick={addSessionContentItem} className="px-6 py-3 bg-primary text-slate-900 font-bold rounded-lg hover:brightness-110 transition-all flex items-center gap-2">
              <span className="material-symbols-outlined">add</span>
              إضافة عنصر
            </button>
          </div>
        </div>
      </section>

      {/* Footer Actions */}
      <div className="flex flex-col gap-4 pt-6 border-t border-primary/10">
        <div className="flex items-center gap-3 bg-primary/5 p-4 rounded-lg">
          <span className="material-symbols-outlined text-primary">info</span>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            بضغطك على إرسال الطلب، فإنك توافق على شروط الخدمة وسياسة الخصوصية الخاصة بالمنصة التعليمية. 
            سيتم مراجعة طلبك خلال 48 ساعة.
          </p>
        </div>
        {validationError && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-300">{validationError}</p>
          </div>
        )}
        {submitError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-sm text-red-600 dark:text-red-400">{submitError}</p>
          </div>
        )}
        <div className="flex flex-col md:flex-row gap-3">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <span className="material-symbols-outlined animate-spin">sync</span>
                جاري الإرسال...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">send</span>
                إرسال الطلب
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onBack}
            className="px-8 py-4 rounded-xl border-2 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined">arrow_forward</span>
            رجوع
          </button>
        </div>
      </div>
    </>
  )
}

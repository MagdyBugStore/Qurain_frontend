'use client'

import React, { useState } from "react";
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { useAuth } from '../../../contexts/AuthContext';

interface TeacherStep3Props {
  formData: {
    bio: string
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
  }
  onComplete: (data: Partial<TeacherStep3Props['formData']>) => void
  onBack: () => void
}

const availableSubjects = ['حفظ القرآن', 'تجويد', 'قراءات', 'تفسير']

export default function TeacherStep3({ formData, allFormData, onComplete, onBack }: TeacherStep3Props) {
  const [localData, setLocalData] = useState(formData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const { user, saveUserProfile } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      setSubmitError('يجب تسجيل الدخول أولاً')
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      // Combine all form data
      const teacherApplicationData = {
        // Step 1 data
        fullName: allFormData?.fullName || '',
        email: allFormData?.email || user.email || '',
        phone: allFormData?.phone || '',
        countryCode: allFormData?.countryCode || '+966',
        gender: allFormData?.gender || '',
        nationality: allFormData?.nationality || '',
        yearsOfExperience: allFormData?.yearsOfExperience || 0,
        
        // Step 2 data
        educationLevel: allFormData?.educationLevel || '',
        certificatesCount: allFormData?.certificates?.length || 0,
        
        // Step 3 data
        bio: localData.bio,
        subjects: localData.subjects,
        hourlyRate: localData.hourlyRate,
        currency: localData.currency,
        
        // Metadata
        userId: user.uid,
        userEmail: user.email,
        status: 'pending', // pending, approved, rejected
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }

      // Save to Firestore
      const docRef = await addDoc(collection(db, 'teacherApplications'), teacherApplicationData)
      
      console.log('Teacher application submitted successfully with ID:', docRef.id)
      
      // Update user profile with accountType
      // تحديث ملف المستخدم بنوع الحساب
      try {
        await saveUserProfile({ 
          accountType: 'teacher',
          firstName: allFormData?.fullName?.split(' ')[0] || user.displayName?.split(' ')[0] || '',
          lastName: allFormData?.fullName?.split(' ').slice(1).join(' ') || user.displayName?.split(' ').slice(1).join(' ') || '',
          email: user.email || allFormData?.email || '',
        })
        console.log('User profile updated with accountType: teacher')
      } catch (profileError) {
        console.error('Error updating user profile:', profileError)
        // Don't fail the whole submission if profile update fails
        // لا تفشل العملية بالكامل إذا فشل تحديث الملف
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

      {/* Bio Section */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">history_edu</span>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">أخبرنا عن خبرتك التعليمية</h3>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            السيرة الذاتية والخبرة التدريسية
          </label>
          <textarea
            value={localData.bio}
            onChange={(e) => setLocalData(prev => ({ ...prev, bio: e.target.value }))}
            className="w-full min-h-[160px] rounded-lg border-primary/20 bg-white dark:bg-slate-800 p-4 text-base focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-slate-400 text-slate-900 dark:text-slate-100"
            placeholder="اكتب نبذة عن مسيرتك التعليمية، إنجازاتك، والشهادات التي حصلت عليها..."
            required
          />
          <p className="text-xs text-slate-400">
            ساعد الطلاب في التعرف عليك بشكل أفضل من خلال وصف تفصيلي.
          </p>
        </div>
      </section>

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

      {/* Footer Actions */}
      <div className="flex flex-col gap-4 pt-6 border-t border-primary/10">
        <div className="flex items-center gap-3 bg-primary/5 p-4 rounded-lg">
          <span className="material-symbols-outlined text-primary">info</span>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            بضغطك على إرسال الطلب، فإنك توافق على شروط الخدمة وسياسة الخصوصية الخاصة بالمنصة التعليمية. 
            سيتم مراجعة طلبك خلال 48 ساعة.
          </p>
        </div>
        {submitError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-sm text-red-600 dark:text-red-400">{submitError}</p>
          </div>
        )}
        <div className="flex flex-col md:flex-row gap-3">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !localData.bio || localData.subjects.length === 0}
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
            className="px-8 py-4 rounded-xl border-2 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
          >
            حفظ كمسودة
          </button>
        </div>
      </div>
    </>
  )
}

'use client'

import React, { useState } from "react";
import Input from '../Input'
import Select from '../Select'

interface TeacherStep1Props {
  formData: {
    fullName: string
    email: string
    phone: string
    countryCode: string
    gender: string
    nationality: string
    yearsOfExperience: number
    languages: string[]
    title: string
  }
  onNext: (data: Partial<TeacherStep1Props['formData']>) => void
  onBack: () => void
}

const countryCodes = [
  { value: '+966', label: '+966 (السعودية)', flag: '🇸🇦' },
  { value: '+971', label: '+971 (الإمارات)', flag: '🇦🇪' },
  { value: '+965', label: '+965 (الكويت)', flag: '🇰🇼' },
  { value: '+974', label: '+974 (قطر)', flag: '🇶🇦' },
  { value: '+973', label: '+973 (البحرين)', flag: '🇧🇭' },
  { value: '+968', label: '+968 (عمان)', flag: '🇴🇲' },
  { value: '+20', label: '+20 (مصر)', flag: '🇪🇬' },
  { value: '+962', label: '+962 (الأردن)', flag: '🇯🇴' },
  { value: '+961', label: '+961 (لبنان)', flag: '🇱🇧' },
  { value: '+963', label: '+963 (سوريا)', flag: '🇸🇾' },
  { value: '+964', label: '+964 (العراق)', flag: '🇮🇶' },
  { value: '+212', label: '+212 (المغرب)', flag: '🇲🇦' },
  { value: '+213', label: '+213 (الجزائر)', flag: '🇩🇿' },
  { value: '+216', label: '+216 (تونس)', flag: '🇹🇳' },
  { value: '+218', label: '+218 (ليبيا)', flag: '🇱🇾' },
  { value: '+967', label: '+967 (اليمن)', flag: '🇾🇪' },
  { value: '+249', label: '+249 (السودان)', flag: '🇸🇩' },
  { value: '+1', label: '+1 (الولايات المتحدة/كندا)', flag: '🇺🇸' },
  { value: '+44', label: '+44 (المملكة المتحدة)', flag: '🇬🇧' },
  { value: '+33', label: '+33 (فرنسا)', flag: '🇫🇷' },
  { value: '+49', label: '+49 (ألمانيا)', flag: '🇩🇪' },
  { value: '+90', label: '+90 (تركيا)', flag: '🇹🇷' },
  { value: '+91', label: '+91 (الهند)', flag: '🇮🇳' },
  { value: '+86', label: '+86 (الصين)', flag: '🇨🇳' },
]

const availableLanguages = [
  { value: 'العربية', label: 'العربية' },
  { value: 'الإنجليزية', label: 'الإنجليزية' },
  { value: 'الفرنسية', label: 'الفرنسية' },
  { value: 'الألمانية', label: 'الألمانية' },
  { value: 'التركية', label: 'التركية' },
  { value: 'الأردية', label: 'الأردية' },
]

export default function TeacherStep1({ formData, onNext, onBack }: TeacherStep1Props) {
  const [localData, setLocalData] = useState({
    ...formData,
    countryCode: formData.countryCode || '+20',
    languages: formData.languages || [],
    title: formData.title || '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Validate full name
    if (!localData.fullName || localData.fullName.trim().length === 0) {
      newErrors.fullName = 'الاسم الكامل مطلوب'
    } else if (localData.fullName.trim().length < 3) {
      newErrors.fullName = 'الاسم يجب أن يكون على الأقل 3 أحرف'
    }

    // Validate country code
    if (!localData.countryCode || localData.countryCode === '') {
      newErrors.countryCode = 'يرجى اختيار كود الدولة'
    }

    // Validate phone
    if (!localData.phone || localData.phone.trim().length === 0) {
      newErrors.phone = 'رقم الجوال مطلوب'
    } else {
      // Validate phone format (numbers only, 7-15 digits)
      const phoneRegex = /^\d{7,15}$/
      const cleanPhone = localData.phone.replace(/\s/g, '')
      if (!phoneRegex.test(cleanPhone)) {
        newErrors.phone = 'رقم الجوال يجب أن يكون بين 7 و 15 رقم'
      }
    }

    // Validate gender
    if (!localData.gender || localData.gender === '') {
      newErrors.gender = 'يرجى اختيار النوع'
    }

    // Validate nationality
    if (!localData.nationality || localData.nationality === '') {
      newErrors.nationality = 'يرجى اختيار الجنسية'
    }

    // Validate years of experience
    if (localData.yearsOfExperience === undefined || localData.yearsOfExperience === null) {
      newErrors.yearsOfExperience = 'سنوات الخبرة مطلوبة'
    } else if (localData.yearsOfExperience < 0) {
      newErrors.yearsOfExperience = 'سنوات الخبرة يجب أن تكون رقم موجب'
    }

    // Validate languages
    if (!localData.languages || localData.languages.length === 0) {
      newErrors.languages = 'يرجى اختيار لغة واحدة على الأقل'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onNext(localData)
    }
  }

  const handleChange = (field: keyof typeof localData, value: string | number | string[]) => {
    setLocalData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  return (
    <>
      {/* Progress Card */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-primary/5 flex flex-col md:flex-row items-center gap-8">
        <div className="relative flex items-center justify-center">
          <div 
            className="w-24 h-24 rounded-full flex items-center justify-center"
            style={{
              background: 'radial-gradient(closest-side, white 79%, transparent 80% 100%), conic-gradient(#d5aa2a 33.33%, #e4e2dc 0)'
            }}
          >
            <span className="text-xl font-bold text-primary">1/3</span>
          </div>
        </div>
        <div className="flex-1 w-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">إكمال الملف الشخصي</h3>
            <span className="text-primary font-bold">33% مكتمل</span>
          </div>
          {/* Steps Navigation */}
          <div className="flex justify-between items-center w-full relative">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 dark:bg-slate-800 -z-0"></div>
            <div className="relative z-10 flex flex-col items-center gap-2 flex-1">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                1
              </div>
              <span className="text-xs font-bold text-primary">البيانات الأساسية</span>
            </div>
            <div className="relative z-10 flex flex-col items-center gap-2 flex-1">
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 flex items-center justify-center font-bold">
                2
              </div>
              <span className="text-xs font-medium text-slate-500">المؤهلات والتفاصيل</span>
            </div>
            <div className="relative z-10 flex flex-col items-center gap-2 flex-1">
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 flex items-center justify-center font-bold">
                3
              </div>
              <span className="text-xs font-medium text-slate-500">العرض التعليمي</span>
            </div>
          </div>
        </div>
      </div>

      {/* Form Section 1: Personal Info */}
      <form onSubmit={handleSubmit}>
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-primary/5 overflow-hidden">
          <div className="bg-primary/5 px-6 py-4 border-b border-primary/10">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">person</span>
              <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">المعلومات الشخصية</h3>
            </div>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-full">
              <Input
                type="text"
                label="الاسم الكامل"
                value={localData.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                placeholder="أدخل اسمك الثلاثي كما يظهر في الهوية"
                error={errors.fullName}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                رقم الجوال
              </label>
              <div className="flex gap-2">
              <div className="flex-1">
                  <Input
                    type="tel"
                    value={localData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="50 000 0000"
                    className="text-left"
                    dir="ltr"
                    error={errors.phone}
                    required
                  />
                </div>
                <div className="">
                  <Select
                    value={localData.countryCode}
                    onChange={(e) => handleChange('countryCode', e.target.value)}
                    options={countryCodes.map(code => ({
                      value: code.value,
                      label: `${code.flag} ${code.value}`
                    }))}
                    error={errors.countryCode}
                    className="text-sm"
                  />
                </div>
               
              </div>
              {(errors.countryCode || errors.phone) && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.countryCode || errors.phone}
                </p>
              )}
            </div>
            <div>
              <Select
                label="النوع"
                value={localData.gender}
                onChange={(e) => handleChange('gender', e.target.value)}
                options={[
                  { value: '', label: 'اختر النوع' },
                  { value: 'male', label: 'ذكر' },
                  { value: 'female', label: 'أنثى' },
                ]}
                error={errors.gender}
                required
              />
            </div>
          </div>
        </div>
      </form>

      {/* Form Section 2: Professional Info */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-primary/5 overflow-hidden">
        <div className="bg-primary/5 px-6 py-4 border-b border-primary/10">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">work</span>
            <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">المعلومات المهنية</h3>
          </div>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Select
            label="الجنسية"
            value={localData.nationality}
            onChange={(e) => handleChange('nationality', e.target.value)}
            options={[
              { value: '', label: 'اختر الجنسية' },
              { value: 'sa', label: 'سعودي' },
              { value: 'eg', label: 'مصري' },
              { value: 'jo', label: 'أردني' },
              { value: 'ae', label: 'إماراتي' },
              { value: 'kw', label: 'كويتي' },
              { value: 'other', label: 'أخرى' },
            ]}
            error={errors.nationality}
            required
          />
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              سنوات الخبرة
            </label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={localData.yearsOfExperience || ''}
                onChange={(e) => handleChange('yearsOfExperience', parseInt(e.target.value) || 0)}
                placeholder="0"
                min="0"
                error={errors.yearsOfExperience}
                required
              />
              <div className="bg-slate-100 dark:bg-slate-800 h-12 px-4 flex items-center rounded-lg text-sm text-slate-600 dark:text-slate-400 font-bold">
                سنوات
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Section 3: Languages & Title */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-primary/5 overflow-hidden">
        <div className="bg-primary/5 px-6 py-4 border-b border-primary/10">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">language</span>
            <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">اللغات والعنوان المهني</h3>
          </div>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-full">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              اللغات التي تتحدث بها <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-3">
              {availableLanguages.map((lang) => (
                <button
                  key={lang.value}
                  type="button"
                  onClick={() => {
                    const newLanguages = localData.languages.includes(lang.value)
                      ? localData.languages.filter(l => l !== lang.value)
                      : [...localData.languages, lang.value];
                    handleChange('languages', newLanguages);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 font-bold transition-all ${
                    localData.languages.includes(lang.value)
                      ? 'border-primary bg-primary text-white'
                      : 'border-primary/20 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-primary/50'
                  }`}
                >
                  {localData.languages.includes(lang.value) && (
                    <span className="material-symbols-outlined text-sm">check</span>
                  )}
                  {lang.label}
                </button>
              ))}
            </div>
            {errors.languages && (
              <p className="mt-1 text-xs text-red-500">{errors.languages}</p>
            )}
          </div>
          <div className="col-span-full">
            <Input
              type="text"
              label="العنوان المهني (اختياري)"
              value={localData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="مثال: مدرس قرآن كريم وتجويد بخبرة 10 أعوام"
              error={errors.title}
            />
            <p className="mt-1 text-xs text-slate-400">
              إذا تركت هذا الحقل فارغاً، سيتم إنشاء العنوان تلقائياً بناءً على سنوات الخبرة
            </p>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex justify-between pt-4 mb-12 gap-3">
        <button
          type="button"
          onClick={onBack}
          className="px-8 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined">arrow_forward</span>
          رجوع
        </button>
        <button
          onClick={handleSubmit}
          className="bg-primary hover:bg-primary/90 text-white font-bold py-3 px-12 rounded-xl flex items-center gap-2 transition-all"
        >
          <span>التالي</span>
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
      </div>
    </>
  )
}

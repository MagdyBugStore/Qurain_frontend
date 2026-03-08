'use client'

import React, { useState } from "react";

interface TeacherStep2Props {
  formData: {
    educationLevel: string
    certificates: File[]
  }
  onNext: (data: Partial<TeacherStep2Props['formData']>) => void
  onBack: () => void
}

export default function TeacherStep2({ formData, onNext, onBack }: TeacherStep2Props) {
  const [localData, setLocalData] = useState(formData)
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ file: File; status: 'completed' | 'uploading' }>>([])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNext(localData)
  }

  const handleEducationLevelSelect = (level: string) => {
    setLocalData(prev => ({ ...prev, educationLevel: level }))
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    files.forEach(file => {
      setUploadedFiles(prev => [...prev, { file, status: 'uploading' }])
      // Simulate upload
      setTimeout(() => {
        setUploadedFiles(prev => 
          prev.map(f => f.file === file ? { ...f, status: 'completed' as const } : f)
        )
        setLocalData(prev => ({ ...prev, certificates: [...prev.certificates, file] }))
      }, 1000)
    })
  }

  const handleFileDelete = (fileToDelete: File) => {
    setUploadedFiles(prev => prev.filter(f => f.file !== fileToDelete))
    setLocalData(prev => ({ 
      ...prev, 
      certificates: prev.certificates.filter(f => f !== fileToDelete) 
    }))
  }

  return (
    <>
      {/* Progress Section */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-primary/5 flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h3 className="text-slate-900 dark:text-slate-100 text-xl font-bold">المؤهلات والشهادات</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm">الخطوة 2 من 3: يرجى رفع مستنداتك التعليمية</p>
        </div>
        {/* Circular Progress */}
        <div className="relative size-16">
          <svg className="size-full -rotate-90" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
            <circle 
              className="stroke-current text-slate-200 dark:text-slate-800" 
              cx="18" 
              cy="18"
              fill="none" 
              r="16" 
              strokeWidth="3"
            />
            <circle 
              className="stroke-current text-primary" 
              cx="18" 
              cy="18" 
              fill="none" 
              r="16"
              strokeDasharray="100" 
              strokeDashoffset="33" 
              strokeLinecap="round"
              strokeWidth="3"
            />
          </svg>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-primary font-bold text-sm">
            2/3
          </div>
        </div>
      </div>

      {/* Education Level Selection */}
      <section className="flex flex-col gap-4">
        <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold px-1">المستوى التعليمي</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { id: 'bachelor', label: 'بكالوريوس', icon: 'school' },
            { id: 'master', label: 'ماجستير', icon: 'workspace_premium' },
            { id: 'diploma', label: 'دبلوم عالي', icon: 'history_edu' },
            { id: 'phd', label: 'دكتوراه', icon: 'military_tech' },
          ].map((level) => (
            <button
              key={level.id}
              type="button"
              onClick={() => handleEducationLevelSelect(level.id)}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                localData.educationLevel === level.id
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-slate-100 dark:border-slate-800 hover:border-primary/50 text-slate-600 dark:text-slate-400'
              }`}
            >
              <span className="material-symbols-outlined mb-2">{level.icon}</span>
              <span className="text-sm font-bold">{level.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Drag & Drop Zone */}
      <section className="flex flex-col gap-4">
        <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold px-1">
          تحميل الشهادات (الإجازة) <span className="text-slate-400 dark:text-slate-500 text-sm font-normal">(اختياري)</span>
        </h2>
        <label
          className="border-2 border-dashed border-primary/30 rounded-xl p-10 flex flex-col items-center justify-center bg-primary/5 gap-3 cursor-pointer hover:bg-primary/10 transition-colors"
        >
          <input
            type="file"
            multiple
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={handleFileUpload}
            className="hidden"
          />
          <div className="size-14 rounded-full bg-primary/20 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-3xl">upload_file</span>
          </div>
          <div className="text-center">
            <p className="text-slate-900 dark:text-slate-100 font-bold">
              اسحب الملفات هنا أو اضغط للاختيار
            </p>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
              يدعم PDF, PNG, JPG (الحد الأقصى 5 ميجابايت)
            </p>
          </div>
        </label>
      </section>

      {/* File List */}
      {uploadedFiles.length > 0 && (
        <section className="flex flex-col gap-3">
          <h3 className="text-slate-700 dark:text-slate-300 text-sm font-bold px-1">الملفات المرفوعة</h3>
          <div className="flex flex-col gap-2">
            {uploadedFiles.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800"
              >
                <div className="flex items-center gap-3">
                  <span className={`material-symbols-outlined ${
                    item.file.type.includes('pdf') ? 'text-red-500' : 'text-blue-500'
                  }`}>
                    {item.file.type.includes('pdf') ? 'picture_as_pdf' : 'image'}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-none">
                      {item.file.name}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {(item.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    item.status === 'completed'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                  }`}>
                    {item.status === 'completed' ? 'مكتمل' : 'قيد الرفع'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleFileDelete(item.file)}
                    className="text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Footer Navigation Buttons */}
      <div className="flex items-center justify-between pt-8 pb-12">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 px-8 py-3 rounded-lg font-bold border-2 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <span className="material-symbols-outlined rotate-180">arrow_back</span>
          السابق
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!localData.educationLevel}
          className="flex items-center gap-2 px-12 py-3 rounded-lg font-bold bg-primary text-white shadow-lg shadow-primary/20 hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          التالي
          <span className="material-symbols-outlined rotate-180">arrow_forward</span>
        </button>
      </div>
    </>
  )
}

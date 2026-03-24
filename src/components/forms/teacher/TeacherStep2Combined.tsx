'use client'

import React, { useState, useRef, useEffect } from "react";
import { useAuth } from '../../../contexts/AuthContext';
import { useProfileManager } from '../../../hooks/useProfileManager';
import { teacherApplicationApi } from '../../../services/teacherApplicationApi';
import { uploadVideo } from '../../../services/uploadService';
import { teacherCertificatesApi, type TeacherCertificate } from '../../../services/teacherCertificatesApi';
import type { Benefit, SessionContentItem } from '../../../app/teacher-profile/types';
import { parseBenefitsFromJSON, parseSessionContentFromJSON } from '../../../app/teacher-profile/utils/dataParsing';

interface TeacherStep2CombinedProps {
  formData: {
    educationLevel: string
    certificates: File[]
    bio: string
    introVideo?: string
    subjects: string[]
    hourlyRate: number
    currency: string
    ijazahs?: Array<{
      title: string
      description: string
      image: string
    }>
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
    languages?: string[]
    title?: string
  }
  onComplete: (data: Partial<TeacherStep2CombinedProps['formData']>) => void
  onBack: () => void
}

export default function TeacherStep2Combined({ formData, allFormData, onComplete, onBack }: TeacherStep2CombinedProps) {
  const [localData, setLocalData] = useState<TeacherStep2CombinedProps['formData']>({
    ...formData,
    introVideo: formData.introVideo || undefined,
  })
  const [uploadedFiles, setUploadedFiles] = useState<
    Array<{ file: File; status: 'completed' | 'uploading'; server?: TeacherCertificate }>
  >([])
  // kept for draft parsing compatibility (teaching offer moved to Step3)
  const [benefits, setBenefits] = useState<Benefit[]>([])
  const [sessionContentItems, setSessionContentItems] = useState<SessionContentItem[]>([])
  const [ijazahs, setIjazahs] = useState<Array<{ title: string; description: string; image: string }>>(
    Array.isArray(formData.ijazahs) ? formData.ijazahs : []
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [uploadingVideo, setUploadingVideo] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [videoUploadError, setVideoUploadError] = useState<string | null>(null)
  const [localVideoPreview, setLocalVideoPreview] = useState<string | null>(null)
  const videoFileInputRef = useRef<HTMLInputElement>(null)
  const { user, saveUserProfile } = useAuth()
  const { updateAccountType } = useProfileManager()
  // Load benefits and sessionContent from draft if available
  useEffect(() => {
    const loadDraftData = async () => {
      if (!user) return
      try {
        const draft = await teacherApplicationApi.getMyApplication()
        if (draft?.step2) {
          if (draft.step2.teachingStyle) {
            const parsedBenefits = parseBenefitsFromJSON(draft.step2.teachingStyle)
            if (parsedBenefits.length > 0) {
              setBenefits(parsedBenefits)
            }
          }
          if (draft.step2.sessionContent) {
            const parsedSessionContent = parseSessionContentFromJSON(draft.step2.sessionContent)
            if (parsedSessionContent.length > 0) {
              setSessionContentItems(parsedSessionContent)
            }
          }
          if (Array.isArray(draft.step2.ijazahs) && draft.step2.ijazahs.length > 0) {
            setIjazahs(draft.step2.ijazahs)
          }
        }
      } catch (error) {
        // Non-blocking - draft may not exist yet
        console.error('Failed to load draft benefits/sessionContent:', error)
      }
    }
    void loadDraftData()
  }, [user])

  // Cleanup local video preview URL when introVideo is set from backend
  useEffect(() => {
    console.log('[Video Cleanup] useEffect triggered:', {
      introVideo: localData.introVideo,
      localVideoPreview,
      hasServerUrl: localData.introVideo && !localData.introVideo.startsWith('blob:'),
      hasLocalPreview: !!localVideoPreview
    })
    
    // If we have a server URL and a local preview, clean up the local preview
    if (localData.introVideo && localVideoPreview && !localData.introVideo.startsWith('blob:')) {
      console.log('[Video Cleanup] Cleaning up local preview:', localVideoPreview)
      // Server URL is set, clean up local preview
      URL.revokeObjectURL(localVideoPreview)
      setLocalVideoPreview(null)
      console.log('[Video Cleanup] Local preview cleaned up')
    }
  }, [localData.introVideo, localVideoPreview])

  // Cleanup local video preview URL on unmount
  useEffect(() => {
    return () => {
      if (localVideoPreview) {
        URL.revokeObjectURL(localVideoPreview)
      }
    }
  }, [localVideoPreview])

  const validateForm = () => {
    if (!localData.educationLevel || localData.educationLevel.trim() === '') {
      return 'يرجى اختيار المستوى التعليمي'
    }
    const bioTrimmed = (localData.bio || '').trim()
    if (!bioTrimmed || bioTrimmed.length < 30) {
      return 'يرجى كتابة نبذة مفصلة عن خبرتك التعليمية (لا تقل عن 30 حرفاً)'
    }
    return null
  }

  const handleEducationLevelSelect = (level: string) => {
    setLocalData(prev => ({ ...prev, educationLevel: level }))
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Clear input to allow re-selecting same files
    e.target.value = ''

    // Add optimistic items
    setUploadedFiles(prev => [...prev, ...files.map(file => ({ file, status: 'uploading' as const }))])

    try {
      const uploaded = await teacherCertificatesApi.uploadMyCertificates(files)

      // Mark completed + attach server metadata (best-effort match by originalName+size)
      setUploadedFiles(prev =>
        prev.map(item => {
          if (!files.includes(item.file)) return item
          const matched = uploaded.find(u => u.originalName === item.file.name && u.size === item.file.size)
          return { ...item, status: 'completed' as const, server: matched }
        })
      )

      // Keep local count in sync with successful uploads
      setLocalData(prev => ({ ...prev, certificates: [...prev.certificates, ...files] }))
    } catch (error) {
      console.error('Error uploading certificates:', error)
      // Remove failed optimistic items
      setUploadedFiles(prev => prev.filter(item => !files.includes(item.file)))
      setSubmitError(error instanceof Error ? error.message : 'حدث خطأ أثناء رفع الشهادات')
    }
  }

  const handleFileDelete = async (fileToDelete: File) => {
    const target = uploadedFiles.find(f => f.file === fileToDelete)
    const certificateId = target?.server?._id

    try {
      if (certificateId) {
        await teacherCertificatesApi.deleteMyCertificate(certificateId)
      }
    } catch (error) {
      console.error('Error deleting certificate:', error)
      setSubmitError(error instanceof Error ? error.message : 'حدث خطأ أثناء حذف الشهادة')
      return
    }

    setUploadedFiles(prev => prev.filter(f => f.file !== fileToDelete))
    setLocalData(prev => ({
      ...prev,
      certificates: prev.certificates.filter(f => f !== fileToDelete),
    }))
  }

  const handleVideoFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    console.log('[Video Upload] File selected:', { name: file.name, type: file.type, size: file.size })

    // Validate file type
    const validVideoTypes = ['video/mp4', 'video/webm', 'video/mov', 'video/avi', 'video/quicktime']
    if (!validVideoTypes.includes(file.type)) {
      console.error('[Video Upload] Invalid file type:', file.type)
      setVideoUploadError('نوع الملف غير مدعوم. يرجى اختيار ملف فيديو (MP4, WebM, MOV, AVI)')
      return
    }

    // Validate file size (50MB max)
    const maxSize = 50 * 1024 * 1024 // 50MB
    if (file.size > maxSize) {
      console.error('[Video Upload] File too large:', file.size)
      setVideoUploadError('حجم الملف كبير جداً. الحد الأقصى 50 ميجابايت')
      return
    }

    // Create local preview URL immediately
    const previewUrl = URL.createObjectURL(file)
    console.log('[Video Upload] Created local preview URL:', previewUrl)
    setLocalVideoPreview(previewUrl)
    setVideoUploadError(null)

    setUploadingVideo(true)
    setUploadProgress(0)

    try {
      console.log('[Video Upload] Starting upload...')
      const uploadedFile = await uploadVideo(file, (progress) => {
        console.log('[Video Upload] Progress:', progress + '%')
        setUploadProgress(progress)
      })

      console.log('[Video Upload] Upload successful:', uploadedFile.url)
      console.log('[Video Upload] Current state before update:', {
        localVideoPreview,
        introVideo: localData.introVideo
      })

      // Set the video URL from backend
      // The useEffect will handle cleaning up localVideoPreview when introVideo is set
      setLocalData(prev => {
        console.log('[Video Upload] Updating introVideo from', prev.introVideo, 'to', uploadedFile.url)
        return { ...prev, introVideo: uploadedFile.url }
      })
      setVideoUploadError(null)
    } catch (error) {
      console.error('[Video Upload] Upload failed:', error)
      setVideoUploadError(error instanceof Error ? error.message : 'حدث خطأ أثناء رفع الفيديو')
      // Keep local preview on error so user can see the video they selected
      console.log('[Video Upload] Keeping local preview due to error:', localVideoPreview)
    } finally {
      console.log('[Video Upload] Upload finished, resetting state')
      setUploadingVideo(false)
      setUploadProgress(0)
      // Reset file input
      if (videoFileInputRef.current) {
        videoFileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveVideo = () => {
    // Clean up local preview URL if exists
    if (localVideoPreview) {
      URL.revokeObjectURL(localVideoPreview)
      setLocalVideoPreview(null)
    }
    setLocalData(prev => ({ ...prev, introVideo: undefined }))
    setVideoUploadError(null)
    // Reset file input
    if (videoFileInputRef.current) {
      videoFileInputRef.current.value = ''
    }
  }

  // Teaching offer (subjects/pricing/benefits/sessionContent) moved to Step3

  // teaching offer handlers live in Step3

  // Ijazah handlers
  const addIjazah = () => {
    setIjazahs([...ijazahs, { title: '', description: '', image: '' }])
  }

  const updateIjazah = (index: number, field: 'title' | 'description' | 'image', value: string) => {
    const updated = [...ijazahs]
    updated[index] = { ...updated[index], [field]: value }
    setIjazahs(updated)
  }

  const deleteIjazah = (index: number) => {
    setIjazahs(ijazahs.filter((_, i) => i !== index))
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
      const validIjazahs = ijazahs
        .map(i => ({ ...i, title: i.title.trim(), description: i.description.trim(), image: i.image.trim() }))
        .filter(i => i.title && i.description)

      // Validate again before saving to ensure data is correct
      const bioTrimmed = (localData.bio || '').trim()
      if (!localData.educationLevel || !bioTrimmed || bioTrimmed.length < 30) {
        setValidationError('يرجى التأكد من إدخال جميع البيانات المطلوبة بشكل صحيح')
        return
      }

      // Save profile part of step2 draft to backend
      await teacherApplicationApi.saveStep2({
        educationLevel: localData.educationLevel.trim(),
        certificatesCount: localData.certificates.length,
        bio: bioTrimmed,
        introVideo: localData.introVideo,
        ijazahs: validIjazahs,
      })
      
      // Update user profile with accountType
      try {
        // 1) Update frontend user profile (store)
        await saveUserProfile({
          accountType: 'teacher',
          firstName: allFormData?.fullName?.split(' ')[0] || '',
          lastName: allFormData?.fullName?.split(' ').slice(1).join(' ') || '',
          email: user.email || allFormData?.email || '',
        });

        // 2) Ensure backend role is teacher (required for /teachers/me/* endpoints)
        await updateAccountType('teacher', { roleAlso: true });

      // 3) Do NOT submit here; submission happens in Step3
      } catch (profileError) {
        console.error('Error updating user profile:', profileError)
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

    return (
    <>
      {/* Progress Section */}
      <div className="flex flex-col items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-primary/5">
        <div 
          className="relative flex h-20 w-20 items-center justify-center rounded-full"
          style={{
            background: 'radial-gradient(closest-side, white 79%, transparent 80% 100%), conic-gradient(#d5aa2a 66.67%, #e5e7eb 0)'
          }}
        >
          <span className="text-xl font-bold text-primary">2/3</span>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-slate-900 dark:text-slate-100">الخطوة الثانية</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">المؤهلات والتفاصيل التعليمية</p>
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
              يدعم PDF, PNG, JPG (الحد الأقصى 10 ميجابايت)
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

      {/* Intro Video Section */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">videocam</span>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            فيديو تعريفي <span className="text-slate-400 dark:text-slate-500 text-sm font-normal">(اختياري)</span>
          </h3>
        </div>
        <div className="flex flex-col gap-3">
          {(localData.introVideo || localVideoPreview) ? (
            <div className="relative w-full rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800" style={{ aspectRatio: '16/9' }}>
              {(() => {
                const videoSrc = localVideoPreview || localData.introVideo
                console.log('[Video Render] Rendering video with src:', videoSrc, {
                  localVideoPreview,
                  introVideo: localData.introVideo,
                  usingLocal: !!localVideoPreview,
                  usingServer: !!localData.introVideo && !localVideoPreview
                })
                return (
                  <video
                    src={videoSrc}
                    controls
                    className="w-full h-full object-contain"
                    preload="metadata"
                  >
                    متصفحك لا يدعم تشغيل الفيديو
                  </video>
                )
              })()}
              <button
                type="button"
                onClick={handleRemoveVideo}
                disabled={uploadingVideo}
                className="absolute top-2 left-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg z-30 disabled:opacity-50 disabled:cursor-not-allowed"
                title="حذف الفيديو"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
              {uploadingVideo && (
                <div className="absolute top-2 right-2 bg-black/70 text-white px-3 py-2 rounded-lg flex items-center gap-2 z-30">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs font-bold">جاري الرفع... {Math.round(uploadProgress)}%</span>
                </div>
              )}
            </div>
          ) : (
            <div className="border-2 border-dashed border-primary/30 rounded-xl p-8 flex flex-col items-center justify-center bg-primary/5 gap-3">
              <div className="size-14 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-3xl">videocam</span>
              </div>
              <div className="text-center">
                <p className="text-slate-900 dark:text-slate-100 font-bold mb-1">
                  رفع فيديو تعريفي
                </p>
                <p className="text-slate-500 dark:text-slate-400 text-xs">
                  ساعد الطلاب في التعرف عليك بشكل أفضل من خلال فيديو تعريفي
                </p>
              </div>
            </div>
          )}
          <div>
            <input
              ref={videoFileInputRef}
              type="file"
              accept="video/mp4,video/webm,video/mov,video/avi,video/quicktime"
              onChange={handleVideoFileSelect}
              disabled={uploadingVideo}
              className="w-full text-sm text-slate-600 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-hover file:cursor-pointer disabled:opacity-50"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              الحد الأقصى: 50 ميجابايت (MP4, WebM, MOV, AVI)
            </p>
          </div>
          {uploadingVideo && (
            <div className="space-y-1">
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 text-center">
                جاري الرفع... {Math.round(uploadProgress)}%
              </p>
            </div>
          )}
          {videoUploadError && (
            <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded">
              {videoUploadError}
            </div>
          )}
        </div>
      </section>

      {/* Ijazahs Section */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">workspace_premium</span>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            الإجازات
            <span className="text-slate-400 dark:text-slate-500 text-sm font-normal">(اختياري)</span>
          </h3>
        </div>

        <div className="space-y-4">
          {ijazahs.map((ijazah, index) => (
            <div
              key={index}
              className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg space-y-3 bg-white dark:bg-slate-800"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={ijazah.title}
                  onChange={(e) => updateIjazah(index, 'title', e.target.value)}
                  placeholder="عنوان الإجازة"
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-slate-900 dark:text-slate-100 font-bold"
                />
                <input
                  type="url"
                  value={ijazah.image}
                  onChange={(e) => updateIjazah(index, 'image', e.target.value)}
                  placeholder="رابط صورة/ملف الإجازة (اختياري)"
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-slate-900 dark:text-slate-100"
                />
              </div>
              <textarea
                rows={3}
                value={ijazah.description}
                onChange={(e) => updateIjazah(index, 'description', e.target.value)}
                placeholder="وصف الإجازة"
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-slate-900 dark:text-slate-100"
              />
              <button
                type="button"
                onClick={() => deleteIjazah(index)}
                className="text-red-500 text-sm hover:underline flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">delete</span>
                حذف
              </button>
            </div>
          ))}

          {ijazahs.length === 0 && (
            <p className="text-slate-500 text-sm text-center py-4">لا توجد إجازات. يمكنك إضافة إجازة واحدة أو أكثر.</p>
          )}

          <div className="flex justify-center pt-2">
            <button
              type="button"
              onClick={addIjazah}
              className="px-6 py-3 bg-primary text-slate-900 font-bold rounded-lg hover:brightness-110 transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined">add</span>
              إضافة إجازة
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
            onClick={onBack}
            className="px-8 py-4 rounded-xl border-2 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined">arrow_forward</span>
            رجوع
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <span className="material-symbols-outlined animate-spin">sync</span>
                جاري الحفظ...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">save</span>
                حفظ والمتابعة
              </>
            )}
          </button>
        </div>
      </div>
    </>
  )
}

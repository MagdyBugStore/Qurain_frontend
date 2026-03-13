'use client'

import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import Header from '../../components/layout/Header'
import type { TeacherApplication, TeacherProfile, Qualification, Review } from '../../shared/types/teacher.types'
import { getTeacherDisplayName, getTeacherTitle, getTeacherImageUrl, getTeacherSpecialization, getTeacherQualifications } from '../../shared/utils/teacher'
import { getCurrencySymbol } from '../../shared/utils/currency'
import { TeacherService } from '../../services/teacherService'
import { PersonalInfoSection } from './components/PersonalInfoSection'
import { WalletSection } from './components/WalletSection'
import { SupportSection } from './components/SupportSection'
import { TEACHER_APPLICATION_STATUS } from '../../constants/status'
import type { Currency } from '../../shared/types/teacher.types'

type TabType = 'personal' | 'qualifications' | 'availability' | 'reviews' | 'wallet' | 'support'

export default function TeacherProfilePage() {
  const [editingStates, setEditingStates] = useState({
    personalInfo: false, // للبيانات الشخصية في aside
    about: false, // لقسم "نبذة عني وفلسفتي في التعليم"
    benefits: false,
    sessionContent: false,
    qualifications: false,
    ijazahs: false,
    availability: false,
    reviews: false
  })
  const [activeQuickTab, setActiveQuickTab] = useState<'personal' | 'wallet' | 'support' | null>('personal')
  const [activeSubTab, setActiveSubTab] = useState<'content' | 'qualifications' | 'availability' | 'reviews' | null>('content')

  // Helper function to toggle edit state for a specific section
  const toggleEdit = (section: keyof typeof editingStates) => {
    setEditingStates(prev => ({ ...prev, [section]: !prev[section] }))
  }
  const { user, userProfile } = useAuth()
  const [teacherApplication, setTeacherApplication] = useState<TeacherApplication | null>(null)
  const [teacherProfile, setTeacherProfile] = useState<TeacherProfile | null>(null)
  const [rating, setRating] = useState(0)
  const [reviewsCount, setReviewsCount] = useState(0)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [editableQualifications, setEditableQualifications] = useState<Qualification[]>([])
  const [editableIjazahs, setEditableIjazahs] = useState<Array<{ id?: string; title: string; description: string; image: string }>>([])
  const [editableAvailability, setEditableAvailability] = useState<(string | null)[][]>([])
  const [editableBenefits, setEditableBenefits] = useState<Array<{ title: string; subject: string }>>([])
  const [editableSessionContent, setEditableSessionContent] = useState<Array<{ title: string; subject: string }>>([])
  const [saving, setSaving] = useState(false)
  const [savingBenefits, setSavingBenefits] = useState(false)
  const [savingSessionContent, setSavingSessionContent] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [personalInfo, setPersonalInfo] = useState({
    teachingStyle: '',
    sessionContent: '',
    introVideo: ''
  })

  // Fetch teacher application data, profile, and ratings
  useEffect(() => {
    const fetchTeacherData = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        const teacherService = new TeacherService()

        // Fetch teacher profile data
        const profileData = await teacherService.getTeacherProfileData(user.uid)

        if (profileData.application) {
          setTeacherApplication(profileData.application)
        }

        if (profileData.profile) {
          setTeacherProfile(profileData.profile)
        }

        // Set rating and reviews
        setRating(profileData.rating)
        setReviewsCount(profileData.reviewsCount)
        setReviews(profileData.reviews || [])

        // Set qualifications
        setEditableQualifications(profileData.qualifications)

        // Set personal info fields
        if (profileData.application) {
          setPersonalInfo({
            teachingStyle: profileData.application.teachingStyle || '',
            sessionContent: profileData.application.sessionContent || '',
            introVideo: profileData.application.introVideo || ''
          })

          // Initialize benefits from teachingStyle if it's a JSON string
          if (profileData.application.teachingStyle) {
            try {
              const parsed = JSON.parse(profileData.application.teachingStyle)
              if (Array.isArray(parsed)) {
                setEditableBenefits(parsed)
              } else {
                // If not array, leave empty
                setEditableBenefits([])
              }
            } catch {
              // If not valid JSON, leave empty
              setEditableBenefits([])
            }
          } else {
            // No data from store, leave empty
            setEditableBenefits([])
          }

          // Initialize session content from sessionContent if it's a JSON string
          if (profileData.application.sessionContent) {
            try {
              const parsed = JSON.parse(profileData.application.sessionContent)
              if (Array.isArray(parsed)) {
                setEditableSessionContent(parsed)
              } else {
                // If not array, leave empty
                setEditableSessionContent([])
              }
            } catch {
              // If not valid JSON, leave empty
              setEditableSessionContent([])
            }
          } else {
            // No data from store, leave empty
            setEditableSessionContent([])
          }
        }

        // Set ijazahs
        setEditableIjazahs(profileData.ijazahs as Array<{ id: string; title: string; description: string; image: string }>)

        // Set availability
        if (profileData.availability && profileData.availability.schedule) {
          setEditableAvailability(profileData.availability.schedule)
        } else {
          // Initialize with empty schedule if not exists
          const initialAvailability: (string | null)[][] = Array(7).fill(null).map(() => Array(12).fill(null))
          setEditableAvailability(initialAvailability)
        }

      } catch (error) {
        console.error('Error fetching teacher data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTeacherData()
  }, [user])

  // Use utility functions to get teacher data (matching TeacherDetailHeader)
  const teacherName = getTeacherDisplayName(teacherProfile || userProfile, teacherApplication)
  const teacherTitle = getTeacherTitle(teacherApplication)
  const profileImage = getTeacherImageUrl(teacherProfile || userProfile)
  const specialization = getTeacherSpecialization(teacherApplication)
  const qualifications = getTeacherQualifications(teacherApplication)

  const sessionPrice = teacherApplication?.hourlyRate || 0
  const currency = getCurrencySymbol(teacherApplication?.currency)

  const isPending = teacherApplication?.status === TEACHER_APPLICATION_STATUS.PENDING
  const isApproved = teacherApplication?.status === TEACHER_APPLICATION_STATUS.APPROVED

  // Helper function to show save message
  const showSaveMessage = (message: { type: 'success' | 'error'; text: string }) => {
    setSaveMessage(message)
    setTimeout(() => setSaveMessage(null), 3000)
  }

  // Save qualifications
  const handleSaveQualifications = async () => {
    if (!teacherApplication?.id || !user) return

    setSaving(true)
    try {
      const teacherService = new TeacherService()
      await teacherService.saveQualifications(teacherApplication.id, editableQualifications)
      showSaveMessage({ type: 'success', text: 'تم حفظ المؤهلات بنجاح' })
    } catch (error) {
      console.error('Error saving qualifications:', error)
      showSaveMessage({ type: 'error', text: 'حدث خطأ أثناء حفظ المؤهلات' })
    } finally {
      setSaving(false)
    }
  }

  // Add new qualification
  const handleAddQualification = () => {
    setEditableQualifications([...editableQualifications, { title: '', institution: '', year: '' }])
  }

  // Update qualification
  const handleUpdateQualification = (index: number, field: keyof Qualification, value: string) => {
    const updated = [...editableQualifications]
    updated[index] = { ...updated[index], [field]: value }
    setEditableQualifications(updated)
  }

  // Delete qualification
  const handleDeleteQualification = (index: number) => {
    setEditableQualifications(editableQualifications.filter((_, i) => i !== index))
  }

  // Save ijazahs
  const handleSaveIjazahs = async () => {
    if (!teacherApplication?.id || !user) return

    setSaving(true)
    try {
      const teacherService = new TeacherService()
      const teacherId = teacherApplication.userId || teacherApplication.id

      // Delete removed ijazahs
      const currentIjazahs = await teacherService.getIjazahs(teacherId)
      const currentIds = currentIjazahs.map(i => i.id).filter((id): id is string => !!id)
      const newIds = editableIjazahs.filter(i => i.id).map(i => i.id!).filter((id): id is string => !!id)
      const toDelete = currentIds.filter(id => !newIds.includes(id))

      for (const id of toDelete) {
        await teacherService.deleteIjazah(id)
      }

      // Add/update ijazahs
      for (const ijazah of editableIjazahs) {
        if (ijazah.id) {
          // Update existing
          await teacherService.updateIjazah(ijazah.id, {
            title: ijazah.title,
            description: ijazah.description,
            image: ijazah.image
          })
        } else {
          // Add new
          await teacherService.saveIjazah({
            teacherId,
            title: ijazah.title,
            description: ijazah.description,
            image: ijazah.image
          })
        }
      }

      showSaveMessage({ type: 'success', text: 'تم حفظ الإجازات بنجاح' })

      // Refresh ijazahs list
      const ijazahsData = await teacherService.getIjazahs(teacherId)
      setEditableIjazahs(ijazahsData as Array<{ id: string; title: string; description: string; image: string }>)
    } catch (error) {
      console.error('Error saving ijazahs:', error)
      showSaveMessage({ type: 'error', text: 'حدث خطأ أثناء حفظ الإجازات' })
    } finally {
      setSaving(false)
    }
  }

  // Add new ijazah
  const handleAddIjazah = () => {
    setEditableIjazahs([...editableIjazahs, { title: '', description: '', image: '' }])
  }

  // Update ijazah
  const handleUpdateIjazah = (index: number, field: string, value: string) => {
    const updated = [...editableIjazahs]
    updated[index] = { ...updated[index], [field]: value }
    setEditableIjazahs(updated)
  }

  // Delete ijazah
  const handleDeleteIjazah = (index: number) => {
    setEditableIjazahs(editableIjazahs.filter((_, i) => i !== index))
  }

  // Add new benefit (only if there are no empty benefits)
  const handleAddBenefit = () => {
    // Check if there are any empty benefits
    const hasEmptyBenefits = editableBenefits.some(b => !b.title.trim() || !b.subject.trim())
    if (hasEmptyBenefits) {
      showSaveMessage({ type: 'error', text: 'يرجى إكمال الفوائد الحالية قبل إضافة فائدة جديدة' })
      return
    }
    setEditableBenefits([...editableBenefits, { title: '', subject: '' }])
  }

  // Update benefit
  const handleUpdateBenefit = (index: number, field: 'title' | 'subject', value: string) => {
    const updated = [...editableBenefits]
    updated[index] = { ...updated[index], [field]: value }
    setEditableBenefits(updated)
  }

  // Delete benefit
  const handleDeleteBenefit = (index: number) => {
    setEditableBenefits(editableBenefits.filter((_, i) => i !== index))
  }

  // Add new session content item (only if there are no empty items)
  const handleAddSessionContent = () => {
    // Check if there are any empty items
    const hasEmptyItems = editableSessionContent.some(item => !item.title.trim() || !item.subject.trim())
    if (hasEmptyItems) {
      showSaveMessage({ type: 'error', text: 'يرجى إكمال العناصر الحالية قبل إضافة عنصر جديد' })
      return
    }
    setEditableSessionContent([...editableSessionContent, { title: '', subject: '' }])
  }

  // Update session content item
  const handleUpdateSessionContent = (index: number, field: 'title' | 'subject', value: string) => {
    const updated = [...editableSessionContent]
    updated[index] = { ...updated[index], [field]: value }
    setEditableSessionContent(updated)
  }

  // Delete session content item
  const handleDeleteSessionContent = (index: number) => {
    setEditableSessionContent(editableSessionContent.filter((_, i) => i !== index))
  }

  // Save benefits only
  const handleSaveBenefits = async () => {
    if (!teacherApplication?.id || !user) {
      console.error('Cannot save: missing teacherApplication.id or user')
      return
    }

    // Filter out empty benefits before saving
    const validBenefits = editableBenefits.filter(b => b.title.trim() && b.subject.trim())

    if (validBenefits.length === 0 && editableBenefits.length > 0) {
      showSaveMessage({ type: 'error', text: 'يرجى إضافة فائدة واحدة على الأقل مع عنوان ووصف' })
      return
    }

    setSavingBenefits(true)
    try {
      const teacherService = new TeacherService()
      // Get current sessionContent and introVideo to preserve them
      const currentSessionContent = teacherApplication.sessionContent || ''
      const currentIntroVideo = teacherApplication.introVideo || personalInfo.introVideo || ''
      const benefitsJson = JSON.stringify(validBenefits)

      await teacherService.updatePersonalInfo(teacherApplication.id, {
        teachingStyle: benefitsJson,
        sessionContent: currentSessionContent,
        introVideo: currentIntroVideo
      })

      // Update local state with filtered benefits
      setEditableBenefits(validBenefits)

      // Update local state
      if (teacherApplication) {
        setTeacherApplication({
          ...teacherApplication,
          teachingStyle: benefitsJson
        })
      }

      showSaveMessage({ type: 'success', text: 'تم حفظ الفوائد بنجاح' })
      toggleEdit('benefits')
    } catch (error) {
      console.error('Error saving benefits:', error)
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ أثناء حفظ الفوائد'
      showSaveMessage({ type: 'error', text: errorMessage })
    } finally {
      setSavingBenefits(false)
    }
  }

  // Save session content only
  const handleSaveSessionContent = async () => {
    if (!teacherApplication?.id || !user) {
      console.error('Cannot save: missing teacherApplication.id or user')
      return
    }

    // Filter out empty items before saving
    const validSessionContent = editableSessionContent.filter(item => item.title.trim() && item.subject.trim())

    if (validSessionContent.length === 0 && editableSessionContent.length > 0) {
      showSaveMessage({ type: 'error', text: 'يرجى إضافة عنصر واحد على الأقل مع عنوان ووصف' })
      return
    }

    setSavingSessionContent(true)
    try {
      const teacherService = new TeacherService()
      // Get current teachingStyle and introVideo to preserve them
      const currentTeachingStyle = teacherApplication.teachingStyle || ''
      const currentIntroVideo = teacherApplication.introVideo || personalInfo.introVideo || ''
      const sessionContentJson = JSON.stringify(validSessionContent)

      await teacherService.updatePersonalInfo(teacherApplication.id, {
        teachingStyle: currentTeachingStyle,
        sessionContent: sessionContentJson,
        introVideo: currentIntroVideo
      })

      // Update local state with filtered content
      setEditableSessionContent(validSessionContent)
      if (teacherApplication) {
        setTeacherApplication({
          ...teacherApplication,
          sessionContent: sessionContentJson
        })
      }

      showSaveMessage({ type: 'success', text: 'تم حفظ محتوى الحصة بنجاح' })
      toggleEdit('sessionContent')
    } catch (error) {
      console.error('Error saving session content:', error)
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ أثناء حفظ محتوى الحصة'
      showSaveMessage({ type: 'error', text: errorMessage })
    } finally {
      setSavingSessionContent(false)
    }
  }

  // Save personal info (for about section and intro video)
  const handleSavePersonalInfo = async () => {
    if (!teacherApplication?.id || !user) {
      console.error('Cannot save: missing teacherApplication.id or user')
      return
    }

    setSaving(true)
    try {
      const teacherService = new TeacherService()
      // Get current benefits and sessionContent to preserve them
      const currentBenefits = teacherApplication.teachingStyle || ''
      const currentSessionContent = teacherApplication.sessionContent || ''

      await teacherService.updatePersonalInfo(teacherApplication.id, {
        teachingStyle: currentBenefits,
        sessionContent: currentSessionContent,
        introVideo: personalInfo.introVideo
      })

      // Update local state
      if (teacherApplication) {
        setTeacherApplication({
          ...teacherApplication,
          introVideo: personalInfo.introVideo
        })
      }

      showSaveMessage({ type: 'success', text: 'تم حفظ البيانات بنجاح' })
      toggleEdit('about')
    } catch (error) {
      console.error('Error saving personal info:', error)
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ أثناء حفظ البيانات'
      showSaveMessage({ type: 'error', text: errorMessage })
    } finally {
      setSaving(false)
    }
  }


  // Toggle availability slot
  const handleToggleAvailability = (dayIndex: number, timeIndex: number) => {
    if (isPending) return

    const updated = editableAvailability.map((day, dIdx) => {
      if (dIdx === dayIndex) {
        return day.map((slot, tIdx) => {
          if (tIdx === timeIndex) {
            // Cycle through: null -> 'available' -> null (skip 'booked' as it's set by bookings)
            if (slot === null) return 'available'
            if (slot === 'available') return null
            return slot // Keep 'booked' as is
          }
          return slot
        })
      }
      return day
    })
    setEditableAvailability(updated)
  }

  // Save availability
  const handleSaveAvailability = async () => {
    if (!teacherApplication?.id || !user) return

    setSaving(true)
    try {
      const teacherService = new TeacherService()
      const teacherId = teacherApplication.userId || teacherApplication.id

      await teacherService.saveAvailability({
        teacherId,
        schedule: editableAvailability as ('available' | 'booked' | null)[][]
      })

      showSaveMessage({ type: 'success', text: 'تم حفظ جدول التوفر بنجاح' })
    } catch (error) {
      console.error('Error saving availability:', error)
      showSaveMessage({ type: 'error', text: 'حدث خطأ أثناء حفظ جدول التوفر' })
    } finally {
      setSaving(false)
    }
  }


  // Availability schedule data
  const timeSlots = [
    '٠٨:٠٠ ص', '٠٩:٠٠ ص', '١٠:٠٠ ص', '١١:٠٠ ص',
    '١٢:٠٠ م', '٠١:٠٠ م', '٠٢:٠٠ م', '٠٣:٠٠ م',
    '٠٤:٠٠ م', '٠٥:٠٠ م', '٠٦:٠٠ م', '٠٧:٠٠ م'
  ]
  const days = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة']

  // Use editable availability, fallback to empty if not loaded
  const availability = editableAvailability.length > 0 ? editableAvailability : Array(7).fill(null).map(() => Array(12).fill(null))

  const tabs = [
    { id: 'personal' as TabType, label: 'البيانات الشخصية' },
    { id: 'qualifications' as TabType, label: 'المؤهلات والإجازات' },
    { id: 'availability' as TabType, label: 'جدول التوفر' },
    { id: 'reviews' as TabType, label: 'التقييمات' },
  ]

  if (loading) {
    return (
      <>
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-slate-600 dark:text-slate-400">جاري التحميل...</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display">
        <main className="flex-1 px-4 sm:px-6 py-6 sm:py-8 lg:px-20">
          {/* Save Message */}
          {saveMessage && (
            <div className={`mb-4 sm:mb-6 rounded-xl p-3 sm:p-4 flex items-center gap-2 sm:gap-3 ${saveMessage.type === 'success'
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
              }`}>
              <span className={`material-symbols-outlined text-lg sm:text-xl ${saveMessage.type === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                {saveMessage.type === 'success' ? 'check_circle' : 'error'}
              </span>
              <p className={`font-bold text-sm sm:text-base ${saveMessage.type === 'success'
                  ? 'text-green-900 dark:text-green-200'
                  : 'text-red-900 dark:text-red-200'
                }`}>
                {saveMessage.text}
              </p>
            </div>
          )}

          {/* Pending Status Banner */}
          {isPending && (
            <div className="mb-4 sm:mb-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
              <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 shrink-0">schedule</span>
              <div className="flex-1">
                <p className="font-bold text-sm sm:text-base text-amber-900 dark:text-amber-200">طلبك قيد المراجعة</p>
                <p className="text-xs sm:text-sm text-amber-700 dark:text-amber-300">سيتم مراجعة طلبك خلال 48 ساعة. سيتم إشعارك عند الموافقة على طلبك.</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Sidebar Column */}
            <aside className="lg:col-span-4 xl:col-span-3">
              <div className="sticky top-24 space-y-6">
                {/* Profile Card - New Design */}
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl shadow-gray-200/50 dark:shadow-slate-900/50 border border-gray-100 dark:border-slate-700 flex flex-col items-center text-center">
                  {/* Avatar Section */}
                  <div className="relative mb-6">
                    <div className="w-40 h-40 rounded-full border-4 border-primary dark:border-primary/80 p-1 shadow-inner">
                      <img
                        alt={`صورة ${teacherName}`}
                        className="w-full h-full rounded-full object-cover"
                        src={profileImage}
                      />
                    </div>
                    {isApproved && (
                      <div className="absolute bottom-2 right-4 w-6 h-6 bg-green-500 dark:bg-green-600 border-4 border-white dark:border-slate-800 rounded-full flex items-center justify-center shadow-lg">
                        <span className="material-symbols-outlined text-white text-xs font-bold leading-none">verified</span>
                      </div>
                    )}
                  </div>

                  {/* Name & Verification */}
                  <h1 className="text-2xl font-bold mb-1 flex items-center justify-center gap-2">
                    {teacherName}
                    {isApproved && (
                      <svg className="w-6 h-6 text-blue-500 dark:text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                      </svg>
                    )}
                  </h1>
                  <p className="text-gray-500 dark:text-slate-400 font-medium mb-4">{teacherTitle}</p>

                  {/* Badges & Ratings */}
                  <div className="flex flex-wrap justify-center gap-2 mb-6">
                    {teacherApplication?.yearsOfExperience && (
                      <span className="px-3 py-1 bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary rounded-full text-sm font-semibold border border-primary/20 dark:border-primary/30">
                        خبرة {teacherApplication.yearsOfExperience} سنوات
                      </span>
                    )}
                    {rating > 0 ? (
                      <div className="flex items-center gap-1 px-3 py-1 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 rounded-full text-sm font-semibold border border-yellow-100 dark:border-yellow-800">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span>{rating.toFixed(1)} ({reviewsCount} تقييم)</span>
                      </div>
                    ) : isApproved && (
                      <div className="flex items-center gap-1 px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-full text-sm font-semibold border border-slate-200 dark:border-slate-600">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span>لا توجد تقييمات بعد</span>
                      </div>
                    )}
                  </div>

                  {/* Language & Location */}
                  <div className="w-full space-y-3 mb-8 text-sm text-gray-600 dark:text-slate-400">
                    <div className="flex items-center justify-between border-b border-gray-50 dark:border-slate-700 pb-2">
                      <span className="font-medium text-gray-400 dark:text-slate-500">اللغات:</span>
                      <span className="font-semibold text-slate-900 dark:text-white">العربية، الإنجليزية</span>
                    </div>
                    {teacherApplication?.nationality && (
                      <div className="flex items-center justify-between border-b border-gray-50 dark:border-slate-700 pb-2">
                        <span className="font-medium text-gray-400 dark:text-slate-500">الموقع:</span>
                        <span className="font-semibold text-slate-900 dark:text-white">{teacherApplication.nationality}</span>
                      </div>
                    )}
                    {sessionPrice > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-400 dark:text-slate-500">سعر الجلسة:</span>
                        <span className="font-bold text-primary dark:text-primary text-lg">{sessionPrice} {currency}/ساعة</span>
                      </div>
                    )}
                  </div>

                  {/* Personal Information Section */}
                  <PersonalInfoSection
                    teacherApplication={teacherApplication}
                    teacherProfile={teacherProfile}
                    userProfile={userProfile}
                    user={user}
                    teacherName={teacherName}
                    isApproved={isApproved}
                    isPending={isPending}
                    isEditing={editingStates.personalInfo}
                    onToggleEdit={() => toggleEdit('personalInfo')}
                    onSave={showSaveMessage}
                  />

                  {/* Action Button */}
                  {isApproved && (
                    <button
                      onClick={() => {
                        setActiveQuickTab('personal')
                        setActiveSubTab('content')
                        toggleEdit('about')
                      }}
                      className="w-full bg-primary hover:bg-[#e0b320] text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-primary/30 flex items-center justify-center gap-2 active:scale-95 mt-6"
                    >
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                      تعديل الملف العام
                    </button>
                  )}
                </div>

                {/* Quick Links */}
                <div className="bg-white dark:bg-background-dark border border-primary/10 rounded-xl p-6 space-y-4">
                  <h4 className="font-bold text-xs sm:text-sm text-slate-500 uppercase tracking-wider">روابط سريعة</h4>
                  <nav className="space-y-1">
                    <button
                      onClick={() => {
                        setActiveQuickTab('personal')
                        setActiveSubTab('content')
                        setTimeout(() => {
                          const element = document.getElementById('content')
                          if (element) {
                            element.scrollIntoView({ behavior: 'smooth', block: 'start' })
                          }
                        }, 100)
                      }}
                      className={`w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 rounded-lg transition-all ${activeQuickTab === 'personal'
                          ? 'bg-primary/10 text-primary'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                    >
                      <span className="material-symbols-outlined filled text-lg sm:text-xl">account_circle</span>
                      <span className="text-xs sm:text-sm font-medium">الملف الشخصي</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveQuickTab('wallet')
                        setTimeout(() => {
                          const element = document.getElementById('wallet')
                          if (element) {
                            element.scrollIntoView({ behavior: 'smooth', block: 'start' })
                          }
                        }, 100)
                      }}
                      className={`w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 rounded-lg transition-all ${activeQuickTab === 'wallet'
                          ? 'bg-primary/10 text-primary'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                    >
                      <span className="material-symbols-outlined text-lg sm:text-xl">account_balance_wallet</span>
                      <span className="text-xs sm:text-sm font-medium">إدارة المحفظة</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveQuickTab('support')
                        setTimeout(() => {
                          const element = document.getElementById('support')
                          if (element) {
                            element.scrollIntoView({ behavior: 'smooth', block: 'start' })
                          }
                        }, 100)
                      }}
                      className={`w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 rounded-lg transition-all ${activeQuickTab === 'support'
                          ? 'bg-primary/10 text-primary'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                    >
                      <span className="material-symbols-outlined text-lg sm:text-xl">support_agent</span>
                      <span className="text-xs sm:text-sm font-medium">الدعم الفني</span>
                    </button>
                  </nav>
                </div>
              </div>
            </aside>

            {/* Main Area */}
            <div className="lg:col-span-8 xl:col-span-9 space-y-4 sm:space-y-6">
              {/* Content Section - All sections displayed without tabs */}
              <section className="space-y-6 sm:space-y-8">
                {/* Sub Tabs for Personal Tab */}
                {activeQuickTab === 'personal' && (
                  <div className="bg-white dark:bg-background-dark rounded-xl p-4 border border-primary/10 shadow-sm">
                    <div className="flex flex-wrap gap-2 sm:gap-3">
                      <button
                        onClick={() => {
                          setActiveSubTab('content')
                          setTimeout(() => {
                            const element = document.getElementById('content')
                            if (element) {
                              element.scrollIntoView({ behavior: 'smooth', block: 'start' })
                            }
                          }, 100)
                        }}
                        className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg text-sm sm:text-base font-medium transition-all ${activeSubTab === 'content'
                            ? 'bg-primary text-slate-900'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                          }`}
                      >
                        المنهج
                      </button>
                      <button
                        onClick={() => {
                          setActiveSubTab('availability')
                          setTimeout(() => {
                            const element = document.getElementById('availability')
                            if (element) {
                              element.scrollIntoView({ behavior: 'smooth', block: 'start' })
                            }
                          }, 100)
                        }}
                        className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg text-sm sm:text-base font-medium transition-all ${activeSubTab === 'availability'
                            ? 'bg-primary text-slate-900'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                          }`}
                      >
                        جدول التوفر
                      </button>
                      <button
                        onClick={() => {
                          setActiveSubTab('reviews')
                          setTimeout(() => {
                            const element = document.getElementById('reviews')
                            if (element) {
                              element.scrollIntoView({ behavior: 'smooth', block: 'start' })
                            }
                          }, 100)
                        }}
                        className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg text-sm sm:text-base font-medium transition-all ${activeSubTab === 'reviews'
                            ? 'bg-primary text-slate-900'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                          }`}
                      >
                        التقييمات
                      </button>
                    </div>
                  </div>
                )}

                {/* About Me & Philosophy Section */}
                {activeQuickTab === 'personal' && activeSubTab === 'content' && (
                  <div id="content" className="space-y-6 sm:space-y-8">
                    {/* About Me Section */}
                    <div className="relative bg-white dark:bg-slate-800 rounded-xl p-4 sm:p-6 border border-gray-100 dark:border-slate-700 shadow-sm">
                      {isApproved && !isPending && (
                        <button
                          onClick={() => toggleEdit('about')}
                          className="absolute top-4 left-4 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                          title="تعديل"
                        >
                          <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">edit</span>
                        </button>
                      )}
                      <div className="space-y-3 sm:space-y-4">
                      
                        {/* Intro Video - In same row with title */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 sm:gap-4">
                        <div className="md:col-span-3">
                            <h3 className="text-base font-semibold mb-2">نبذة عني وفلسفتي في التعليم</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {editingStates.about && !isPending ? (
                                <textarea
                                  rows={4}
                                  defaultValue={teacherApplication?.bio || ''}
                                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm text-slate-900 dark:text-slate-100 leading-relaxed"
                                  placeholder="اكتب نبذة عنك وفلسفتك في التعليم..."
                                />
                              ) : (
                                <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                                  {teacherApplication?.bio || 'لا توجد نبذة متاحة'}
                                </div>
                              )}
                            </p>
                          </div>
                          <div className="md:col-span-1">
                            {personalInfo.introVideo ? (
                              <div className="relative w-full rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-700" style={{ aspectRatio: '16/9' }}>
                                {personalInfo.introVideo.includes('youtube.com') || personalInfo.introVideo.includes('youtu.be') ? (
                                  <iframe
                                    src={personalInfo.introVideo.includes('youtu.be')
                                      ? `https://www.youtube.com/embed/${personalInfo.introVideo.split('/').pop()}`
                                      : `https://www.youtube.com/embed/${personalInfo.introVideo.split('v=')[1]?.split('&')[0]}`
                                    }
                                    className="absolute top-0 left-0 w-full h-full"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                  />
                                ) : personalInfo.introVideo.includes('vimeo.com') ? (
                                  <iframe
                                    src={`https://player.vimeo.com/video/${personalInfo.introVideo.split('/').pop()}`}
                                    className="absolute top-0 left-0 w-full h-full"
                                    allow="autoplay; fullscreen; picture-in-picture"
                                    allowFullScreen
                                  />
                                ) : (
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <a href={personalInfo.introVideo} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                      فتح رابط الفيديو
                                    </a>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="relative w-full rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-700 flex items-center justify-center" style={{ aspectRatio: '16/9', minHeight: '200px' }}>
                                <div className="text-center">
                                  <span className="material-symbols-outlined text-5xl text-slate-400 mb-2">play_circle</span>
                                  <p className="text-sm text-slate-500 dark:text-slate-400">لا يوجد فيديو</p>
                                </div>
                              </div>
                            )}
                            {editingStates.about && !isPending && (
                              <input
                                type="url"
                                value={personalInfo.introVideo}
                                onChange={(e) => setPersonalInfo({ ...personalInfo, introVideo: e.target.value })}
                                placeholder="رابط الفيديو"
                                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 mt-2"
                              />
                            )}
                          </div>
                          
                        </div>
                      </div>
                    </div>

                    {/* Benefits Section */}
                    <div className="relative bg-white dark:bg-slate-800 rounded-xl p-6 sm:p-8 border border-gray-100 dark:border-slate-700 shadow-sm">
                      {isApproved && !isPending && (
                        <button
                          onClick={() => toggleEdit('benefits')}
                          className="absolute top-4 left-4 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                          title="تعديل"
                        >
                          <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">edit</span>
                        </button>
                      )}
                      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">ما الثمار التي سيجنيها الطالب؟</h2>
                      {editingStates.benefits && !isPending ? (
                        <div className="space-y-4">
                          {editableBenefits.map((benefit, index) => (
                            <div key={index} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg space-y-3">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <input
                                  type="text"
                                  value={benefit.title}
                                  onChange={(e) => handleUpdateBenefit(index, 'title', e.target.value)}
                                  placeholder="عنوان الفائدة"
                                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-slate-900 dark:text-slate-100 font-bold"
                                />
                                <input
                                  type="text"
                                  value={benefit.subject}
                                  onChange={(e) => handleUpdateBenefit(index, 'subject', e.target.value)}
                                  placeholder="وصف الفائدة"
                                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-slate-900 dark:text-slate-100"
                                />
                              </div>
                              <button
                                onClick={() => handleDeleteBenefit(index)}
                                className="text-red-500 text-sm hover:underline flex items-center gap-1"
                              >
                                <span className="material-symbols-outlined text-sm">delete</span>
                                حذف
                              </button>
                            </div>
                          ))}
                          {editableBenefits.length === 0 && (
                            <p className="text-slate-500 text-sm text-center py-4">لا توجد فوائد.</p>
                          )}
                          <div className="flex justify-center pt-4">
                            <button
                              onClick={handleAddBenefit}
                              className="px-6 py-3 bg-primary text-slate-900 font-bold rounded-lg hover:brightness-110 transition-all flex items-center gap-2"
                            >
                              <span className="material-symbols-outlined">add</span>
                              إضافة فائدة
                            </button>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4">
                            <button
                              onClick={() => toggleEdit('benefits')}
                              className="px-6 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                            >
                              إلغاء
                            </button>
                            <button
                              onClick={handleSaveBenefits}
                              disabled={savingBenefits}
                              className="px-6 py-2.5 bg-primary text-slate-900 font-bold rounded-lg hover:brightness-110 transition-all disabled:opacity-50"
                            >
                              {savingBenefits ? 'جاري الحفظ...' : 'حفظ الفوائد'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                            {editableBenefits.length > 0 ? (
                              editableBenefits.map((benefit, index) => (
                                <div key={index} className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 sm:p-6 border border-slate-200 dark:border-slate-600">
                                  <h3 className="font-bold text-lg mb-2 text-slate-900 dark:text-white">{benefit.title || 'فائدة'}</h3>
                                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                                    {benefit.subject || 'وصف الفائدة والنتائج المتوقعة...'}
                                  </p>
                                </div>
                              ))
                            ) : (
                              <div className="col-span-3 text-center py-8 text-slate-500">
                                لا توجد فوائد متاحة
                              </div>
                            )}
                          </div>
                          {isApproved && !isPending && editingStates.benefits && (
                            <div className="flex justify-center">
                              <button
                                onClick={() => toggleEdit('benefits')}
                                className="px-6 py-3 bg-primary text-slate-900 font-bold rounded-lg hover:brightness-110 transition-all flex items-center gap-2"
                              >
                                <span className="material-symbols-outlined">add</span>
                                إضافة فائدة
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Session Content Section */}
                    <div className="relative bg-white dark:bg-slate-800 rounded-xl p-6 sm:p-8 border border-gray-100 dark:border-slate-700 shadow-sm">
                      {isApproved && !isPending && (
                        <button
                          onClick={() => toggleEdit('sessionContent')}
                          className="absolute top-4 left-4 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                          title="تعديل"
                        >
                          <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">edit</span>
                        </button>
                      )}
                      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">ماذا تتضمن الحصة؟</h2>
                      {editingStates.sessionContent && !isPending ? (
                        <div className="space-y-4">
                          {editableSessionContent.map((item, index) => (
                            <div key={index} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg space-y-3">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <input
                                  type="text"
                                  value={item.title}
                                  onChange={(e) => handleUpdateSessionContent(index, 'title', e.target.value)}
                                  placeholder="عنوان العنصر"
                                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-slate-900 dark:text-slate-100 font-bold"
                                />
                                <input
                                  type="text"
                                  value={item.subject}
                                  onChange={(e) => handleUpdateSessionContent(index, 'subject', e.target.value)}
                                  placeholder="وصف العنصر"
                                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-slate-900 dark:text-slate-100"
                                />
                              </div>
                              <button
                                onClick={() => handleDeleteSessionContent(index)}
                                className="text-red-500 text-sm hover:underline flex items-center gap-1"
                              >
                                <span className="material-symbols-outlined text-sm">delete</span>
                                حذف
                              </button>
                            </div>
                          ))}
                          {editableSessionContent.length === 0 && (
                            <p className="text-slate-500 text-sm text-center py-4">لا توجد عناصر.</p>
                          )}
                          <div className="flex justify-center pt-4">
                            <button
                              onClick={handleAddSessionContent}
                              className="px-6 py-3 bg-primary text-slate-900 font-bold rounded-lg hover:brightness-110 transition-all flex items-center gap-2"
                            >
                              <span className="material-symbols-outlined">add</span>
                              إضافة عنصر
                            </button>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4">
                            <button
                              onClick={() => toggleEdit('sessionContent')}
                              className="px-6 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                            >
                              إلغاء
                            </button>
                            <button
                              onClick={handleSaveSessionContent}
                              disabled={savingSessionContent}
                              className="px-6 py-2.5 bg-primary text-slate-900 font-bold rounded-lg hover:brightness-110 transition-all disabled:opacity-50"
                            >
                              {savingSessionContent ? 'جاري الحفظ...' : 'حفظ محتوى الحصة'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                            {editableSessionContent.length > 0 ? (
                              editableSessionContent.map((item, index) => (
                                <div key={index} className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 sm:p-6 border border-slate-200 dark:border-slate-600">
                                  <h3 className="font-bold text-lg mb-2 text-slate-900 dark:text-white">{item.title || 'عنصر'}</h3>
                                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                                    {item.subject || 'وصف محتوى الحصة والأنشطة...'}
                                  </p>
                                </div>
                              ))
                            ) : (
                              <div className="col-span-3 text-center py-8 text-slate-500">
                                لا توجد عناصر متاحة
                              </div>
                            )}
                          </div>
                          {isApproved && !isPending && editingStates.sessionContent && (
                            <div className="flex justify-center">
                              <button
                                onClick={() => toggleEdit('sessionContent')}
                                className="px-6 py-3 bg-primary text-slate-900 font-bold rounded-lg hover:brightness-110 transition-all flex items-center gap-2"
                              >
                                <span className="material-symbols-outlined">add</span>
                                إضافة عنصر
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Save button for about section only */}
                    {editingStates.about && !isPending && (
                      <div className="flex flex-col sm:flex-row gap-3 justify-end">
                        <button
                          onClick={() => toggleEdit('about')}
                          className="px-6 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        >
                          إلغاء
                        </button>
                        <button
                          onClick={handleSavePersonalInfo}
                          disabled={saving}
                          className="px-6 py-2.5 bg-primary text-slate-900 font-bold rounded-lg hover:brightness-110 transition-all disabled:opacity-50"
                        >
                          {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Qualifications Section */}
                {activeQuickTab === 'personal' && activeSubTab === 'qualifications' && (
                  <>
                    {/* Education */}
                    <div id="qualifications" className="relative bg-white dark:bg-background-dark rounded-xl p-4 sm:p-6 lg:p-8 border border-primary/10 shadow-sm">
                      {isApproved && !isPending && (
                        <button
                          onClick={() => toggleEdit('qualifications')}
                          className="absolute top-4 left-4 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                          title="تعديل"
                        >
                          <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">edit</span>
                        </button>
                      )}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <span className="material-symbols-outlined text-primary bg-primary/10 p-1.5 sm:p-2 rounded-lg text-lg sm:text-xl">school</span>
                          <h3 className="text-lg sm:text-xl font-bold">المؤهلات العلمية</h3>
                        </div>
                        {editingStates.qualifications && !isPending && (
                          <button
                            onClick={handleAddQualification}
                            className="text-xs sm:text-sm font-bold text-primary flex items-center gap-1 hover:underline"
                          >
                            <span className="material-symbols-outlined text-sm">add</span> إضافة مؤهل
                          </button>
                        )}
                      </div>
                      <div className="space-y-6">
                        {editableQualifications.length > 0 ? (
                          editableQualifications.map((qual, index) => (
                            <div key={index} className="flex gap-4 items-start p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                              <div className="h-12 w-12 flex-shrink-0 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-primary">
                                <span className="material-symbols-outlined">history_edu</span>
                              </div>
                              <div className="flex-1 space-y-3">
                                {editingStates.qualifications && !isPending ? (
                                  <>
                                    <input
                                      type="text"
                                      value={qual.title}
                                      onChange={(e) => handleUpdateQualification(index, 'title', e.target.value)}
                                      placeholder="اسم المؤهل"
                                      className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-slate-900 dark:text-slate-100"
                                    />
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                      <input
                                        type="text"
                                        value={qual.institution || ''}
                                        onChange={(e) => handleUpdateQualification(index, 'institution', e.target.value)}
                                        placeholder="المؤسسة"
                                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 sm:px-4 py-2 text-sm sm:text-base text-slate-900 dark:text-slate-100"
                                      />
                                      <input
                                        type="text"
                                        value={qual.year || ''}
                                        onChange={(e) => handleUpdateQualification(index, 'year', e.target.value)}
                                        placeholder="السنة"
                                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 sm:px-4 py-2 text-sm sm:text-base text-slate-900 dark:text-slate-100"
                                      />
                                    </div>
                                    <button
                                      onClick={() => handleDeleteQualification(index)}
                                      className="text-red-500 text-sm hover:underline flex items-center gap-1"
                                    >
                                      <span className="material-symbols-outlined text-sm">delete</span>
                                      حذف
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <h4 className="font-bold text-lg text-slate-900 dark:text-white">{qual.title}</h4>
                                    {qual.institution && (
                                      <p className="text-slate-600 dark:text-slate-400 text-sm">{qual.institution} {qual.year && `- ${qual.year}`}</p>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-slate-500 text-sm">لا توجد مؤهلات مسجلة</p>
                        )}
                      </div>
                      {editingStates.qualifications && !isPending && editableQualifications.length > 0 && (
                        <div className="mt-6 flex justify-end">
                          <button
                            onClick={handleSaveQualifications}
                            disabled={saving}
                            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {saving ? 'جاري الحفظ...' : 'حفظ المؤهلات'}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Ijazahs */}
                    <div className="relative bg-white dark:bg-background-dark rounded-xl p-4 sm:p-6 lg:p-8 border border-primary/10 shadow-sm">
                      {isApproved && !isPending && (
                        <button
                          onClick={() => toggleEdit('ijazahs')}
                          className="absolute top-4 left-4 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                          title="تعديل"
                        >
                          <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">edit</span>
                        </button>
                      )}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-6 sm:mb-8">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <span className="material-symbols-outlined text-primary bg-primary/10 p-1.5 sm:p-2 rounded-lg text-lg sm:text-xl">workspace_premium</span>
                          <h3 className="text-lg sm:text-xl font-bold">الإجازات والسند</h3>
                        </div>
                        {editingStates.ijazahs && !isPending && (
                          <button
                            onClick={handleAddIjazah}
                            className="text-xs sm:text-sm font-bold text-primary flex items-center gap-1 hover:underline"
                          >
                            <span className="material-symbols-outlined text-sm">add</span> إضافة إجازة
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        {editableIjazahs.length > 0 ? (
                          editableIjazahs.map((ijazah, index) => (
                            <div
                              key={index}
                              className="group border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden hover:border-primary/40 transition-all"
                            >
                              <div
                                className="h-40 bg-cover bg-center"
                                style={{ backgroundImage: ijazah.image ? `url('${ijazah.image}')` : 'none', backgroundColor: '#f3f4f6' }}
                              />
                              <div className="p-4 space-y-3">
                                {editingStates.ijazahs && !isPending ? (
                                  <>
                                    <input
                                      type="text"
                                      value={ijazah.title}
                                      onChange={(e) => handleUpdateIjazah(index, 'title', e.target.value)}
                                      placeholder="عنوان الإجازة"
                                      className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-slate-900 dark:text-slate-100 font-bold"
                                    />
                                    <textarea
                                      value={ijazah.description}
                                      onChange={(e) => handleUpdateIjazah(index, 'description', e.target.value)}
                                      placeholder="وصف الإجازة"
                                      rows={2}
                                      className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-slate-900 dark:text-slate-100 text-sm"
                                    />
                                    <input
                                      type="url"
                                      value={ijazah.image}
                                      onChange={(e) => handleUpdateIjazah(index, 'image', e.target.value)}
                                      placeholder="رابط الصورة"
                                      className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-slate-900 dark:text-slate-100 text-sm"
                                    />
                                    <button
                                      onClick={() => handleDeleteIjazah(index)}
                                      className="text-red-500 text-sm hover:underline flex items-center gap-1"
                                    >
                                      <span className="material-symbols-outlined text-sm">delete</span>
                                      حذف
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <h4 className="font-bold text-slate-900 dark:text-white">{ijazah.title || 'بدون عنوان'}</h4>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">{ijazah.description || 'لا يوجد وصف'}</p>
                                  </>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-slate-500 text-sm">لا توجد إجازات مسجلة</p>
                        )}
                      </div>
                      {editingStates.ijazahs && !isPending && editableIjazahs.length > 0 && (
                        <div className="mt-6 flex justify-end">
                          <button
                            onClick={handleSaveIjazahs}
                            disabled={saving}
                            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {saving ? 'جاري الحفظ...' : 'حفظ الإجازات'}
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Availability Section */}
                {activeQuickTab === 'personal' && activeSubTab === 'availability' && (
                  <div id="availability" className="relative bg-white dark:bg-background-dark rounded-xl p-4 sm:p-6 lg:p-8 border border-primary/10 shadow-sm">
                    {isApproved && !isPending && (
                      <button
                        onClick={() => toggleEdit('availability')}
                        className="absolute top-4 left-4 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        title="تعديل"
                      >
                        <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">edit</span>
                      </button>
                    )}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-6 sm:mb-8">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <span className="material-symbols-outlined text-primary bg-primary/10 p-1.5 sm:p-2 rounded-lg text-lg sm:text-xl">event_available</span>
                        <h3 className="text-lg sm:text-xl font-bold">جدول التوفر الأسبوعي</h3>
                      </div>
                      <div className="flex gap-2">
                        <button className="px-2 sm:px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded text-[10px] sm:text-xs font-bold whitespace-nowrap">الأسبوع الحالي</button>
                        <button className="px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors whitespace-nowrap">التالي</button>
                      </div>
                    </div>
                    <div className="mb-4 flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-primary/20 rounded border border-primary/30"></div>
                        <span className="text-slate-600 dark:text-slate-400">متاح</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-slate-900/10 dark:bg-slate-900/30 rounded border border-slate-900/20"></div>
                        <span className="text-slate-600 dark:text-slate-400">محجوز</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-transparent rounded border border-slate-200 dark:border-slate-700"></div>
                        <span className="text-slate-600 dark:text-slate-400">غير متاح</span>
                      </div>
                    </div>
                    <div className="overflow-x-auto -mx-4 sm:mx-0">
                      <div className="min-w-[600px] sm:min-w-[800px] grid grid-cols-8 border-t border-slate-100 dark:border-slate-800">
                        {/* Header Row */}
                        <div className="p-2 sm:p-3 border-l border-b border-slate-100 dark:border-slate-800 text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50">الوقت</div>
                        {days.map((day) => (
                          <div
                            key={day}
                            className="p-2 sm:p-3 border-l border-b border-slate-100 dark:border-slate-800 text-[10px] sm:text-xs font-bold text-center bg-slate-50 dark:bg-slate-800/50"
                          >
                            {day}
                          </div>
                        ))}
                        {/* Time Rows */}
                        {timeSlots.map((time, timeIndex) => (
                          <React.Fragment key={timeIndex}>
                            <div className="p-1.5 sm:p-2 border-l border-b border-slate-100 dark:border-slate-800 text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">
                              {time}
                            </div>
                            {days.map((day, dayIndex) => {
                              const status = availability[dayIndex]?.[timeIndex]
                              return (
                                <div key={`${dayIndex}-${timeIndex}`} className="p-1 border-l border-b border-slate-100 dark:border-slate-800">
                                  {status === 'available' && (
                                    <div
                                      onClick={() => editingStates.availability && !isPending && handleToggleAvailability(dayIndex, timeIndex)}
                                      className={`h-full w-full bg-primary/20 rounded border border-primary/30 min-h-[35px] flex items-center justify-center transition-colors ${editingStates.availability && !isPending ? 'cursor-pointer hover:bg-primary/30' : ''
                                        }`}
                                    >
                                      <span className="text-[10px] font-bold text-primary">متاح</span>
                                    </div>
                                  )}
                                  {status === 'booked' && (
                                    <div className="h-full w-full bg-slate-900/10 dark:bg-slate-900/30 rounded border border-slate-900/20 min-h-[35px] flex items-center justify-center">
                                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">محجوز</span>
                                    </div>
                                  )}
                                  {!status && (
                                    <div
                                      onClick={() => editingStates.availability && !isPending && handleToggleAvailability(dayIndex, timeIndex)}
                                      className={`h-full w-full min-h-[35px] ${editingStates.availability && !isPending ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded' : ''
                                        }`}
                                    />
                                  )}
                                </div>
                              )
                            })}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                    {editingStates.availability && !isPending && (
                      <div className="mt-6 flex justify-end">
                        <button
                          onClick={handleSaveAvailability}
                          disabled={saving}
                          className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                        </button>
                      </div>
                    )}
                    {isPending && (
                      <div className="mt-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                        <p className="text-sm text-amber-700 dark:text-amber-300">
                          لا يمكنك تعديل جدول التوفر أثناء انتظار الموافقة على طلبك.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Reviews Section */}
                {activeQuickTab === 'personal' && activeSubTab === 'reviews' && (
                  <div id="reviews" className="relative bg-white dark:bg-background-dark rounded-xl p-4 sm:p-6 lg:p-8 border border-primary/10 shadow-sm">
                    {isApproved && !isPending && (
                      <button
                        onClick={() => toggleEdit('reviews')}
                        className="absolute top-4 left-4 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        title="تعديل"
                      >
                        <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">edit</span>
                      </button>
                    )}
                    <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
                      <span className="material-symbols-outlined text-primary bg-primary/10 p-1.5 sm:p-2 rounded-lg text-lg sm:text-xl">reviews</span>
                      <h3 className="text-lg sm:text-xl font-bold">آخر التقييمات</h3>
                    </div>
                    <div className="space-y-4 sm:space-y-6">
                      {reviews.length > 0 ? (
                        <>
                          {reviews.map((review) => (
                            <div key={review.id || `review-${review.name}-${review.time}`} className="p-4 sm:p-6 border border-slate-100 dark:border-slate-800 rounded-xl space-y-3">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                  <div
                                    className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-slate-200 bg-cover bg-center shrink-0"
                                    style={{ backgroundImage: `url('${review.avatar}')` }}
                                  />
                                  <div className="min-w-0 flex-1">
                                    <h5 className="text-xs sm:text-sm font-bold truncate">{review.name}</h5>
                                    <p className="text-[10px] sm:text-xs text-slate-400">{review.time}</p>
                                  </div>
                                </div>
                                <div className="flex text-primary shrink-0">
                                  {Array.from({ length: review.rating }).map((_, i) => (
                                    <span key={i} className="material-symbols-outlined text-xs sm:text-sm filled">star</span>
                                  ))}
                                </div>
                              </div>
                              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{review.comment}</p>
                            </div>
                          ))}
                          <button className="w-full text-center py-2 text-primary font-bold text-xs sm:text-sm hover:underline">
                            مشاهدة جميع التقييمات
                          </button>
                        </>
                      ) : (
                        <p className="text-slate-500 text-xs sm:text-sm text-center py-6 sm:py-8">لا توجد تقييمات بعد</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Wallet Section - Only show when activeQuickTab is 'wallet' */}
                {activeQuickTab === 'wallet' && (
                  <WalletSection
                    teacherId={teacherApplication?.userId || teacherApplication?.id || null}
                    onSave={showSaveMessage}
                  />
                )}

                {/* Support Section - Only show when activeQuickTab is 'support' */}
                {activeQuickTab === 'support' && (
                  <SupportSection
                    userId={user?.uid || null}
                    userName={userProfile?.displayName || user?.email || 'مستخدم'}
                    onSave={showSaveMessage}
                  />
                )}
              </section>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}

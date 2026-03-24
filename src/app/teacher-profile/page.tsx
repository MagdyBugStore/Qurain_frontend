'use client'

import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useAppStore } from '../../store/useAppStore'
import Header from '../../components/layout/Header'
import { getTeacherDisplayName, getTeacherTitle, getTeacherImageUrl } from '../../shared/utils/teacher'
import { getCurrencySymbol } from '../../shared/utils/currency'
import { TEACHER_APPLICATION_STATUS } from '../../constants/status'
import { TeacherService } from '../../services/teacherService'

// Components
import { LoadingSpinner } from './components/shared/LoadingSpinner'
import { SaveMessageBanner } from './components/SaveMessageBanner'
import { StatusBanner } from './components/StatusBanner'
import { ProfileCard } from './components/ProfileCard'
import { QuickLinks } from './components/QuickLinks'
import { SubTabs } from './components/SubTabs'
import { AboutSection } from './components/sections/AboutSection'
import { BenefitsSection } from './components/sections/BenefitsSection'
import { SessionContentSection } from './components/sections/SessionContentSection'
import { QualificationsSection } from './components/sections/QualificationsSection'
import { IjazahsSection } from './components/sections/IjazahsSection'
import { CertificatesSection } from './components/sections/CertificatesSection'
import { AvailabilitySection } from './components/sections/AvailabilitySection'
import { ReviewsSection } from './components/sections/ReviewsSection'
import { WalletSection } from './components/WalletSection'
import { SupportSection } from './components/SupportSection'

// Hooks
import { useTeacherProfileData } from './hooks/useTeacherProfileData'
import { useEditingStates } from './hooks/useEditingStates'
import { useSaveMessage } from './hooks/useSaveMessage'
import { useBenefits } from './hooks/useBenefits'
import { useSessionContent } from './hooks/useSessionContent'
import { useQualifications } from './hooks/useQualifications'
import { useIjazahs } from './hooks/useIjazahs'
import { useAvailability } from './hooks/useAvailability'
import { usePersonalInfo } from './hooks/usePersonalInfo'

// Types
import type { QuickTab, SubTab } from './types'

export default function TeacherProfilePage() {
  const navigate = useNavigate()
  const { user, userProfile } = useAuth()
  const { addToast } = useAppStore()
  
  // Data fetching
  const {
    teacherApplication,
    teacherProfile,
    rating,
    reviewsCount,
    reviews,
    qualifications: initialQualifications,
    ijazahs: initialIjazahs,
    availability: initialAvailability,
    benefits: initialBenefits,
    sessionContent: initialSessionContent,
    personalInfo: initialPersonalInfo,
    loading,
    refetch: refetchData,
  } = useTeacherProfileData(user?.id)

  // UI state
  const { editingStates, toggleEdit } = useEditingStates()
  const { saveMessage, showSuccess, showError, showMessage } = useSaveMessage()
  const [activeQuickTab, setActiveQuickTab] = useState<QuickTab>('personal')
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('content')

  // Computed values (needed for hooks)
  const isPending = teacherApplication?.status === TEACHER_APPLICATION_STATUS.PENDING
  const isApproved = teacherApplication?.status === TEACHER_APPLICATION_STATUS.APPROVED
  const isRejected = teacherApplication?.status === TEACHER_APPLICATION_STATUS.REJECTED
  // Check if application is incomplete (no application or status is not approved/pending)
  const isIncomplete = !teacherApplication || 
    (teacherApplication.status !== TEACHER_APPLICATION_STATUS.APPROVED && 
     teacherApplication.status !== TEACHER_APPLICATION_STATUS.PENDING)

  // Redirect if application is incomplete or not approved/pending
  useEffect(() => {
    if (!loading && user) {
      // If status is rejected
      if (isRejected) {
        addToast('تم رفض طلبك. يرجى التواصل مع الإدارة', 'error')
        navigate('/teacher-application', { replace: true })
        return
      }
      
      // If no application exists or status is incomplete (not approved/pending)
      if (isIncomplete) {
        addToast('يجب إكمال ملفك الشخصي أولاً', 'info')
        navigate('/teacher-application', { replace: true })
        return
      }
    }
  }, [loading, user, teacherApplication, isIncomplete, isRejected, navigate, addToast])

  // Section hooks - initialize with data from useTeacherProfileData
  const benefitsHook = useBenefits(teacherApplication)
  const sessionContentHook = useSessionContent(teacherApplication)
  const qualificationsHook = useQualifications(teacherApplication)
  const ijazahsHook = useIjazahs(teacherApplication)
  const availabilityHook = useAvailability(teacherApplication, isPending, initialAvailability)
  const personalInfoHook = usePersonalInfo(teacherApplication)

  // Sync hooks with initial data only once when data is first loaded
  // The hooks themselves handle updates through their internal useEffect
  const hasInitialized = React.useRef(false)
  
  useEffect(() => {
    if (!loading && !hasInitialized.current) {
      if (initialBenefits.length > 0) {
        benefitsHook.setBenefits(initialBenefits)
      }
      if (initialSessionContent.length > 0) {
        sessionContentHook.setItems(initialSessionContent)
      }
      if (initialQualifications.length > 0) {
        qualificationsHook.setQualifications(initialQualifications)
      }
      if (initialIjazahs.length > 0) {
        ijazahsHook.setIjazahs(initialIjazahs)
      }
      hasInitialized.current = true
    }
  }, [loading])

  // Computed values
  const teacherName = getTeacherDisplayName(teacherProfile || userProfile, teacherApplication)
  const teacherTitle = getTeacherTitle(teacherApplication)
  const profileImage = getTeacherImageUrl(teacherProfile || userProfile)
  const sessionPrice = teacherApplication?.hourlyRate || 0
  const currency = getCurrencySymbol(teacherApplication?.currency)

  // Save handlers
  const handleSavePersonalInfo = async (bio: string, introVideo: string) => {
    if (!teacherApplication?.id || !user) return

    try {
      const teacherService = new TeacherService()
      const currentBenefits = teacherApplication.teachingStyle || ''
      const currentSessionContent = teacherApplication.sessionContent || ''

      await teacherService.updatePersonalInfo(teacherApplication.id, {
        bio: bio,
        teachingStyle: currentBenefits,
        sessionContent: currentSessionContent,
        introVideo: introVideo,
      })

      // Update local state
      if (teacherApplication) {
        // Refetch to get updated data
        await refetchData()
      }

      showSuccess('تم حفظ البيانات بنجاح')
      toggleEdit('about')
    } catch (error) {
      console.error('Error saving personal info:', error)
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ أثناء حفظ البيانات'
      showError(errorMessage)
    }
  }

  // Benefits handlers
  const handleSaveBenefits = async () => {
    await benefitsHook.saveBenefits(
      () => {
        showSuccess('تم حفظ الفوائد بنجاح')
        toggleEdit('benefits')
      },
      (error) => showError(error)
    )
  }

  // Session content handlers
  const handleSaveSessionContent = async () => {
    await sessionContentHook.saveItems(
      () => {
        showSuccess('تم حفظ محتوى الحصة بنجاح')
        toggleEdit('sessionContent')
      },
      (error) => showError(error)
    )
  }

  // Qualifications handlers
  const handleSaveQualifications = async () => {
    await qualificationsHook.saveQualifications(
      () => {
        showSuccess('تم حفظ المؤهلات بنجاح')
        toggleEdit('qualifications')
      },
      (error) => showError(error)
    )
  }

  // Ijazahs handlers
  const handleSaveIjazahs = async () => {
    await ijazahsHook.saveIjazahs(
      () => {
        showSuccess('تم حفظ الإجازات بنجاح')
        toggleEdit('ijazahs')
      },
      (error) => showError(error)
    )
  }

  // Availability handlers
  const handleSaveAvailability = async () => {
    await availabilityHook.saveAvailability(
      async () => {
        // Reload availability data from server to get latest booked slots
        await refetchData()
        showSuccess('تم حفظ جدول التوفر بنجاح')
      },
      (error) => showError(error)
    )
  }

  // Show loading while checking access or redirecting
  if (loading) {
    return <LoadingSpinner />
  }

  // Don't render content if redirecting (incomplete or rejected)
  if (isIncomplete || isRejected) {
    return <LoadingSpinner />
  }

  return (
    <>
      <Header />
      <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display">
        <main className="flex-1 px-4 sm:px-6 py-6 sm:py-8 lg:px-20">
          <SaveMessageBanner message={saveMessage} />
          <StatusBanner 
            status={teacherApplication?.status || null} 
            hasApplication={!!teacherApplication} 
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Sidebar Column */}
            <aside className="lg:col-span-4 xl:col-span-3">
              <div className="sticky top-24 space-y-6">
                <ProfileCard
                  teacherName={teacherName}
                  teacherTitle={teacherTitle}
                  profileImage={profileImage}
                  rating={rating}
                  reviewsCount={reviewsCount}
                  sessionPrice={sessionPrice}
                  currency={currency}
                  yearsOfExperience={teacherApplication?.yearsOfExperience}
                  nationality={teacherApplication?.nationality}
                  isApproved={isApproved}
                  isPending={isPending}
                  teacherApplication={teacherApplication}
                  teacherProfile={teacherProfile}
                  userProfile={userProfile}
                  user={user}
                  isEditingPersonalInfo={editingStates.personalInfo}
                  onToggleEditPersonalInfo={() => toggleEdit('personalInfo')}
                  onEditProfile={() => {
                    setActiveQuickTab('personal')
                    setActiveSubTab('content')
                    toggleEdit('about')
                  }}
                  onSave={showMessage}
                />

                <QuickLinks
                  activeTab={activeQuickTab}
                  onTabChange={(tab) => {
                    setActiveQuickTab(tab)
                    if (tab === 'personal') {
                      setActiveSubTab('content')
                    }
                  }}
                />
              </div>
            </aside>

            {/* Main Area */}
            <div className="lg:col-span-8 xl:col-span-9 space-y-4 sm:space-y-6">
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
                        className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg text-sm sm:text-base font-medium transition-all ${
                          activeSubTab === 'content'
                            ? 'bg-primary text-slate-900'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                        }`}
                      >
                        المنهج
                      </button>
                      <button
                        onClick={() => {
                          setActiveSubTab('qualifications')
                          setTimeout(() => {
                            const element = document.getElementById('qualifications')
                            if (element) {
                              element.scrollIntoView({ behavior: 'smooth', block: 'start' })
                            }
                          }, 100)
                        }}
                        className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg text-sm sm:text-base font-medium transition-all ${
                          activeSubTab === 'qualifications'
                            ? 'bg-primary text-slate-900'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                        }`}
                      >
                        المؤهلات
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
                        className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg text-sm sm:text-base font-medium transition-all ${
                          activeSubTab === 'availability'
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
                        className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg text-sm sm:text-base font-medium transition-all ${
                          activeSubTab === 'reviews'
                            ? 'bg-primary text-slate-900'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                        }`}
                      >
                        التقييمات
                      </button>
                    </div>
                  </div>
                )}

                {/* Content Tab */}
                {activeQuickTab === 'personal' && activeSubTab === 'content' && (
                  <div id="content" className="space-y-6 sm:space-y-8">
                    <AboutSection
                      bio={teacherApplication?.bio || ''}
                      introVideo={personalInfoHook.personalInfo.introVideo || initialPersonalInfo.introVideo}
                      isEditing={editingStates.about}
                      isApproved={isApproved}
                      isPending={isPending}
                      onToggleEdit={() => toggleEdit('about')}
                      onSave={handleSavePersonalInfo}
                      saving={personalInfoHook.saving}
                    />

                    <BenefitsSection
                      benefits={benefitsHook.benefits}
                      isEditing={editingStates.benefits}
                      isApproved={isApproved}
                      isPending={isPending}
                      onToggleEdit={() => toggleEdit('benefits')}
                      onAdd={benefitsHook.addBenefit}
                      onUpdate={benefitsHook.updateBenefit}
                      onDelete={benefitsHook.deleteBenefit}
                      onSave={handleSaveBenefits}
                      saving={benefitsHook.saving}
                      onError={showError}
                    />

                    <SessionContentSection
                      items={sessionContentHook.items}
                      isEditing={editingStates.sessionContent}
                      isApproved={isApproved}
                      isPending={isPending}
                      onToggleEdit={() => toggleEdit('sessionContent')}
                      onAdd={sessionContentHook.addItem}
                      onUpdate={sessionContentHook.updateItem}
                      onDelete={sessionContentHook.deleteItem}
                      onSave={handleSaveSessionContent}
                      saving={sessionContentHook.saving}
                      onError={showError}
                    />
                  </div>
                )}

                {/* Qualifications Tab */}
                {activeQuickTab === 'personal' && activeSubTab === 'qualifications' && (
                  <>
                    <QualificationsSection
                      qualifications={qualificationsHook.qualifications}
                      isEditing={editingStates.qualifications}
                      isApproved={isApproved}
                      isPending={isPending}
                      onToggleEdit={() => toggleEdit('qualifications')}
                      onAdd={qualificationsHook.addQualification}
                      onUpdate={(index, field, value) => qualificationsHook.updateQualification(index, field as 'title' | 'institution' | 'year', value)}
                      onDelete={qualificationsHook.deleteQualification}
                      onSave={handleSaveQualifications}
                      saving={qualificationsHook.saving}
                    />

                    <CertificatesSection isApproved={isApproved} isPending={isPending} />

                    <IjazahsSection
                      ijazahs={ijazahsHook.ijazahs}
                      isEditing={editingStates.ijazahs}
                      isApproved={isApproved}
                      isPending={isPending}
                      onToggleEdit={() => toggleEdit('ijazahs')}
                      onAdd={ijazahsHook.addIjazah}
                      onUpdate={ijazahsHook.updateIjazah}
                      onDelete={ijazahsHook.deleteIjazah}
                      onSave={handleSaveIjazahs}
                      saving={ijazahsHook.saving}
                    />
                  </>
                )}

                {/* Availability Tab */}
                {activeQuickTab === 'personal' && activeSubTab === 'availability' && (
                  <AvailabilitySection
                    availability={availabilityHook.availability}
                    isApproved={isApproved}
                    isPending={isPending}
                    onToggleSlot={availabilityHook.toggleSlot}
                    onSave={handleSaveAvailability}
                    saving={availabilityHook.saving}
                    hasChanges={availabilityHook.hasChanges}
                  />
                )}

                {/* Reviews Tab */}
                {activeQuickTab === 'personal' && activeSubTab === 'reviews' && (
                  <ReviewsSection
                    reviews={reviews}
                    rating={rating}
                    reviewsCount={reviewsCount}
                    isApproved={isApproved}
                    isPending={isPending}
                  />
                )}

                {/* Wallet Tab */}
                {activeQuickTab === 'wallet' && (
                  <WalletSection
                    teacherId={teacherApplication?.userId || teacherApplication?.id || null}
                    onSave={showMessage}
                  />
                )}

                {/* Support Tab */}
                {activeQuickTab === 'support' && (
                  <SupportSection
                    userId={user?.id || null}
                    userName={userProfile?.displayName || user?.email || 'مستخدم'}
                    onSave={showMessage}
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

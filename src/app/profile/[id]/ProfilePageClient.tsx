'use client'

import React from "react";
import { useNavigate, useParams } from 'react-router-dom'
import { useRequireAuth } from '../../../hooks/useRequireAuth'
import { useRequireProfileComplete } from '../../../hooks/useRequireProfileComplete'
import TeacherProfilePage from '../../teacher-profile/page'
import StudentProfilePage from '../../student-profile/page'
import TeacherDetailPageClient from '../../teachers/[id]/TeacherDetailPageClient'

export default function ProfilePageClient() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, userProfile, loading } = useRequireAuth()

  // Enforce profile completion only when viewing own profile
  const isOwnProfile = !id || id === user?.id
  useRequireProfileComplete({ enabled: !!user && isOwnProfile })

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  // If no user, redirect will happen in useEffect
  if (!user) {
    return null
  }

  // If ID is provided and doesn't match current user, fetch that user's profile
  const targetUserId = id || user.id
  const isCurrentUser = targetUserId === user.id


  // If viewing own profile, check account type
  if (isCurrentUser) {
    // If account type is not set, show loading (redirect will happen in useEffect)
    if (!userProfile?.accountType) {
      return null
    }

    // Check user account type and render appropriate profile
    if (userProfile?.accountType === 'teacher') {
      return <TeacherProfilePage />
    }

    if (userProfile?.accountType === 'student') {
      return <StudentProfilePage />
    }
  } else {
    // Viewing another user's profile - show teacher detail page
    return <TeacherDetailPageClient />
  }

  // Fallback: show message if account type is unknown
  const handleCompleteProfile = () => {
    if (!userProfile?.accountType) {
      navigate('/choose-role')
    } else if (userProfile.accountType === 'student') {
      navigate('/personal-info')
    } else if (userProfile.accountType === 'teacher') {
      navigate('/teacher-application')
    } else {
      navigate('/choose-role')
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <p className="text-slate-600 dark:text-slate-400">يرجى إكمال ملفك الشخصي أولاً</p>
        <button
          onClick={handleCompleteProfile}
          className="mt-4 bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors"
        >
          إكمال الملف الشخصي
        </button>
      </div>
    </div>
  )
}

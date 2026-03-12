'use client'

import React, { useEffect } from "react";
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'
import TeacherProfilePage from '../../teacher-profile/page'
import StudentProfilePage from '../../student-profile/page'
import TeacherDetailPageClient from '../../teachers/[id]/TeacherDetailPageClient'

export default function ProfilePageClient() {
  const { id } = useParams<{ id: string }>()
  const { user, userProfile, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login', { replace: true })
      return
    }
  }, [user, loading, navigate])

  // Check if account type is missing and redirect
  // التحقق من وجود accountType وإعادة التوجيه إذا لم يكن موجوداً
  useEffect(() => {
    // Wait for loading to complete
    if (loading) return;
    
    // If no user, redirect already handled in first useEffect
    if (!user) return;
    
    const targetUserId = id || user?.uid
    const isCurrentUser = targetUserId === user?.uid
    
    // Only redirect if viewing own profile and accountType is missing
    // إعادة التوجيه فقط إذا كان المستخدم يشاهد ملفه الشخصي و accountType غير موجود
    if (isCurrentUser) {
      // If userProfile exists but accountType is null/undefined, redirect
      // إذا كان userProfile موجوداً ولكن accountType null أو undefined، إعادة التوجيه
      if (userProfile && (userProfile.accountType === null || userProfile.accountType === undefined)) {
        navigate('/personal-info', { replace: true })
        return
      }
      
      // If userProfile doesn't exist yet, wait for it to load
      // إذا لم يكن userProfile موجوداً بعد، انتظر تحميله
      // (This will be handled by the render logic below)
    }
  }, [user, userProfile, loading, id, navigate])

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
  const targetUserId = id || user?.uid
  const isCurrentUser = targetUserId === user?.uid


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
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <p className="text-slate-600 dark:text-slate-400">يرجى إكمال ملفك الشخصي أولاً</p>
        <button
          onClick={() => navigate('/personal-info')}
          className="mt-4 bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors"
        >
          إكمال الملف الشخصي
        </button>
      </div>
    </div>
  )
}

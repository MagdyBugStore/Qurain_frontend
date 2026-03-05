'use client'

import React, { useEffect } from "react";
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import TeacherProfilePage from '../teacher-profile/page'
import StudentProfilePage from '../student-profile/page'

export default function ProfilePage() {
  const { user, userProfile, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login')
      return
    }
  }, [user, loading, navigate])

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

  // Check user account type and render appropriate profile
  if (userProfile?.accountType === 'teacher') {
    return <TeacherProfilePage />
  }

  if (userProfile?.accountType === 'student') {
    return <StudentProfilePage />
  }

  // If account type is not set, redirect to personal-info
  if (!userProfile?.accountType) {
    navigate('/personal-info')
    return null
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

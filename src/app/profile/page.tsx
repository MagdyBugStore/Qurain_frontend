'use client'

import React, { useEffect } from "react";
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

/**
 * Profile Page (without ID)
 * Redirects to /profile/:id using current user's ID
 * This eliminates code duplication - all profile logic is in ProfilePageClient
 */
export default function ProfilePage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login', { replace: true })
      return
    }

    // If user exists, redirect to profile with user ID
    // إذا كان المستخدم موجوداً، إعادة التوجيه إلى الملف الشخصي مع معرف المستخدم
    if (user?.uid) {
      navigate(`/profile/${user.uid}`, { replace: true })
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

  // This should not render - redirect happens in useEffect
  // هذا لا يجب أن يظهر - إعادة التوجيه تحدث في useEffect
  return null
}

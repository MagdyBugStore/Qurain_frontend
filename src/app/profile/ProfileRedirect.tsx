'use client'

import React, { useEffect } from "react";
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export default function ProfileRedirect() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading) {
      if (user) {
        // Redirect to profile with user ID
        navigate(`/profile/${user.id}`, { replace: true })
      } else {
        // Redirect to login if not authenticated
        navigate('/login', { replace: true })
      }
    }
  }, [user, loading, navigate])

  // Show loading state
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="mt-4 text-slate-600 dark:text-slate-400">جاري التحميل...</p>
      </div>
    </div>
  )
}

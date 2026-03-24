'use client'

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { isProfileComplete } from '../models/UserModel'

/**
 * Hook to enforce profile completion on certain pages.
 * - إذا كان المستخدم مسجلاً ولكن ملفه غير مكتمل يوجّه إلى /personal-info
 * - يعيد { user, userProfile, loading }
 */
export function useRequireProfileComplete(options?: { enabled?: boolean }) {
  const navigate = useNavigate()
  const { user, userProfile, loading } = useAuth()
  const enabled = options?.enabled ?? true

  useEffect(() => {
    if (!enabled) return
    if (loading || !user) return

    // If no accountType, redirect to choose role page
    if (!userProfile?.accountType) {
      navigate('/choose-role', { replace: true })
      return
    }

    // If profile is incomplete, redirect to appropriate page based on accountType
    if (!isProfileComplete(userProfile)) {
      if (userProfile.accountType === 'student') {
        navigate('/personal-info', { replace: true })
      } else if (userProfile.accountType === 'teacher') {
        navigate('/teacher-application', { replace: true })
      } else {
        navigate('/choose-role', { replace: true })
      }
    }
  }, [user, userProfile, loading, navigate, enabled])

  return { user, userProfile, loading }
}


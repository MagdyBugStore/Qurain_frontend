'use client'

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useAppStore } from '../store/useAppStore'

/**
 * Hook to enforce authentication on protected pages.
 * - Redirects to /login إذا لم يكن هناك مستخدم
 * - يعيد { user, userProfile, loading }
 */
export function useRequireAuth() {
  const navigate = useNavigate()
  const { user, userProfile, loading } = useAuth()

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login', { replace: true })
    }
  }, [user, loading, navigate])

  return { user, userProfile, loading }
}

/**
 * Hook for conditional authentication checks.
 * - Provides requireAuth function that checks authentication before executing callbacks
 * - Opens login modal if user is not authenticated
 * - يعيد { requireAuth }
 */
export function useAuthGuard() {
  const { user, loading } = useAuth()
  const openLoginModal = useAppStore((state) => state.openLoginModal)

  const requireAuth = (callback: () => void) => {
    if (loading) {
      return // Wait for auth to finish loading
    }
    
    if (!user) {
      openLoginModal()
      return
    }

    callback()
  }

  return { requireAuth }
}

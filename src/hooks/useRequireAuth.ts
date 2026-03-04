'use client'

import { useAppStore } from '@/store/useAppStore'

/**
 * Hook that returns a function to check auth before performing an action
 * @returns Function that checks auth and returns boolean
 */
export function useAuthGuard() {
  const { isAuthenticated, openLoginModal } = useAppStore()

  const requireAuth = (callback?: () => void): boolean => {
    if (!isAuthenticated) {
      openLoginModal()
      return false
    }
    if (callback) {
      callback()
    }
    return true
  }

  return { requireAuth, isAuthenticated }
}

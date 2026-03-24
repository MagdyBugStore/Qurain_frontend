'use client'

import React from "react";
import { useState } from 'react'
import { useAppStore } from '../../store/useAppStore'
import { signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '../../config/firebase'
import { authApi } from '../../services/authApi'

export default function LoginModal() {
  const isOpen = useAppStore((state) => state.isLoginModalOpen)
  const closeModal = useAppStore((state) => state.closeLoginModal)
  const setAuthenticated = useAppStore((state) => state.setAuthenticated)
  const addToast = useAppStore((state) => state.addToast)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [isFacebookLoading, setIsFacebookLoading] = useState(false)
  const [isAppleLoading, setIsAppleLoading] = useState(false)

  const handleLogin = async (provider: 'google' | 'facebook' | 'apple') => {
    if (provider === 'google') {
      setIsGoogleLoading(true)
    } else if (provider === 'facebook') {
      setIsFacebookLoading(true)
    } else if (provider === 'apple') {
      setIsAppleLoading(true)
    }
    try {
      if (provider === 'google') {
        // Google authentication with Firebase
        const result = await signInWithPopup(auth, googleProvider)
        const user = result.user

        const email = user.email || ''
        const name =
          user.displayName || user.email?.split('@')[0] || 'User'
        const photoURL = user.photoURL || null

        // Call backend to create/update user and issue JWT
        await authApi.loginWithGoogle({
          email,
          fullName: name,
          photoURL,
        })

        // Keep local UI auth state (for legacy parts of the app)
        setAuthenticated(true, {
          email,
          name,
        })

        addToast('تم تسجيل الدخول بنجاح! مرحباً بك', 'success')

        closeModal()

        // Ensure AuthContext picks up the new JWT and profile
        window.location.reload()
      } else {
        // Simulate login API call for other providers (not yet implemented)
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Set authenticated state
        setAuthenticated(true, {
          email: `user@${provider}.com`,
          name: `User ${provider}`,
        })

        // Show success toast
        addToast('تم تسجيل الدخول بنجاح! مرحباً بك', 'success')

        closeModal()
      }
    } catch (error: any) {
      console.error('Login error:', error)
      // Handle specific Firebase errors
      if (error.code === 'auth/popup-closed-by-user') {
        addToast('تم إلغاء تسجيل الدخول', 'info')
      } else if (error.code === 'auth/cancelled-popup-request') {
        addToast('يرجى الانتظار، جاري معالجة الطلب السابق', 'info')
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        addToast('يوجد حساب آخر بنفس البريد الإلكتروني', 'error')
      } else if (error.code === 'auth/popup-blocked') {
        addToast('تم حظر النافذة المنبثقة. يرجى السماح بالنوافذ المنبثقة', 'error')
      } else if (error.code === 'auth/network-request-failed') {
        addToast('خطأ في الاتصال بالإنترنت. يرجى التحقق من الاتصال والمحاولة مرة أخرى', 'error')
      } else {
        addToast('حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى', 'error')
      }
    } finally {
      if (provider === 'google') {
        setIsGoogleLoading(false)
      } else if (provider === 'facebook') {
        setIsFacebookLoading(false)
      } else if (provider === 'apple') {
        setIsAppleLoading(false)
      }
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={closeModal}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-[#fdfcfb] shadow-2xl animate-in fade-in zoom-in duration-300">
        {/* Close Button */}
        <button
          onClick={closeModal}
          className="absolute left-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/5 text-text-muted transition-colors hover:bg-black/10 hover:text-text-main focus:outline-none"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>

        <div className="relative px-8 py-10">
          {/* Branding & Header */}
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary shadow-inner">
              <svg
                className="h-10 w-10"
                fill="none"
                viewBox="0 0 48 48"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M42.1739 20.1739L27.8261 5.82609C29.1366 7.13663 28.3989 10.1876 26.2002 13.7654C24.8538 15.9564 22.9595 18.3449 20.6522 20.6522C18.3449 22.9595 15.9564 24.8538 13.7654 26.2002C10.1876 28.3989 7.13663 29.1366 5.82609 27.8261L20.1739 42.1739C21.4845 43.4845 24.5355 42.7467 28.1133 40.548C30.3042 39.2016 32.6927 37.3073 35 35C37.3073 32.6927 39.2016 30.3042 40.548 28.1133C42.7467 24.5355 43.4845 21.4845 42.1739 20.1739Z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-text-main">تسجيل الدخول</h2>
            <p className="mt-1 text-sm text-text-muted">
              سجّل الدخول باستخدام حسابك في إحدى المنصات التالية للبدء في رحلتك مع القرآن
            </p>
          </div>

          {/* Social Buttons Container */}
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => handleLogin('google')}
              disabled={isGoogleLoading}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-[#e4e2dc] bg-white py-3 px-4 text-base font-medium text-text-main transition-all hover:border-primary/30 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              <span>{isGoogleLoading ? 'جاري...' : 'Google'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleLogin('facebook')}
              disabled={isFacebookLoading}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-[#e4e2dc] bg-white py-3 px-4 text-base font-medium text-text-main transition-all hover:border-primary/30 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                className="h-5 w-5"
                fill="#1877F2"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span>{isFacebookLoading ? 'جاري...' : 'Facebook'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleLogin('apple')}
              disabled={isAppleLoading}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-[#e4e2dc] bg-white py-3 px-4 text-base font-medium text-text-main transition-all hover:border-primary/30 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M17.05 20.28c-.98.95-2.05 1.72-3.21 2.31-1.16.59-2.32.88-3.48.88-1.16 0-2.32-.29-3.48-.88-1.16-.59-2.23-1.36-3.21-2.31C1.84 18.52 1 16.4 1 13.91c0-2.49.84-4.61 2.52-6.37 1.68-1.76 3.8-2.64 6.36-2.64.91 0 1.8.14 2.67.42.87.28 1.62.7 2.25 1.26.63-.56 1.38-.98 2.25-1.26.87-.28 1.76-.42 2.67-.42 2.56 0 4.68.88 6.36 2.64C22.16 9.3 23 11.42 23 13.91c0 2.49-.84 4.61-2.52 6.37-.98.95-2.05 1.72-3.21 2.31-1.16.59-2.32.88-3.48.88-1.16 0-2.32-.29-3.48-.88-1.16-.59-2.23-1.36-3.21-2.31zM12 4.14c-.01-1.13.43-2.14 1.32-3.03C14.21.22 15.22-.22 16.35-.21c.01 1.13-.43 2.14-1.32 3.03-.89.89-1.9 1.33-3.03 1.32z" />
              </svg>
              <span>{isAppleLoading ? 'جاري...' : 'Apple'}</span>
            </button>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-text-muted leading-relaxed">
              بمتابعة تسجيل الدخول، أنت توافق على{' '}
              <a
                className="font-medium text-primary hover:underline transition-colors"
                href="#"
              >
                شروط الخدمة
              </a>
              {' '}و{' '}
              <a
                className="font-medium text-primary hover:underline transition-colors"
                href="#"
              >
                سياسة الخصوصية
              </a>
              . سيتم إنشاء حساب تلقائياً عند أول تسجيل دخول.
            </p>
          </div>
        </div>

        {/* Decorative Bottom Accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
      </div>
    </div>
  )
}

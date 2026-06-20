'use client'

import React, { useState, useEffect } from "react";
import { Navigate, Link } from 'react-router-dom'
import { signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '../config/firebase'
import { authApi } from '../services/authApi'
import { useAppStore } from '../store/useAppStore'
import { useAuth } from '../contexts/AuthContext'
import { isProfileComplete } from '../models/UserModel'
import Popup from '../components/modals/Popup'

const CAROUSEL_SLIDES = [
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBPTOvKooGfx6n8avxMAc0ns7e2COEg3rUYoejA5nAP39hBmG6vjnOJWVT2cyKKGwumgEw6yIZ9n7ucso8pBeAxGwmCkbVw1xgrVagnb81wGJq1pNxreSLIwzGP7Gt5ebu9-Z0z21jha6xp7f2UxrbumosY6TTU3qStt0Cq9zWnzZZvYXA9eGLMcY342K16Gd-ySeiVpTqbaUgcFuthX2GTk-wOP-IqJuOFbSknlkHdR_zHD-CxSRbxU2VD2-NxrVRPVqPj_mgrtw',
    alt: 'Islamic Architecture',
  },
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDqF7BX_bkLHq8tTBshWOY274WmSMeLfnBkBMuUa4pHr96voYFfvV2m-pGQIWiMz7M1lR56uHHYu10KK6DsPy7u29g6Yf_8NuCzWGqlTcVM3kLXZQr0dyTD3ZhzoFE5kFhPwUT4W3NxKznPWSwzeylt79_R_pYfi-A1c_nF9er-iAKroi4kfZFx71SnS_uPexbHZ15bLW0N_ZpcsnsxR_xRmKX-eq0koxUsux2xcbaTWW4dnSIpGClXzP3kQECn89GFIlI0qXEPuQ',
    alt: 'Quranic Learning',
  },
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuChjdngSA8yADYxY9MLsn2pjZewkYjto6ebD82nuP5txZEEyTpvSc2jlwEjLfXEu3A4aiSv8F5Rz_pwLzfFGrRCEkeTaKvwwwdAnaPXpewup9eBTr6cbdU34O0DzP4OPiTuxjBqyBj8iEYDwuDmACA8GDqh-61rOIyI9RNy2zEuO1uyFDpEBRqb5QTYY6aOTmNZW5-ZRVB8wZowAxOI796_3WgiWcVJE1_rORoujyRqHtNsR90UNaVmFEHI54o3jMf0mIbR-ah_Cw',
    alt: 'Mosque Interior',
  },
]

export default function Home() {
  const { user, userProfile, loading } = useAuth()
  const addToast = useAppStore((state) => state.addToast)
  const setAuthenticated = useAppStore((state) => state.setAuthenticated)

  const [currentSlide, setCurrentSlide] = useState(0)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [isAppleLoading, setIsAppleLoading] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  if (!loading && user) {
    if (!userProfile?.accountType) return <Navigate to="/choose-role" replace />
    if (userProfile.accountType === 'student' && !isProfileComplete(userProfile))
      return <Navigate to="/personal-info" replace />
    if (userProfile.accountType === 'teacher' && !isProfileComplete(userProfile))
      return <Navigate to="/teacher-application" replace />
  }

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true)
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const firebaseUser = result.user
      await authApi.loginWithGoogle({
        email: firebaseUser.email || '',
        fullName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
        photoURL: firebaseUser.photoURL || null,
      })
      setAuthenticated(true, {
        email: firebaseUser.email || '',
        name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
      })
      addToast('تم تسجيل الدخول بنجاح! مرحباً بك', 'success')
      window.location.reload()
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        addToast('تم إلغاء تسجيل الدخول', 'info')
      } else if (error.code === 'auth/cancelled-popup-request') {
        addToast('يرجى الانتظار، جاري معالجة الطلب السابق', 'info')
      } else if (error.code === 'auth/popup-blocked') {
        addToast('تم حظر النافذة المنبثقة. يرجى السماح بالنوافذ المنبثقة', 'error')
      } else if (error.code === 'auth/network-request-failed') {
        addToast('خطأ في الاتصال بالإنترنت. يرجى التحقق من الاتصال', 'error')
      } else {
        addToast('حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى', 'error')
      }
    } finally {
      setIsGoogleLoading(false)
    }
  }

  const handleAppleLogin = async () => {
    setIsAppleLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      addToast('تسجيل الدخول بـ Apple غير متاح حالياً', 'info')
    } finally {
      setIsAppleLoading(false)
    }
  }

  return (
    <>
      <div className="flex w-full h-screen overflow-hidden" dir="rtl">
        {/* Right Side — Splash Carousel (desktop only) */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-[#064e3b] items-center justify-center overflow-hidden flex-shrink-0">
          {/* Carousel images */}
          {CAROUSEL_SLIDES.map((slide, i) => (
            <div
              key={i}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${
                i === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              <img
                src={slide.src}
                alt={slide.alt}
                className="w-full h-full object-cover opacity-40 mix-blend-overlay"
              />
            </div>
          ))}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#003527]/90 via-[#003527]/60 to-[#003527]/40 z-10 pointer-events-none" />

          {/* Splash content */}
          <div className="relative z-20 flex flex-col items-center text-white px-12 text-center">
            <div className="mb-6 flex items-center justify-center w-24 h-24 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl">
              <span
                className="material-symbols-outlined text-white"
                style={{ fontSize: '48px', fontVariationSettings: "'FILL' 1" }}
              >
                menu_book
              </span>
            </div>
            <h1 className="text-6xl font-bold text-white mb-4 drop-shadow-lg" style={{ fontFamily: 'Noto Serif, serif' }}>
              قرآن اون لاين
            </h1>
            <p className="text-xl font-semibold text-[#95d3ba] max-w-md mx-auto leading-relaxed drop-shadow-md">
              سَكِينَةٌ وَعِلْمٌ فِي رِحَابِ الآيَاتِ
            </p>
          </div>

          {/* Dot indicators */}
          <div className="absolute bottom-10 left-0 w-full flex justify-center gap-3 z-20">
            {CAROUSEL_SLIDES.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrentSlide(i)}
                className={`w-2.5 h-2.5 rounded-full bg-white transition-opacity hover:scale-110 ${
                  i === currentSlide ? 'opacity-100' : 'opacity-40 hover:opacity-75'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Left Side — Login Form */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 sm:p-12 md:p-16 bg-white overflow-y-auto flex-shrink-0">
          <div className="w-full max-w-[440px]">
            {/* Mobile branding (hidden on desktop) */}
            <div className="lg:hidden flex flex-col items-center mb-10">
              <div className="mb-4 flex items-center justify-center w-20 h-20 rounded-full bg-primary shadow-lg">
                <span
                  className="material-symbols-outlined text-text-main"
                  style={{ fontSize: '40px', fontVariationSettings: "'FILL' 1" }}
                >
                  menu_book
                </span>
              </div>
              <h1 className="text-2xl font-bold text-text-main text-center" style={{ fontFamily: 'Noto Serif, serif' }}>قرآن</h1>
              <p className="text-sm text-text-muted mt-2 text-center">سَكِينَةٌ وَعِلْمٌ فِي رِحَابِ الآيَاتِ</p>
            </div>

            {/* Heading */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">مرحباً بك مجدداً</h2>
              <p className="text-gray-500 text-base">سجل دخولك لمتابعة رحلتك القرآنية</p>
            </div>

            {/* Login buttons */}
            <div className="space-y-4">
              {/* Google */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isGoogleLoading}
                className="w-full py-3.5 bg-white text-gray-800 border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span className="font-bold">
                  {isGoogleLoading ? 'جاري التسجيل...' : 'تسجيل الدخول بواسطة Google'}
                </span>
              </button>

              {/* Apple */}
              <button
                type="button"
                onClick={handleAppleLogin}
                disabled={isAppleLoading}
                className="w-full py-3.5 bg-black text-white rounded-xl shadow-sm hover:opacity-90 transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 384 512" xmlns="http://www.w3.org/2000/svg">
                  <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
                </svg>
                <span className="font-bold">
                  {isAppleLoading ? 'جاري التسجيل...' : 'تسجيل الدخول بواسطة Apple'}
                </span>
              </button>

              {/* Divider */}
              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-gray-200" />
                <span className="flex-shrink mx-4 text-gray-400 text-sm">أو</span>
                <div className="flex-grow border-t border-gray-200" />
              </div>

              {/* Guest button */}
              <Link
                to="/teachers"
                className="w-full py-3.5 bg-transparent text-text-main border-2 border-primary font-bold rounded-xl hover:bg-primary/10 transition-colors duration-200 flex items-center justify-center gap-2 shadow-sm"
              >
                <span className="material-symbols-outlined">person</span>
                <span>الدخول كضيف</span>
              </Link>
            </div>

            {/* Footer links */}
            <div className="mt-10 text-center space-y-6">
              <p className="text-sm text-gray-500">
                ليس لديك حساب؟{' '}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="text-primary font-bold hover:underline transition-colors"
                >
                  أنشئ حساباً جديداً
                </button>
              </p>
              <div className="flex items-center justify-center gap-6 pt-4 text-gray-400 border-t border-gray-100">
                <a href="#" className="hover:text-primary transition-colors flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm" style={{ fontSize: '18px' }}>help</span>
                  <span className="text-xs">المساعدة</span>
                </a>
                <a href="#" className="hover:text-primary transition-colors flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm" style={{ fontSize: '18px' }}>language</span>
                  <span className="text-xs">العربية</span>
                </a>
              </div>
            </div>

            {/* Copyright */}
            <p className="mt-8 text-center text-xs text-gray-400 leading-relaxed">
              © ٢٠٢٤ منصة قرآن للتعليم الديني. جميع الحقوق محفوظة
            </p>
          </div>
        </div>
      </div>

      <Popup />
    </>
  )
}

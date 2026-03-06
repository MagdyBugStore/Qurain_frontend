'use client'

import React from "react";
import { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAppStore } from '../../store/useAppStore'
import { useAuth } from '../../contexts/AuthContext'
import { signOut } from 'firebase/auth'
import { auth } from '../../config/firebase'

export default function Header() {
  const openLoginModal = useAppStore((state) => state.openLoginModal)
  const isAuthenticated = useAppStore((state) => state.isAuthenticated)
  const user = useAppStore((state) => state.user)
  const setAuthenticated = useAppStore((state) => state.setAuthenticated)
  const { user: firebaseUser, signOut: authSignOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const [isMobileProfileDropdownOpen, setIsMobileProfileDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const mobileDropdownRef = useRef<HTMLDivElement>(null)

  const navItems = [
    { to: '/teachers', label: 'المعلمين' },
  ]

  const isActive = (to: string) => {
    if (to === '/') return location.pathname === '/'
    return location.pathname === to || location.pathname.startsWith(`${to}/`)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false)
      }
      if (mobileDropdownRef.current && !mobileDropdownRef.current.contains(event.target as Node)) {
        setIsMobileProfileDropdownOpen(false)
      }
    }

    if (isProfileDropdownOpen || isMobileProfileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isProfileDropdownOpen, isMobileProfileDropdownOpen])

  // Handle logout
  const handleLogout = async () => {
    try {
      await authSignOut()
      setAuthenticated(false)
      setIsProfileDropdownOpen(false)
      setIsMobileProfileDropdownOpen(false)
      navigate('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  // Get user display info
  const getUserDisplayName = () => {
    if (firebaseUser?.displayName) return firebaseUser.displayName
    if (user?.name) return user.name
    if (firebaseUser?.email) return firebaseUser.email.split('@')[0]
    if (user?.email) return user.email.split('@')[0]
    return 'المستخدم'
  }

  const getUserPhoto = () => {
    const photoURL = firebaseUser?.photoURL || null
    return photoURL
  }

  const getUserInitials = () => {
    const name = getUserDisplayName()
    const parts = name.split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  const getProfileUrl = () => {
    const userId = firebaseUser?.uid
    return userId ? `/profile/${userId}` : '/profile'
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 text-primary flex-shrink-0">
              <svg
                className="w-full h-full"
                fill="none"
                viewBox="0 0 48 48"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  clipRule="evenodd"
                  d="M24 0.757355L47.2426 24L24 47.2426L0.757355 24L24 0.757355ZM21 35.7574V12.2426L9.24264 24L21 35.7574Z"
                  fill="currentColor"
                  fillRule="evenodd"
                />
              </svg>
            </div>
            <span className="text-base sm:text-lg md:text-xl font-bold tracking-tight text-text-main whitespace-nowrap">
              القرآن أونلاين
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="flex items-center gap-6 lg:gap-8">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`text-sm lg:text-base font-medium transition-colors whitespace-nowrap ${
                  isActive(item.to) ? 'text-primary' : 'hover:text-primary'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Auth Buttons / Profile Dropdown */}
          <div className="flex items-center gap-2 lg:gap-3">
            {isAuthenticated || firebaseUser ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border-2 border-primary/20">
                    {getUserPhoto() ? (
                      <img
                        src={getUserPhoto()!}
                        alt={getUserDisplayName()}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xs font-bold text-primary">
                        {getUserInitials()}
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-medium text-text-main hidden lg:block">
                    {getUserDisplayName()}
                  </span>
                  <span className="material-symbols-outlined text-lg text-text-muted">
                    {isProfileDropdownOpen ? 'expand_less' : 'expand_more'}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {isProfileDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-text-main">{getUserDisplayName()}</p>
                      <p className="text-xs text-text-muted mt-1">
                        {firebaseUser?.email || user?.email}
                      </p>
                    </div>
                    <Link
                      to={getProfileUrl()}
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-text-main hover:bg-gray-50 transition-colors"
                    >
                      <span className="material-symbols-outlined text-lg">person</span>
                      <span>الملف الشخصي</span>
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-text-main hover:bg-gray-50 transition-colors"
                    >
                      <span className="material-symbols-outlined text-lg">settings</span>
                      <span>الإعدادات</span>
                    </Link>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-right"
                    >
                      <span className="material-symbols-outlined text-lg">logout</span>
                      <span>تسجيل الخروج</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button
                  onClick={openLoginModal}
                  className="bg-primary hover:bg-primary-dark text-white text-xs sm:text-sm font-bold px-3 lg:px-5 py-1.5 lg:py-2 rounded-lg transition-colors shadow-sm whitespace-nowrap"
                >
                  تسجيل الدخول
                  </button>
              </>
            )}
          </div>

          {/* Mobile menu button and profile */}
          <div className="hidden items-center gap-2">
            {isAuthenticated || firebaseUser ? (
              <div className="relative" ref={mobileDropdownRef}>
                <button
                  onClick={() => setIsMobileProfileDropdownOpen(!isMobileProfileDropdownOpen)}
                  className="flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border-2 border-primary/20">
                    {getUserPhoto() ? (
                      <img
                        src={getUserPhoto()!}
                        alt={getUserDisplayName()}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xs font-bold text-primary">
                        {getUserInitials()}
                      </span>
                    )}
                  </div>
                  <span className="material-symbols-outlined text-lg text-text-muted">
                    {isMobileProfileDropdownOpen ? 'expand_less' : 'expand_more'}
                  </span>
                </button>

                {/* Mobile Dropdown Menu */}
                {isMobileProfileDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-text-main">{getUserDisplayName()}</p>
                      <p className="text-xs text-text-muted mt-1">
                        {firebaseUser?.email || user?.email}
                      </p>
                    </div>
                    <Link
                      to={getProfileUrl()}
                      onClick={() => setIsMobileProfileDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-text-main hover:bg-gray-50 transition-colors"
                    >
                      <span className="material-symbols-outlined text-lg">person</span>
                      <span>الملف الشخصي</span>
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setIsMobileProfileDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-text-main hover:bg-gray-50 transition-colors"
                    >
                      <span className="material-symbols-outlined text-lg">settings</span>
                      <span>الإعدادات</span>
                    </Link>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={() => {
                        setIsMobileProfileDropdownOpen(false)
                        handleLogout()
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-right"
                    >
                      <span className="material-symbols-outlined text-lg">logout</span>
                      <span>تسجيل الخروج</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={openLoginModal}
                className="text-xs font-medium px-3 py-1.5 rounded-lg text-text-main hover:bg-gray-50 transition-colors whitespace-nowrap"
              >
                تسجيل الدخول
              </button>
            )}
          </div>
        </div>
      </div>

    </header>
  )
}

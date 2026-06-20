'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export default function Header() {
  const { user: authUser, userProfile, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const isActive = (to: string) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false)
      }
    }
    if (isProfileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isProfileDropdownOpen])

  const handleLogout = async () => {
    try {
      await logout()
      setIsProfileDropdownOpen(false)
      navigate('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const getUserDisplayName = () => {
    if (authUser?.fullName) return authUser.fullName
    if (authUser?.email) return authUser.email.split('@')[0]
    return 'المستخدم'
  }

  const getUserPhoto = () => {
    if (userProfile?.photoURL?.trim()) return userProfile.photoURL
    if (authUser?.avatar?.trim()) return authUser.avatar
    return null
  }

  const getUserInitials = () => {
    const name = getUserDisplayName()
    const parts = name.split(' ')
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : name.substring(0, 2).toUpperCase()
  }

  const getProfileUrl = () => {
    if (!userProfile?.accountType) return '/choose-role'
    return authUser?.id ? `/profile/${authUser.id}` : '/choose-role'
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
              <span
                className="material-symbols-outlined text-text-main"
                style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1" }}
              >
                menu_book
              </span>
            </div>
            <span
              className="text-xl font-bold text-text-main"
              style={{ fontFamily: 'Noto Serif, serif' }}
            >
              قرآن
            </span>
          </Link>

          {/* Auth Area */}
          <div className="flex items-center gap-3">
            {authUser ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden border-2 border-primary/30 bg-primary/10">
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
                  <span className="material-symbols-outlined text-text-muted" style={{ fontSize: '20px' }}>
                    {isProfileDropdownOpen ? 'expand_less' : 'expand_more'}
                  </span>
                </button>

                {isProfileDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-text-main">{getUserDisplayName()}</p>
                      <p className="text-xs text-text-muted mt-0.5">{authUser?.email}</p>
                    </div>
                    <Link
                      to={getProfileUrl()}
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-main hover:bg-gray-50 transition-colors"
                    >
                      <span className="material-symbols-outlined text-text-muted" style={{ fontSize: '20px' }}>person</span>
                      الملف الشخصي
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-main hover:bg-gray-50 transition-colors"
                    >
                      <span className="material-symbols-outlined text-text-muted" style={{ fontSize: '20px' }}>settings</span>
                      الإعدادات
                    </Link>
                    <div className="border-t border-gray-100 my-1" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors text-right"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>logout</span>
                      تسجيل الخروج
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/"
                className="text-sm font-bold px-5 py-2 rounded-xl bg-primary text-text-main transition-all hover:bg-primary-hover shadow-sm"
              >
                تسجيل الدخول
              </Link>
            )}
          </div>

        </div>
      </div>
    </header>
  )
}

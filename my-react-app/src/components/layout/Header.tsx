'use client'

import React from "react";
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAppStore } from '../../store/useAppStore'

export default function Header() {
  const openLoginModal = useAppStore((state) => state.openLoginModal)
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navItems = [
    { to: '/programs', label: 'البرامج' },
    { to: '/roadmap', label: 'الخارطة' },
    { to: '/teachers', label: 'المعلمين' },
  ]

  const isActive = (to: string) => {
    if (to === '/') return location.pathname === '/'
    return location.pathname === to || location.pathname.startsWith(`${to}/`)
  }

  const closeMobileMenu = () => setIsMobileMenuOpen(false)

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 text-primary">
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
            <span className="text-xl font-bold tracking-tight text-text-main">
              القرآن أونلاين
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive(item.to) ? 'text-primary' : 'hover:text-primary'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={openLoginModal}
              className="text-sm font-medium px-4 py-2 rounded-lg text-text-main hover:bg-gray-50 transition-colors"
            >
              تسجيل الدخول
            </button>
            <Link
              to="/start-free"
              className="bg-primary hover:bg-primary-dark text-white text-sm font-bold px-5 py-2 rounded-lg transition-colors shadow-sm"
            >
              ابدأ تجربة مجانية
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              type="button"
              className="text-text-main hover:text-primary"
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-nav"
              onClick={() => setIsMobileMenuOpen((current) => !current)}
            >
              <span className="material-symbols-outlined">{isMobileMenuOpen ? 'close' : 'menu'}</span>
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <>
          <button
            type="button"
            aria-label="Close menu"
            className="md:hidden fixed inset-0 bg-black/30"
            onClick={closeMobileMenu}
          />
          <div id="mobile-nav" className="md:hidden relative bg-white border-t border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
              <nav className="flex flex-col gap-2">
                {navItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={closeMobileMenu}
                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      isActive(item.to)
                        ? 'bg-primary/10 text-primary'
                        : 'text-text-main hover:bg-gray-50 hover:text-primary'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => {
                    closeMobileMenu()
                    openLoginModal()
                  }}
                  className="w-full text-sm font-semibold px-4 py-3 rounded-lg text-text-main hover:bg-gray-50 transition-colors"
                >
                  تسجيل الدخول
                </button>
                <Link
                  to="/start-free"
                  onClick={closeMobileMenu}
                  className="w-full text-center bg-primary hover:bg-primary-dark text-white text-sm font-bold px-5 py-3 rounded-lg transition-colors shadow-sm"
                >
                  ابدأ تجربة مجانية
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  )
}

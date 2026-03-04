'use client'

import { Link } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'

export default function Header() {
  const openLoginModal = useAppStore((state) => state.openLoginModal)

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
            <Link
              to="/programs"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              البرامج
            </Link>
            <Link
              to="/roadmap"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              الخارطة
            </Link>
            <Link
              to="/teachers"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              المعلمين
            </Link>
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
            <button className="text-text-main hover:text-primary">
              <span className="material-symbols-outlined">menu</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

'use client'

import { useState } from 'react'
import Header from '../../components/layout/Header'
import LoginModal from '../../components/modals/LoginModal'
import Popup from '../../components/modals/Popup'
import { useAppStore } from '../../store/useAppStore'


interface EmailSignupProps {
  onEmailSubmitted: () => void
}

export default function EmailSignup({ onEmailSubmitted }: EmailSignupProps) {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { setEmailSubmitted } = useAppStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || isSubmitting) return

    setIsSubmitting(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    
    setEmailSubmitted(email)
    setIsSubmitting(false)
    onEmailSubmitted()
  }

  return (
    <>
      <Header />
      <div className="relative z-10 flex flex-col min-h-screen w-full overflow-x-hidden bg-background-light dark:bg-background-dark">
        {/* Background Gradient Mesh */}
        <div
          className="fixed inset-0 z-0 pointer-events-none opacity-40"
          style={{
            background: 'radial-gradient(circle at 50% 10%, rgba(213, 170, 42, 0.15) 0%, rgba(248, 247, 246, 0) 60%)',
          }}
        />

        {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 md:px-6 w-full max-w-7xl mx-auto">
        <div className="layout-content-container flex flex-col items-center w-full max-w-[800px] py-12 md:py-20 gap-10">
          {/* Hero Section */}
          <div className="flex flex-col gap-6 text-center items-center">
            <h1 className="text-text-main dark:text-white text-5xl md:text-6xl lg:text-7xl font-black leading-tight tracking-[-0.033em]">
              جرّب أول حصة{' '}
              <span className="text-primary relative inline-block">
                مجاناً
                <svg
                  className="absolute -bottom-2 w-full h-3 text-primary/30 left-0"
                  preserveAspectRatio="none"
                  viewBox="0 0 100 10"
                >
                  <path
                    d="M0 5 Q 50 10 100 5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                  />
                </svg>
              </span>
            </h1>
            <p className="text-text-muted dark:text-gray-400 text-lg md:text-xl font-medium leading-relaxed max-w-2xl">
              ابدأ رحلتك في تعلم القرآن الكريم اليوم مع نخبة من المعلمين المعتمدين،
              بخطوات بسيطة ومن منزلك.
            </p>
          </div>

          {/* Feature Icons */}
          <div className="flex flex-wrap justify-center gap-6 md:gap-12 w-full">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
                <span className="material-symbols-outlined">credit_card_off</span>
              </div>
              <span className="text-text-main dark:text-gray-200 font-bold text-base">
                لا حاجة لبطاقة ائتمان
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
                <span className="material-symbols-outlined">verified_user</span>
              </div>
              <span className="text-text-main dark:text-gray-200 font-bold text-base">
                معلمون معتمدون
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
                <span className="material-symbols-outlined">schedule</span>
              </div>
              <span className="text-text-main dark:text-gray-200 font-bold text-base">
                أوقات مرنة
              </span>
            </div>
          </div>

          {/* Input Field & CTA */}
          <div className="w-full max-w-[540px] mt-2">
            <form
              onSubmit={handleSubmit}
              className="relative flex flex-col sm:flex-row w-full gap-2 p-2 bg-white dark:bg-background-dark border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg shadow-gray-200/50 dark:shadow-none"
            >
              <div className="flex items-center flex-1 px-4 h-14">
                <span className="material-symbols-outlined text-gray-400 ml-3">mail</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-full bg-transparent border-none focus:ring-0 text-text-main dark:text-white placeholder:text-gray-400 text-base"
                  placeholder="أدخل بريدك الإلكتروني"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting || !email}
                className="h-14 sm:w-36 rounded-lg bg-primary hover:bg-primary-dark transition-colors text-white dark:text-background-dark font-bold text-lg shadow-md flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{isSubmitting ? 'جاري...' : 'ابدأ'}</span>
                {!isSubmitting && (
                  <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform rtl:rotate-180">
                    arrow_right_alt
                  </span>
                )}
              </button>
            </form>
            <p className="text-center text-xs text-gray-400 mt-3">
              نقوم بحماية بياناتك ولن نشاركها مع أي طرف ثالث.
            </p>
          </div>
        </div>

        {/* Social Proof Strip */}
        <div className="w-full border-t border-gray-200 dark:border-gray-800 pt-10 pb-20">
          <div className="flex flex-col items-center gap-8">
            <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest">
              يثق بنا أكثر من ١٥٠٠ طالب حول العالم
            </p>
            {/* Stats Grid */}
            <div className="flex flex-wrap justify-center gap-8 md:gap-16 text-center mb-8">
              <div className="flex flex-col items-center">
                <span className="text-3xl font-black text-text-main dark:text-white">
                  +١٥٠٠
                </span>
                <span className="text-sm text-text-muted">طالب نشط</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-3xl font-black text-text-main dark:text-white">
                  +٥٠
                </span>
                <span className="text-sm text-text-muted">معلم خبير</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-3xl font-black text-text-main dark:text-white">
                  ٤.٩/٥
                </span>
                <span className="text-sm text-text-muted">تقييم الطلاب</span>
              </div>
            </div>
          </div>
        </div>
      </main>
      <LoginModal />
      <Popup />
    </div>
    </>
  )
}

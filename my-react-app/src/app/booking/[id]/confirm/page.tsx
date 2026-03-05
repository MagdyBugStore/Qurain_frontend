'use client'

import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Header from '../../../../components/layout/Header'

export default function BookingConfirmPage() {
  const { id } = useParams<{ id: string }>()
  const [techCheckConfirmed, setTechCheckConfirmed] = useState(false)
  const [bookingConfirmed, setBookingConfirmed] = useState(false)

  const handleConfirm = () => {
    setBookingConfirmed(true)
  }

  if (bookingConfirmed) {
    return (
      <>
        <Header />
        <main className="flex-grow flex flex-col md:flex-row items-center justify-center p-6 gap-8 bg-background-light dark:bg-background-dark min-h-screen">
          {/* Success State */}
          <div className="w-full max-w-lg bg-white dark:bg-surface-dark rounded-xl shadow-lg border border-slate-200 dark:border-[#393528] overflow-hidden flex flex-col justify-center items-center h-fit min-h-[500px] text-center p-8 relative">
            {/* Decorative background pattern */}
            <div
              className="absolute inset-0 opacity-5 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(#f4c025 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />
            <div className="relative z-10 flex flex-col items-center gap-6 max-w-sm">
              {/* Success Animation */}
              <div className="relative size-24 mb-2">
                <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
                <div className="absolute inset-2 bg-primary/30 rounded-full"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="size-16 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/30">
                    <span className="material-symbols-outlined text-[#181611] text-4xl font-bold">check</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">تم الحجز بنجاح!</h2>
                <p className="text-slate-500 dark:text-[#bab29c]">
                  بارك الله في وقتك وعلمك. تم إرسال تفاصيل الجلسة ورابط الدخول إلى بريدك الإلكتروني.
                </p>
              </div>
              <div className="w-full bg-slate-50 dark:bg-[#2c281e] rounded-lg p-4 border border-slate-100 dark:border-[#393528] flex flex-col gap-2">
                <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold">
                  رقم الحجز
                </p>
                <p className="text-xl font-mono font-bold text-slate-900 dark:text-white tracking-widest">
                  #QO-8492
                </p>
              </div>
              <div className="flex flex-col w-full gap-3 mt-4">
                <button className="w-full bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">calendar_add_on</span>
                  إضافة للتقويم
                </button>
                <Link
                  to="/"
                  className="text-primary hover:text-primary/80 text-sm font-bold py-2 transition-colors"
                >
                  العودة للرئيسية
                </Link>
              </div>
            </div>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="flex-grow flex flex-col md:flex-row items-center justify-center p-6 gap-8 bg-background-light dark:bg-background-dark min-h-screen">
        {/* Booking Confirmation */}
        <div className="w-full max-w-lg bg-white dark:bg-surface-dark rounded-xl shadow-lg border border-slate-200 dark:border-[#393528] overflow-hidden flex flex-col h-fit">
          <div className="p-6 border-b border-slate-100 dark:border-[#393528]">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">تأكيد الحجز</h1>
            <p className="text-slate-500 dark:text-[#bab29c] text-sm">
              يرجى مراجعة تفاصيل الجلسة قبل الدفع والتأكيد النهائي
            </p>
          </div>
          <div className="p-6 flex flex-col gap-6">
            {/* Teacher Card */}
            <div className="flex gap-4 p-4 rounded-lg bg-slate-50 dark:bg-[#2c281e] border border-slate-100 dark:border-[#393528]">
              <div
                className="size-16 rounded-lg bg-cover bg-center shrink-0"
                style={{
                  backgroundImage:
                    'url(https://lh3.googleusercontent.com/aida-public/AB6AXuBED3Rycb2Y392o2F5Rz_493I9-Uqvm22l2Cp_rMZPbF3ES9uLAo7GirLW-jsOIqK6APFHHBRKZUULO6BxGnV8hyjDKSmwKXol6wWPCOu33xbM7U1GAk7ZKLlXYjkwPviSLn3K6im6e0mLFqKOojc-C1pPF4rz1fq9GORh1frgCT7F_GyEO4IPos2yuY5xOzCV77-IuVSsZdiVyOK2pVt4T7ftE3mEUTrmNVN_s_h6MJS0ofrPFOOeAeqdclQtKHYNEliiUGAHQ4AF-)',
                }}
              />
              <div className="flex flex-col justify-center">
                <h3 className="text-slate-900 dark:text-white font-bold text-lg">الشيخ أحمد محمد</h3>
                <p className="text-primary text-sm font-medium">تلاوة وتجويد - مستوى متقدم</p>
              </div>
            </div>
            {/* Session Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">calendar_today</span>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-[#bab29c]">التاريخ</p>
                  <p className="font-medium">الجمعة، ٢٥ أكتوبر ٢٠٢٣</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">schedule</span>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-[#bab29c]">الوقت</p>
                  <p className="font-medium">٠٤:٠٠ م - ٠٥:٠٠ م (توقيت مكة)</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">videocam</span>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-[#bab29c]">المنصة</p>
                  <p className="font-medium">Zoom Meeting</p>
                </div>
              </div>
            </div>
            <div className="h-px bg-slate-100 dark:bg-[#393528] w-full my-2"></div>
            {/* Tech Check */}
            <label className="group flex gap-3 items-start cursor-pointer">
              <div className="relative flex items-center pt-1">
                <input
                  className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-slate-300 dark:border-[#544e3b] bg-transparent text-primary checked:border-primary checked:bg-primary transition-all focus:ring-0 focus:ring-offset-0"
                  type="checkbox"
                  checked={techCheckConfirmed}
                  onChange={(e) => setTechCheckConfirmed(e.target.checked)}
                />
                <span className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-900 dark:text-[#181611] opacity-0 peer-checked:opacity-100">
                  <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path
                      clipRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      fillRule="evenodd"
                    />
                  </svg>
                </span>
              </div>
              <span className="text-sm text-slate-600 dark:text-slate-300 select-none group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                أقر بأنني قمت بإجراء فحص تقني للصوت والكاميرا وأن الاتصال بالإنترنت مستقر.
              </span>
            </label>
          </div>
          {/* Actions */}
          <div className="p-6 pt-0 flex gap-3">
            <button
              onClick={handleConfirm}
              disabled={!techCheckConfirmed}
              className="flex-1 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-[#181611] font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">check_circle</span>
              تأكيد الحجز
            </button>
            <Link
              to={`/teachers/${id}`}
              className="bg-transparent border border-slate-300 dark:border-[#544e3b] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#2c281e] font-medium py-3 px-6 rounded-lg transition-colors"
            >
              العودة
            </Link>
          </div>
        </div>
        {/* Arrow for visual flow (hidden on mobile) */}
        <div className="hidden md:flex flex-col items-center justify-center text-slate-300 dark:text-[#393528]">
          <span className="material-symbols-outlined text-4xl rotate-180">arrow_right_alt</span>
        </div>
      </main>
    </>
  )
}

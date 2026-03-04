'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/layout/Header'

export default function WaitingRoomPage() {
  const [isTutorLate, setIsTutorLate] = useState(false)
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 12, seconds: 45 })

  // Note: In production, this would check actual tutor status from API

  useEffect(() => {
    // Simulate tutor being late after 5 minutes
    const lateTimer = setTimeout(() => {
      setIsTutorLate(true)
    }, 300000) // 5 minutes

    // Countdown timer
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        let { days, hours, minutes, seconds } = prev
        if (seconds > 0) {
          seconds--
        } else if (minutes > 0) {
          minutes--
          seconds = 59
        } else if (hours > 0) {
          hours--
          minutes = 59
          seconds = 59
        } else if (days > 0) {
          days--
          hours = 23
          minutes = 59
          seconds = 59
        }
        return { days, hours, minutes, seconds }
      })
    }, 1000)

    return () => {
      clearTimeout(lateTimer)
      clearInterval(interval)
    }
  }, [])

  if (isTutorLate) {
    return (
      <>
        <Header />
        <main className="flex-grow flex flex-col items-center justify-center px-4 py-8 relative bg-background-dark">
          <div className="w-full max-w-[640px] flex flex-col items-center gap-8 z-10">
            {/* Notification Banner */}
            <div className="w-full bg-primary/10 border border-primary/20 rounded-xl p-6 flex flex-col items-center justify-center text-center animate-pulse">
              <div className="flex items-center gap-3 mb-2">
                <span className="material-symbols-outlined text-primary text-3xl">schedule</span>
                <h3 className="text-primary text-2xl font-bold leading-tight">المعلم يتأخر قليلاً — انتظر 5 دقائق</h3>
              </div>
              <p className="text-text-secondary text-base font-normal leading-normal">
                نعتذر عن التأخير. سيقوم المعلم بالانضمام إلى الجلسة قريباً. يرجى البقاء في هذه الصفحة.
              </p>
            </div>

            {/* Timer Section */}
            <div className="grid grid-cols-3 gap-4 w-full max-w-md">
              <div className="flex flex-col items-center gap-2">
                <div className="w-full aspect-square flex items-center justify-center bg-surface-dark border border-[#393528] rounded-xl shadow-lg">
                  <span className="text-white text-4xl font-bold font-display">00</span>
                </div>
                <span className="text-text-secondary text-sm font-medium">ساعة</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-full aspect-square flex items-center justify-center bg-surface-dark border border-[#393528] rounded-xl shadow-lg relative overflow-hidden">
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-primary/20">
                    <div className="h-full bg-primary w-[75%]"></div>
                  </div>
                  <span className="text-primary text-4xl font-bold font-display">05</span>
                </div>
                <span className="text-text-secondary text-sm font-medium">دقيقة</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-full aspect-square flex items-center justify-center bg-surface-dark border border-[#393528] rounded-xl shadow-lg">
                  <span className="text-white text-4xl font-bold font-display">00</span>
                </div>
                <span className="text-text-secondary text-sm font-medium">ثانية</span>
              </div>
            </div>

            {/* Status Card */}
            <div className="flex flex-col items-center gap-6 w-full mt-4">
              <div className="relative w-full aspect-video max-w-[420px] rounded-xl overflow-hidden shadow-2xl border border-[#393528] bg-surface-dark group">
                <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-transparent to-transparent"></div>
                <div className="relative z-10 flex flex-col items-center justify-center h-full gap-4 p-6">
                  <div className="size-16 rounded-full bg-background-dark/80 backdrop-blur-sm flex items-center justify-center border border-primary/30">
                    <span className="material-symbols-outlined text-primary text-3xl animate-spin">sync</span>
                  </div>
                  <div className="text-center">
                    <p className="text-white text-lg font-bold mb-1">في انتظار المعلم</p>
                    <p className="text-text-secondary text-sm">جاري الاتصال...</p>
                  </div>
                </div>
              </div>
              <button className="flex w-full max-w-[300px] cursor-pointer items-center justify-center gap-2 rounded-lg h-12 px-6 bg-surface-dark hover:bg-[#393528] border border-[#393528] transition-all text-white text-sm font-bold leading-normal tracking-[0.015em]">
                <span className="material-symbols-outlined text-lg">chat</span>
                <span>إرسال رسالة للمعلم</span>
              </button>
            </div>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden bg-background-dark">
        {/* Decorative Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-4xl w-full flex flex-col items-center gap-10 z-10">
          {/* Tutor Profile Section */}
          <div className="flex flex-col items-center gap-6">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 to-primary/20 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative size-40 rounded-full border-4 border-surface-highlight overflow-hidden bg-surface-dark shadow-2xl">
                <img
                  alt="Portrait of Sheikh Abdul Rahman"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDyud-i-9P0U_oGbR-ZmSMYLEpJHEK8KhjDjUogY1bqtpYaOrARXn5eDCyVEdUitMJ_2VqE-v0SFsPY2g-4-mWhgr99ZMgfQES3RkreEK90eDRCCZBVngTMcrf8ls8PxK-GVHXxBhCldwFsK2bNMRt7oo9mW_XPC4iAKkDalJn8Qf17gCq0YWSe-TLidqwO-hE2byRYlJyZ-VFq1oJTbxBi_mkHHlR3ekUh5Searctsd4OV3-rEX7Ed55maQJAJ2dV0ga_QMmnmnj50"
                />
              </div>
              <div className="absolute bottom-2 right-2 bg-green-500 border-4 border-background-dark size-6 rounded-full"></div>
            </div>
            <div className="text-center space-y-2">
              <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">الشيخ عبد الرحمن</h1>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-highlight border border-white/5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
                </span>
                <p className="text-text-secondary text-sm font-medium">سيبدأ الدرس قريباً</p>
              </div>
            </div>
          </div>

          {/* Countdown Timer */}
          <div className="grid grid-cols-4 gap-4 md:gap-8 w-full max-w-2xl">
            {['ثانية', 'دقيقة', 'ساعة', 'يوم'].map((label, index) => {
              const values = [timeLeft.seconds, timeLeft.minutes, timeLeft.hours, timeLeft.days]
              const value = values[index]
              const isActive = index === 0 && value > 0

              return (
                <div key={label} className="flex flex-col items-center gap-2">
                  <div
                    className={`w-full aspect-square md:aspect-[4/3] flex flex-col items-center justify-center border border-surface-highlight rounded-2xl shadow-inner relative overflow-hidden group ${
                      isActive ? 'bg-surface-dark' : 'bg-surface-dark'
                    }`}
                  >
                    <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                    <span
                      className={`text-3xl md:text-5xl font-bold tabular-nums tracking-wider ${
                        isActive ? 'text-primary' : 'text-white'
                      }`}
                    >
                      {String(value).padStart(2, '0')}
                    </span>
                    <span className="text-xs text-text-secondary mt-1 font-medium">{label}</span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Controls & Actions */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-4 w-full">
            {[
              { icon: 'mic_off', label: 'الصوت' },
              { icon: 'videocam_off', label: 'الكاميرا' },
              { icon: 'settings', label: 'الإعدادات' },
            ].map((control) => (
              <button key={control.icon} className="group flex flex-col items-center gap-2">
                <div className="size-14 rounded-full bg-surface-highlight border border-white/5 flex items-center justify-center text-white hover:bg-primary hover:text-surface-dark transition-all duration-300 shadow-lg">
                  <span className={`material-symbols-outlined text-2xl group-hover:scale-110 transition-transform`}>
                    {control.icon}
                  </span>
                </div>
                <span className="text-xs text-text-secondary group-hover:text-primary transition-colors">
                  {control.label}
                </span>
              </button>
            ))}
            <div className="w-px h-12 bg-surface-highlight mx-4 hidden sm:block"></div>
            <button className="flex items-center gap-2 px-6 h-14 rounded-full border border-red-500/30 text-red-500 hover:bg-red-500/10 hover:border-red-500 transition-all">
              <span className="material-symbols-outlined">logout</span>
              <span className="font-bold">مغادرة</span>
            </button>
          </div>
        </div>

        {/* Self Video Preview */}
        <div className="absolute bottom-6 left-6 z-20 w-48 aspect-video bg-surface-dark rounded-xl border border-surface-highlight overflow-hidden shadow-2xl hidden md:block group">
          <img
            alt="User self video preview"
            className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuC7p6c8pmT6Sv7TOfB5tI4HlpG3eR1rNgt4cEWL9VqYfhkvsjJPyWU1qt5ezoUhtElwLv0gcoP3dxUyukKyryXNfmGK2lnMX2THuwoVsF6X3s62gX1n4JCoogV4-Um2shaWPnXum2q-bUHKNyxuaQiKHuBUAelNi_e38-CkW3Id2Y5i-CZGZuC-MLFWSfi3EosRYpkyJ6LzIi6J2kGLNLQOB8pVbRYhre2rYGHFPcQRkEowjLEM8AvI7Bie_udPKIs1iZvTWhtO7wCU"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] group-hover:backdrop-blur-none group-hover:bg-transparent transition-all">
            <span className="material-symbols-outlined text-white/50 text-3xl group-hover:hidden">videocam_off</span>
          </div>
          <div className="absolute bottom-2 right-2 bg-black/60 px-2 py-0.5 rounded text-[10px] text-white font-medium">
            أنت
          </div>
        </div>
      </main>

      {/* Tips Strip */}
      <div className="bg-surface-dark border-t border-surface-highlight py-4 px-6 relative z-30">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-2 text-primary font-bold whitespace-nowrap">
            <span className="material-symbols-outlined">lightbulb</span>
            <span>نصائح سريعة:</span>
          </div>
          <div className="flex flex-1 justify-around w-full gap-4 text-text-secondary text-center md:text-right">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary/50"></span>
              <span>تأكد من جودة اتصال الإنترنت لديك</span>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary/50"></span>
              <span>استخدم سماعات الرأس لجودة صوت أفضل</span>
            </div>
            <div className="hidden lg:flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary/50"></span>
              <span>حضر المصحف الخاص بك للمتابعة</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

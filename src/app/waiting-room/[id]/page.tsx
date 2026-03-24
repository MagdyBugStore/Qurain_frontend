'use client'

import React from "react";
import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Header from '../../../components/layout/Header'
import { useAuth } from '../../../contexts/AuthContext'
import { StudentService } from '../../../services/studentService'
import type { StudentSession } from '../../../shared/types/student.types'

export default function WaitingRoomPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()

  const [session, setSession] = useState<StudentSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isTutorLate, setIsTutorLate] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [isVideoOff, setIsVideoOff] = useState(true)
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [lateCountdownSeconds, setLateCountdownSeconds] = useState(5 * 60)

  const teacherName = session?.teacherName || 'المعلم'
  const teacherPhoto = session?.teacherPhoto || ''
  const meetingLink = session?.meetingLink

  useEffect(() => {
    if (!id || !user?.id) {
      setLoading(false)
      setError('لم يتم العثور على بيانات الجلسة.')
      return
    }

    const studentService = new StudentService()

    const loadSession = async () => {
      try {
        setLoading(true)
        setError(null)

        const [sessions, upcomingSession] = await Promise.all([
          studentService.getSessions(user.id, 'scheduled'),
          studentService.getUpcomingSession(user.id),
        ])

        const matchedSession =
          sessions.find((item) => item.id === id) ||
          (upcomingSession && upcomingSession.id === id ? upcomingSession : null)

        if (!matchedSession) {
          setSession(null)
          setError('الجلسة غير متاحة أو لا تملك صلاحية الوصول إليها.')
          return
        }

        setSession(matchedSession)
      } catch (err) {
        console.error('Error loading waiting room session:', err)
        setError(err instanceof Error ? err.message : 'تعذر تحميل بيانات الجلسة.')
      } finally {
        setLoading(false)
      }
    }

    void loadSession()
  }, [id, user?.id])

  const sessionStartTime = useMemo(() => {
    if (!session?.scheduledDate) return null
    const date = new Date(session.scheduledDate)
    return Number.isNaN(date.getTime()) ? null : date
  }, [session])

  useEffect(() => {
    if (!sessionStartTime) return undefined

    const updateCountdown = () => {
      const now = Date.now()
      const diffMs = Math.max(0, sessionStartTime.getTime() - now)
      const totalSeconds = Math.floor(diffMs / 1000)

      const days = Math.floor(totalSeconds / (24 * 60 * 60))
      const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / 3600)
      const minutes = Math.floor((totalSeconds % 3600) / 60)
      const seconds = totalSeconds % 60

      setTimeLeft({ days, hours, minutes, seconds })
      return totalSeconds
    }

    const initialSeconds = updateCountdown()
    if (initialSeconds === 0) {
      setIsTutorLate(true)
      setLateCountdownSeconds(5 * 60)
    }

    const interval = setInterval(() => {
      const remainingSeconds = updateCountdown()

      if (remainingSeconds === 0) {
        setIsTutorLate(true)
        setLateCountdownSeconds((prev) => (prev > 0 ? prev - 1 : 0))
      }
    }, 1000)

    return () => {
      clearInterval(interval)
    }
  }, [sessionStartTime])

  const lateTimerParts = useMemo(() => {
    const minutes = Math.floor(lateCountdownSeconds / 60)
    const seconds = lateCountdownSeconds % 60
    return { minutes, seconds }
  }, [lateCountdownSeconds])

  const triggerVibration = (pattern: number | number[]) => {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate(pattern)
    }
  }

  const controls = [
    {
      id: 'audio',
      icon: isMuted ? 'mic_off' : 'mic',
      label: isMuted ? 'تشغيل الصوت' : 'كتم الصوت',
      isActive: !isMuted,
      onClick: () =>
        setIsMuted((prev) => {
          const nextMuted = !prev
          // Short haptic feedback when user toggles speaking mode.
          triggerVibration(nextMuted ? [40] : [80, 30, 80])
          return nextMuted
        }),
    },
    {
      id: 'video',
      icon: isVideoOff ? 'videocam_off' : 'videocam',
      label: isVideoOff ? 'تشغيل الكاميرا' : 'إيقاف الكاميرا',
      isActive: !isVideoOff,
      onClick: () => setIsVideoOff((prev) => !prev),
    },
  ] as const

  const handleLeaveSession = () => {
    if (meetingLink) {
      window.open(meetingLink, '_blank', 'noopener,noreferrer')
      return
    }
    navigate('/student-profile')
  }

  if (loading) {
    return (
      <>
        <Header />
        <main className="flex-1 flex items-center justify-center p-6 bg-background-light dark:bg-background-dark">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
            <p className="mt-4 text-text-muted dark:text-slate-400">جاري تحميل غرفة الانتظار...</p>
          </div>
        </main>
      </>
    )
  }

  if (error || !session) {
    return (
      <>
        <Header />
        <main className="flex-1 flex items-center justify-center p-6 bg-background-light dark:bg-background-dark">
          <div className="w-full max-w-lg bg-white dark:bg-surface-dark border border-primary/20 rounded-xl p-6 text-center">
            <span className="material-symbols-outlined text-5xl text-primary">error</span>
            <h1 className="mt-3 text-xl font-bold text-text-main dark:text-white">تعذر فتح غرفة الانتظار</h1>
            <p className="mt-2 text-text-muted dark:text-slate-400">
              {error || 'الجلسة غير متاحة حالياً.'}
            </p>
            <button
              onClick={() => navigate('/student-profile')}
              className="mt-6 px-5 py-2.5 rounded-lg bg-primary text-background-dark font-bold hover:bg-primary/90 transition-colors"
            >
              العودة للملف الشخصي
            </button>
          </div>
        </main>
      </>
    )
  }

  if (isTutorLate) {
    return (
      <>
        <Header />
        <main className="flex-grow flex flex-col items-center justify-center px-4 py-8 relative bg-background-light dark:bg-background-dark">
          <div className="w-full max-w-[640px] flex flex-col items-center gap-8 z-10">
            {/* Notification Banner */}
            <div className="w-full bg-primary/10 border border-primary/20 rounded-xl p-6 flex flex-col items-center justify-center text-center animate-pulse">
              <div className="flex items-center gap-3 mb-2">
                <span className="material-symbols-outlined text-primary text-3xl">schedule</span>
                <h3 className="text-primary text-2xl font-bold leading-tight">المعلم يتأخر قليلاً — انتظر 5 دقائق</h3>
              </div>
              <p className="text-text-muted dark:text-slate-300 text-base font-normal leading-normal">
                نعتذر عن التأخير. سيقوم المعلم بالانضمام إلى الجلسة قريباً. يرجى البقاء في هذه الصفحة.
              </p>
            </div>

            {/* Timer Section */}
            <div className="grid grid-cols-3 gap-4 w-full max-w-md">
              <div className="flex flex-col items-center gap-2">
                <div className="w-full aspect-square flex items-center justify-center bg-white dark:bg-surface-dark border border-primary/10 rounded-xl shadow-lg">
                  <span className="text-text-main dark:text-white text-4xl font-bold font-display">00</span>
                </div>
                <span className="text-text-muted dark:text-slate-300 text-sm font-medium">ساعة</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-full aspect-square flex items-center justify-center bg-white dark:bg-surface-dark border border-primary/10 rounded-xl shadow-lg relative overflow-hidden">
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-primary/20">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${(lateCountdownSeconds / (5 * 60)) * 100}%` }}
                    />
                  </div>
                  <span className="text-primary text-4xl font-bold font-display">
                    {String(lateTimerParts.minutes).padStart(2, '0')}
                  </span>
                </div>
                <span className="text-text-muted dark:text-slate-300 text-sm font-medium">دقيقة</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-full aspect-square flex items-center justify-center bg-white dark:bg-surface-dark border border-primary/10 rounded-xl shadow-lg">
                  <span className="text-text-main dark:text-white text-4xl font-bold font-display">
                    {String(lateTimerParts.seconds).padStart(2, '0')}
                  </span>
                </div>
                <span className="text-text-muted dark:text-slate-300 text-sm font-medium">ثانية</span>
              </div>
            </div>

            {/* Status Card */}
            <div className="flex flex-col items-center gap-6 w-full mt-4">
              <div className="relative w-full aspect-video max-w-[420px] rounded-xl overflow-hidden shadow-2xl border border-primary/10 bg-white dark:bg-surface-dark group">
                <div className="absolute inset-0 bg-gradient-to-t from-background-light dark:from-background-dark via-transparent to-transparent"></div>
                <div className="relative z-10 flex flex-col items-center justify-center h-full gap-4 p-6">
                  <div className="size-16 rounded-full bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm flex items-center justify-center border border-primary/30">
                    <span className="material-symbols-outlined text-primary text-3xl animate-spin">sync</span>
                  </div>
                  <div className="text-center">
                    <p className="text-text-main dark:text-white text-lg font-bold mb-1">في انتظار المعلم</p>
                    <p className="text-text-muted dark:text-slate-300 text-sm">جاري الاتصال...</p>
                  </div>
                </div>
              </div>
              <button className="flex w-full max-w-[300px] cursor-pointer items-center justify-center gap-2 rounded-lg h-12 px-6 bg-white dark:bg-surface-dark hover:bg-primary/10 border border-primary/20 transition-all text-text-main dark:text-white text-sm font-bold leading-normal tracking-[0.015em]">
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
      <main className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden bg-background-light dark:bg-background-dark">
        {/* Decorative Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-4xl w-full flex flex-col items-center gap-10 z-10">
          {/* Tutor Profile Section */}
          <div className="flex flex-col items-center gap-6">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 to-primary/20 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative size-40 rounded-full border-4 border-primary/30 overflow-hidden bg-white dark:bg-surface-dark shadow-2xl">
                {teacherPhoto ? (
                  <img
                    alt={`صورة ${teacherName}`}
                    className="w-full h-full object-cover"
                    src={teacherPhoto}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-5xl text-primary">person</span>
                  </div>
                )}
              </div>
              <div className="absolute bottom-2 right-2 bg-green-500 border-4 border-background-light dark:border-background-dark size-6 rounded-full"></div>
            </div>
            <div className="text-center space-y-2">
              <h1 className="text-3xl md:text-4xl font-bold text-text-main dark:text-white tracking-tight">{teacherName}</h1>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-surface-dark border border-primary/20">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
                </span>
                <p className="text-text-muted dark:text-slate-300 text-sm font-medium">سيبدأ الدرس قريباً</p>
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
                    className={`w-full aspect-square md:aspect-[4/3] flex flex-col items-center justify-center border border-primary/10 rounded-2xl shadow-inner relative overflow-hidden group ${
                      isActive ? 'bg-white dark:bg-surface-dark' : 'bg-white dark:bg-surface-dark'
                    }`}
                  >
                    <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
                    <span
                      className={`text-3xl md:text-5xl font-bold tabular-nums tracking-wider ${
                        isActive ? 'text-primary' : 'text-text-main dark:text-white'
                      }`}
                    >
                      {String(value).padStart(2, '0')}
                    </span>
                    <span className="text-xs text-text-muted dark:text-slate-400 mt-1 font-medium">{label}</span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Controls & Actions */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-4 w-full">
            {controls.map((control) => (
              <button
                key={control.id}
                type="button"
                onClick={control.onClick}
                className="group flex flex-col items-center gap-2"
              >
                <div
                  className={`size-14 rounded-full border flex items-center justify-center transition-all duration-300 shadow-lg ${
                    control.isActive
                      ? 'bg-primary text-background-dark border-primary'
                      : 'bg-white dark:bg-surface-dark border-primary/10 text-text-main dark:text-white hover:bg-primary hover:text-background-dark'
                  }`}
                >
                  <span className={`material-symbols-outlined text-2xl group-hover:scale-110 transition-transform`}>
                    {control.icon}
                  </span>
                </div>
                <span className={`text-xs transition-colors ${control.isActive ? 'text-primary' : 'text-text-muted dark:text-slate-300 group-hover:text-primary'}`}>
                  {control.label}
                </span>
              </button>
            ))}
            <div className="w-px h-12 bg-primary/20 mx-4 hidden sm:block"></div>
            <button
              type="button"
              onClick={handleLeaveSession}
              className="flex items-center gap-2 px-6 h-14 rounded-full border border-red-500/30 text-red-500 hover:bg-red-500/10 hover:border-red-500 transition-all"
            >
              <span className="material-symbols-outlined">logout</span>
              <span className="font-bold">مغادرة</span>
            </button>
          </div>
        </div>

        {/* Self Video Preview */}
        <div className="absolute bottom-6 left-6 z-20 w-48 aspect-video bg-white dark:bg-surface-dark rounded-xl border border-primary/10 overflow-hidden shadow-2xl hidden md:block group">
          <div className="w-full h-full bg-background-light dark:bg-background-dark" />
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] group-hover:backdrop-blur-none group-hover:bg-transparent transition-all">
            <span className="material-symbols-outlined text-white/50 text-3xl group-hover:hidden">videocam_off</span>
          </div>
          <div className="absolute bottom-2 right-2 bg-black/60 px-2 py-0.5 rounded text-[10px] text-white font-medium">
            أنت
          </div>
        </div>
      </main>

      {/* Tips Strip */}
      <div className="bg-white dark:bg-surface-dark border-t border-primary/10 py-4 px-6 relative z-30">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-2 text-primary font-bold whitespace-nowrap">
            <span className="material-symbols-outlined">lightbulb</span>
            <span>نصائح سريعة:</span>
          </div>
          <div className="flex flex-1 justify-around w-full gap-4 text-text-muted dark:text-slate-300 text-center md:text-right">
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

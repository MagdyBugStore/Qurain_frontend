'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import Link from 'next/link'

type ViewMode = 'mushaf' | 'whiteboard'

export default function LiveSessionPage({ params }: { params: { id: string } }) {
  const [viewMode, setViewMode] = useState<ViewMode>('whiteboard')
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [sessionTime, setSessionTime] = useState({ hours: 0, minutes: 42, seconds: 15 })

  return (
    <>
      <Header />
      <main className="flex flex-1 overflow-hidden relative bg-background-light dark:bg-background-dark">
        {/* Right Sidebar (Tools) */}
        <aside className="w-16 md:w-20 bg-surface-light dark:bg-surface-dark border-l border-border-light dark:border-border-dark flex flex-col items-center py-6 gap-6 shadow-sm z-20">
          <div className="flex flex-col gap-4 w-full px-2">
            <button
              onClick={() => setViewMode('mushaf')}
              className={`group flex flex-col items-center gap-1 w-full p-2 rounded-xl transition-colors ${
                viewMode === 'mushaf'
                  ? 'bg-primary/10 dark:bg-primary/20'
                  : 'hover:bg-background-light dark:hover:bg-border-dark'
              }`}
              title="المصحف"
            >
              <div
                className={`p-2 rounded-lg shadow-sm ${
                  viewMode === 'mushaf'
                    ? 'bg-primary text-primary-content'
                    : 'bg-background-light dark:bg-border-dark text-text-light dark:text-text-dark'
                }`}
              >
                <span className="material-symbols-outlined">menu_book</span>
              </div>
              <span
                className={`text-[10px] font-medium ${
                  viewMode === 'mushaf'
                    ? 'text-primary dark:text-primary font-bold'
                    : 'text-text-muted-light dark:text-text-muted-dark'
                }`}
              >
                المصحف
              </span>
            </button>
            <button
              onClick={() => setViewMode('whiteboard')}
              className={`group flex flex-col items-center gap-1 w-full p-2 rounded-xl transition-colors ${
                viewMode === 'whiteboard'
                  ? 'bg-primary/10 dark:bg-primary/20'
                  : 'hover:bg-background-light dark:hover:bg-border-dark'
              }`}
              title="السبورة"
            >
              <div
                className={`p-2 rounded-lg shadow-sm ${
                  viewMode === 'whiteboard'
                    ? 'bg-primary text-primary-content'
                    : 'bg-background-light dark:bg-border-dark text-text-light dark:text-text-dark'
                }`}
              >
                <span className="material-symbols-outlined fill">draw</span>
              </div>
              <span
                className={`text-[10px] ${
                  viewMode === 'whiteboard'
                    ? 'text-primary dark:text-primary font-bold'
                    : 'text-text-muted-light dark:text-text-muted-dark font-medium'
                }`}
              >
                السبورة
              </span>
            </button>
            <button
              className="group flex flex-col items-center gap-1 w-full p-2 rounded-xl hover:bg-background-light dark:hover:bg-border-dark transition-colors"
              title="ملاحظات"
            >
              <div className="p-2 rounded-lg text-text-muted-light dark:text-text-muted-dark group-hover:text-text-light dark:group-hover:text-text-dark">
                <span className="material-symbols-outlined">sticky_note_2</span>
              </div>
              <span className="text-[10px] font-medium text-text-muted-light dark:text-text-muted-dark">ملاحظات</span>
            </button>
            <button
              className="group flex flex-col items-center gap-1 w-full p-2 rounded-xl hover:bg-background-light dark:hover:bg-border-dark transition-colors relative"
              title="محادثة"
            >
              <div className="p-2 rounded-lg text-text-muted-light dark:text-text-muted-dark group-hover:text-text-light dark:group-hover:text-text-dark relative">
                <span className="material-symbols-outlined">chat</span>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-surface-light dark:border-surface-dark"></span>
              </div>
              <span className="text-[10px] font-medium text-text-muted-light dark:text-text-muted-dark">شات</span>
            </button>
          </div>
          <div className="mt-auto flex flex-col gap-4 w-full px-2">
            <button className="flex items-center justify-center p-3 rounded-xl hover:bg-background-light dark:hover:bg-border-dark text-text-muted-light dark:text-text-muted-dark transition-colors">
              <span className="material-symbols-outlined">help</span>
            </button>
          </div>
        </aside>

        {/* Center Area */}
        <section className="flex-1 relative bg-[#fdfdfc] dark:bg-[#1a1a1a] flex flex-col">
          {viewMode === 'whiteboard' ? (
            <>
              {/* Toolbar */}
              <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark shadow-lg rounded-full px-4 py-2 flex items-center gap-2 z-10 max-w-[90%] overflow-x-auto">
                <button className="p-2 rounded-full hover:bg-background-light dark:hover:bg-border-dark text-text-light dark:text-text-dark" title="Select">
                  <span className="material-symbols-outlined">near_me</span>
                </button>
                <div className="w-px h-6 bg-border-light dark:bg-border-dark mx-1"></div>
                <button className="p-2 rounded-full bg-primary/20 text-primary-dark dark:text-primary font-bold shadow-inner" title="Pen">
                  <span className="material-symbols-outlined fill">edit</span>
                </button>
                <button className="p-2 rounded-full hover:bg-background-light dark:hover:bg-border-dark text-text-light dark:text-text-dark" title="Highlighter">
                  <span className="material-symbols-outlined">ink_highlighter</span>
                </button>
                <button className="p-2 rounded-full hover:bg-background-light dark:hover:bg-border-dark text-text-light dark:text-text-dark" title="Eraser">
                  <span className="material-symbols-outlined">ink_eraser</span>
                </button>
                <div className="w-px h-6 bg-border-light dark:bg-border-dark mx-1"></div>
                <button className="p-2 rounded-full hover:bg-background-light dark:hover:bg-border-dark text-text-light dark:text-text-dark" title="Shapes">
                  <span className="material-symbols-outlined">shapes</span>
                </button>
                <button className="p-2 rounded-full hover:bg-background-light dark:hover:bg-border-dark text-text-light dark:text-text-dark" title="Text">
                  <span className="material-symbols-outlined">title</span>
                </button>
                <div className="w-px h-6 bg-border-light dark:bg-border-dark mx-1"></div>
                <button className="p-2 rounded-full hover:bg-background-light dark:hover:bg-border-dark text-text-light dark:text-text-dark" title="Undo">
                  <span className="material-symbols-outlined">undo</span>
                </button>
                <button className="p-2 rounded-full hover:bg-background-light dark:hover:bg-border-dark text-text-light dark:text-text-dark" title="Redo">
                  <span className="material-symbols-outlined">redo</span>
                </button>
                <div className="w-px h-6 bg-border-light dark:bg-border-dark mx-1"></div>
                <button className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500" title="Clear All">
                  <span className="material-symbols-outlined">delete</span>
                </button>
              </div>

              {/* Canvas Background */}
              <div
                className="w-full h-full cursor-crosshair relative bg-white dark:bg-[#1a1a1a]"
                style={{
                  backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
                }}
              >
                {/* Simulated Drawings */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M 400 300 Q 500 200 600 300 T 800 300" fill="none" stroke="#f4c025" strokeLinecap="round" strokeWidth="4"></path>
                  <text direction="rtl" fill="#f4c025" fontFamily="Manrope" fontSize="24" x="500" y="250">
                    حرف الألف
                  </text>
                  <rect fill="none" height="100" rx="10" stroke="#181611" strokeWidth="2" width="150" x="200" y="150"></rect>
                  <circle cx="275" cy="200" fill="#f4c025" opacity="0.2" r="30"></circle>
                </svg>

                {/* Color Picker */}
                <div className="absolute bottom-6 right-6 bg-surface-light dark:bg-surface-dark p-2 rounded-lg shadow-md border border-border-light dark:border-border-dark flex items-center gap-2">
                  <div className="size-6 rounded-full bg-black border border-gray-200 cursor-pointer"></div>
                  <div className="size-6 rounded-full bg-red-500 cursor-pointer"></div>
                  <div className="size-6 rounded-full bg-blue-500 cursor-pointer"></div>
                  <div className="size-6 rounded-full bg-primary ring-2 ring-offset-2 ring-primary cursor-pointer"></div>
                </div>
              </div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-white dark:bg-[#1a1a1a]">
              <p className="text-text-secondary">عرض المصحف سيتم إضافته هنا</p>
            </div>
          )}

          {/* Student Video (Floating) */}
          <div className="absolute top-6 right-6 w-64 aspect-video bg-black rounded-xl shadow-2xl overflow-hidden border-2 border-surface-light dark:border-surface-dark group cursor-move">
            <div className="absolute top-2 left-2 z-10 bg-black/50 backdrop-blur-sm px-2 py-1 rounded text-xs text-white font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              الطالب: أحمد
            </div>
            <div className="absolute bottom-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-1 rounded bg-black/50 text-white hover:bg-black/70">
                <span className="material-symbols-outlined text-[16px]">mic_off</span>
              </button>
              <button className="p-1 rounded bg-black/50 text-white hover:bg-black/70">
                <span className="material-symbols-outlined text-[16px]">videocam_off</span>
              </button>
            </div>
            <div
              className="w-full h-full bg-cover bg-center"
              style={{
                backgroundImage:
                  "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCO97HjuULvt1KcU7b09dcYriUyBgMre37TqCpw8-cXPnIGyXdw2PzpD8Lcg707GADNOkaqKfO3UavFdNvGi_3X_jCaBBWZxmIYUu5eAZTyzQApzcA5Uuxw-481_6vymMWTpnqaJIZa4IKq8wT36aK9XaA46qbpSd3YhB0VZiRgjuVsrkUXeMz_rU2PV_e4IJLxcKmXFo4SyeFtDZzkt8RQ_V0FNuVNsbi2EkU0yN8nY6FF4rSbPgMTSB2eMqHngrZ2X8Dc77h4NwUl')",
              }}
            ></div>
          </div>

          {/* Tutor Video (Pinned Bottom Left) */}
          <div className="absolute bottom-6 left-6 w-48 aspect-video bg-surface-dark rounded-xl shadow-2xl overflow-hidden border-2 border-primary group">
            <div className="absolute top-2 left-2 z-10 bg-primary px-2 py-0.5 rounded text-[10px] text-primary-content font-bold shadow-sm">
              أنت (المعلم)
            </div>
            <div
              className="w-full h-full bg-cover bg-center opacity-90"
              style={{
                backgroundImage:
                  "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBJQwrVchPJynJ1e1DOqjcenWlg8N4mrbQ-0A6WtcHTl0ruFpg741Vy9v1a3Y45otmMvQ56aftWH1Nth3iD63kb3G6oHCoCLp4MXdJqKk02yR6l2tttIdy3BxfXtKpkBXgW_qaujcsjY3gO3FdrgO-O7yJbiOsXKeXVM0siywxQFv1FsW_dXPPIv7bijzXPxZZvtXjE931xMumdh3--mNb-MIzkjSV5FbrnlS8bapKeRmyoyLFD6FtS-NxYAjRG0HwzfDhjrmYtk8vZ')",
              }}
            ></div>
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors"></div>
            <div className="absolute bottom-2 left-2 z-10 flex gap-0.5">
              {[3, 2, 4].map((height, i) => (
                <div
                  key={i}
                  className="w-1 bg-white rounded-full animate-bounce"
                  style={{ height: `${height * 4}px`, animationDelay: `${i * 75}ms` }}
                ></div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Header with controls */}
      <header className="h-16 border-b border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark flex items-center justify-between px-6 z-50 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 text-text-light dark:text-text-dark">
            <div className="size-8 text-primary">
              <svg className="w-full h-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M42.1739 20.1739L27.8261 5.82609C29.1366 7.13663 28.3989 10.1876 26.2002 13.7654C24.8538 15.9564 22.9595 18.3449 20.6522 20.6522C18.3449 22.9595 15.9564 24.8538 13.7654 26.2002C10.1876 28.3989 7.13663 29.1366 5.82609 27.8261L20.1739 42.1739C21.4845 43.4845 24.5355 42.7467 28.1133 40.548C30.3042 39.2016 32.6927 37.3073 35 35C37.3073 32.6927 39.2016 30.3042 40.548 28.1133C42.7467 24.5355 43.4845 21.4845 42.1739 20.1739Z"
                  fill="currentColor"
                ></path>
              </svg>
            </div>
            <h2 className="text-lg font-bold tracking-tight">قرآن أونلاين</h2>
          </div>
          <div className="h-6 w-px bg-border-light dark:bg-border-dark mx-2"></div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            <span className="text-sm font-medium text-text-muted-light dark:text-text-muted-dark">
              مباشر: {String(sessionTime.hours).padStart(2, '0')}:{String(sessionTime.minutes).padStart(2, '0')}:
              {String(sessionTime.seconds).padStart(2, '0')}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center justify-center size-10 rounded-lg hover:bg-background-light dark:hover:bg-border-dark transition-colors text-text-muted-light dark:text-text-muted-dark hover:text-text-light dark:hover:text-text-dark">
            <span className="material-symbols-outlined">settings</span>
          </button>
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`flex items-center justify-center size-10 rounded-lg transition-colors ${
              isMuted
                ? 'bg-red-500 text-white'
                : 'bg-background-light dark:bg-border-dark text-text-light dark:text-text-dark'
            }`}
          >
            <span className="material-symbols-outlined">{isMuted ? 'mic_off' : 'mic'}</span>
          </button>
          <button
            onClick={() => setIsVideoOff(!isVideoOff)}
            className={`flex items-center justify-center size-10 rounded-lg transition-colors ${
              isVideoOff
                ? 'bg-red-500 text-white'
                : 'bg-background-light dark:bg-border-dark text-text-light dark:text-text-dark'
            }`}
          >
            <span className="material-symbols-outlined">{isVideoOff ? 'videocam_off' : 'videocam'}</span>
          </button>
          <Link
            href={`/post-session/${params.id}`}
            className="flex items-center justify-center px-4 h-10 rounded-lg bg-red-500 hover:bg-red-600 text-white font-bold text-sm gap-2 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">call_end</span>
            <span>إنهاء الجلسة</span>
          </Link>
        </div>
      </header>
    </>
  )
}

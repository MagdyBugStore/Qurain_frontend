'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/layout/Header'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type CheckStatus = 'checking' | 'passed' | 'failed'

export default function TechnicalCheckPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [cameraStatus, setCameraStatus] = useState<CheckStatus>('checking')
  const [micStatus, setMicStatus] = useState<CheckStatus>('checking')
  const [internetStatus, setInternetStatus] = useState<CheckStatus>('checking')

  // Simulate checks
  useEffect(() => {
    setTimeout(() => setCameraStatus('passed'), 1000)
    setTimeout(() => setMicStatus('failed'), 1500)
    setTimeout(() => setInternetStatus('passed'), 2000)
  }, [])

  const allPassed = cameraStatus === 'passed' && micStatus === 'passed' && internetStatus === 'passed'
  const hasError = micStatus === 'failed' || cameraStatus === 'failed' || internetStatus === 'failed'

  const handleRetry = () => {
    setCameraStatus('checking')
    setMicStatus('checking')
    setInternetStatus('checking')
    setTimeout(() => {
      setCameraStatus('passed')
      setMicStatus('passed')
      setInternetStatus('passed')
    }, 2000)
  }

  const handleEnter = () => {
    if (allPassed) {
      router.push(`/waiting-room/${params.id}`)
    }
  }

  if (allPassed) {
    return (
      <>
        <Header />
        <main className="flex-grow flex flex-col items-center justify-center p-4 sm:p-8 bg-background-light dark:bg-background-dark">
          <div className="w-full max-w-[800px] bg-white dark:bg-[#1a170d] rounded-xl shadow-sm border border-[#e6e3db] dark:border-[#3a3528] overflow-hidden">
            {/* Header Section */}
            <div className="p-6 sm:p-8 border-b border-[#e6e3db] dark:border-[#3a3528]">
              <h1 className="text-2xl font-bold text-[#181611] dark:text-white mb-2">فحص الأجهزة قبل الحصة</h1>
              <p className="text-[#8a8060] dark:text-[#a39b80]">
                يرجى التأكد من أن جميع الأجهزة تعمل بشكل صحيح لضمان تجربة تعليمية ممتازة.
              </p>
            </div>

            {/* Checks List */}
            <div className="p-6 sm:p-8 flex flex-col gap-6">
              {/* Camera Check */}
              <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl bg-[#fcfbf9] dark:bg-[#252115] border border-[#e6e3db] dark:border-[#3a3528]">
                <div className="relative w-32 h-24 sm:w-40 sm:h-28 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200">
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                      backgroundImage:
                        "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDmCPz6qYnudhiXSKdV4dZEnTfO75Y_5oLDeHDGhUaY3ZDecVexBcsopyaiQyTQDJoD6LC7iCmj4sTXolX40tFHhULQGsamlBKpSBpI_Hc4bxH0MW3bxQRLH17f76M_qe-jtlSOC_LxQbOelkDkjYBp0EITnNQanX9W5HEkPYIvV5EC_o5slNCfWPiwEfJpRz6xRWI6JjL8EZ8xswz-8Zt2N3BHlg35cibpRP0ib1eo69_gxEHy4k_uM8Sz-lrdiWcztiwpS15eq1OI')",
                    }}
                  ></div>
                  <div className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded">LIVE</div>
                </div>
                <div className="flex-grow text-center sm:text-right w-full">
                  <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                    <span className="material-symbols-outlined text-[#8a8060] dark:text-[#a39b80]">videocam</span>
                    <h3 className="font-bold text-lg text-[#181611] dark:text-white">الكاميرا</h3>
                  </div>
                  <p className="text-[#8a8060] dark:text-[#a39b80] text-sm">FaceTime HD Camera</p>
                </div>
                <div className="flex-shrink-0 flex items-center gap-2 text-green-600 bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-full border border-green-100 dark:border-green-900/30">
                  <span className="material-symbols-outlined text-[20px]">check_circle</span>
                  <span className="font-bold text-sm">جاهزة</span>
                </div>
              </div>

              {/* Microphone Check */}
              <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl bg-[#fcfbf9] dark:bg-[#252115] border border-[#e6e3db] dark:border-[#3a3528]">
                <div className="w-32 h-24 sm:w-40 sm:h-28 flex-shrink-0 flex flex-col items-center justify-center rounded-lg bg-gray-100 dark:bg-[#1e1b12] border border-dashed border-[#d1cdc2] dark:border-[#4a4433]">
                  <div className="flex items-end gap-1 h-12">
                    {[4, 8, 10, 6, 3].map((height, i) => (
                      <div
                        key={i}
                        className="w-1.5 bg-primary rounded-full animate-pulse"
                        style={{ height: `${height * 4}px` }}
                      ></div>
                    ))}
                  </div>
                </div>
                <div className="flex-grow text-center sm:text-right w-full">
                  <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                    <span className="material-symbols-outlined text-[#8a8060] dark:text-[#a39b80]">mic</span>
                    <h3 className="font-bold text-lg text-[#181611] dark:text-white">الميكروفون</h3>
                  </div>
                  <p className="text-[#8a8060] dark:text-[#a39b80] text-sm">Default Microphone (Internal)</p>
                </div>
                <div className="flex-shrink-0 flex items-center gap-2 text-green-600 bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-full border border-green-100 dark:border-green-900/30">
                  <span className="material-symbols-outlined text-[20px]">check_circle</span>
                  <span className="font-bold text-sm">يعمل جيداً</span>
                </div>
              </div>

              {/* Internet Speed Check */}
              <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl bg-[#fcfbf9] dark:bg-[#252115] border border-[#e6e3db] dark:border-[#3a3528]">
                <div className="w-32 h-24 sm:w-40 sm:h-28 flex-shrink-0 flex flex-col items-center justify-center rounded-lg bg-gray-100 dark:bg-[#1e1b12] border border-dashed border-[#d1cdc2] dark:border-[#4a4433]">
                  <span className="material-symbols-outlined text-4xl text-primary mb-1">speed</span>
                  <span className="text-xs font-bold text-[#181611] dark:text-white">50 Mbps</span>
                </div>
                <div className="flex-grow text-center sm:text-right w-full">
                  <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                    <span className="material-symbols-outlined text-[#8a8060] dark:text-[#a39b80]">wifi</span>
                    <h3 className="font-bold text-lg text-[#181611] dark:text-white">سرعة الإنترنت</h3>
                  </div>
                  <p className="text-[#8a8060] dark:text-[#a39b80] text-sm">الاتصال مستقر ومناسب للفيديو</p>
                </div>
                <div className="flex-shrink-0 flex items-center gap-2 text-green-600 bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-full border border-green-100 dark:border-green-900/30">
                  <span className="material-symbols-outlined text-[20px]">check_circle</span>
                  <span className="font-bold text-sm">ممتاز</span>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-6 sm:p-8 bg-[#f8f8f5] dark:bg-[#221e10] border-t border-[#e6e3db] dark:border-[#3a3528] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-[#8a8060] dark:text-[#a39b80] text-sm">
                <span className="material-symbols-outlined text-[18px]">info</span>
                <span>إذا واجهت مشكلة، يرجى التواصل مع الدعم الفني</span>
              </div>
              <div className="flex gap-4 w-full sm:w-auto">
                <button
                  onClick={handleRetry}
                  className="flex-1 sm:flex-none h-12 px-8 rounded-lg border border-[#d1cdc2] dark:border-[#4a4433] text-[#181611] dark:text-white font-bold hover:bg-gray-50 dark:hover:bg-[#2a261a] transition-colors"
                >
                  إعادة الفحص
                </button>
                <button
                  onClick={handleEnter}
                  className="flex-1 sm:flex-none h-12 px-8 rounded-lg bg-primary hover:bg-[#e0b020] text-[#181611] font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <span>دخول الحصة</span>
                  <span className="material-symbols-outlined rtl:rotate-180">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        </main>
      </>
    )
  }

  // Error state
  return (
    <>
      <Header />
      <main className="flex-1 flex justify-center py-10 px-4 sm:px-10 bg-background-light dark:bg-background-dark">
        <div className="w-full max-w-[720px] flex flex-col gap-8">
          {/* Header Section */}
          <div className="flex flex-col gap-3 text-center sm:text-right">
            <h1 className="text-text-main dark:text-white text-3xl sm:text-4xl font-black leading-tight tracking-[-0.033em]">
              فحص تقني قبل الجلسة
            </h1>
            <p className="text-text-secondary dark:text-gray-400 text-base font-normal leading-normal">
              نحن نتحقق من أجهزتك لضمان تجربة تعليمية سلسة وبدون انقطاع.
            </p>
          </div>

          {/* Check List Container */}
          <div className="flex flex-col gap-4">
            {/* Camera Item (Success) */}
            <div className="flex items-center gap-4 bg-white dark:bg-[#2a261a] p-5 rounded-xl border border-[#e5e7eb] dark:border-[#3a3525] shadow-sm justify-between transition-all hover:shadow-md">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 text-success shrink-0 size-12">
                  <span className="material-symbols-outlined text-[28px]">videocam</span>
                </div>
                <div className="flex flex-col justify-center gap-1">
                  <p className="text-text-main dark:text-white text-lg font-bold leading-normal">الكاميرا</p>
                  <p className="text-success text-sm font-medium leading-normal">تم التحقق بنجاح</p>
                </div>
              </div>
              <div className="shrink-0 text-success">
                <span className="material-symbols-outlined text-[32px]">check_circle</span>
              </div>
            </div>

            {/* Microphone Item (Error) */}
            <div className="flex items-center gap-4 bg-red-50 dark:bg-red-900/10 p-5 rounded-xl border border-red-200 dark:border-red-800/50 shadow-sm justify-between transition-all relative overflow-hidden">
              <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-error"></div>
              <div className="flex items-center gap-4 pr-3">
                <div className="flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40 text-error shrink-0 size-12">
                  <span className="material-symbols-outlined text-[28px]">mic_off</span>
                </div>
                <div className="flex flex-col justify-center gap-1">
                  <p className="text-text-main dark:text-white text-lg font-bold leading-normal">الميكروفون</p>
                  <p className="text-error text-sm font-bold leading-normal">لم يتم العثور على ميكروفون</p>
                </div>
              </div>
              <div className="shrink-0 text-error">
                <span className="material-symbols-outlined text-[32px]">cancel</span>
              </div>
            </div>

            {/* Internet Item (Success) */}
            <div className="flex items-center gap-4 bg-white dark:bg-[#2a261a] p-5 rounded-xl border border-[#e5e7eb] dark:border-[#3a3525] shadow-sm justify-between transition-all hover:shadow-md">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 text-success shrink-0 size-12">
                  <span className="material-symbols-outlined text-[28px]">wifi</span>
                </div>
                <div className="flex flex-col justify-center gap-1">
                  <p className="text-text-main dark:text-white text-lg font-bold leading-normal">الاتصال بالإنترنت</p>
                  <p className="text-success text-sm font-medium leading-normal">سرعة الاتصال جيدة</p>
                </div>
              </div>
              <div className="shrink-0 text-success">
                <span className="material-symbols-outlined text-[32px]">check_circle</span>
              </div>
            </div>
          </div>

          {/* Error Notice Box */}
          <div className="bg-primary/10 dark:bg-primary/5 border border-primary/20 rounded-lg p-4 flex gap-3 items-start">
            <span className="material-symbols-outlined text-primary mt-0.5">info</span>
            <div>
              <h4 className="font-bold text-text-main dark:text-white text-sm mb-1">تعذر إكمال الفحص</h4>
              <p className="text-text-secondary dark:text-gray-300 text-sm">
                يرجى التأكد من توصيل الميكروفون وسماحه للمتصفح بالوصول إليه، ثم حاول مرة أخرى.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-4 mt-4">
            <button
              disabled
              className="w-full flex cursor-not-allowed items-center justify-center overflow-hidden rounded-xl h-14 px-4 bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 text-lg font-bold leading-normal tracking-[0.015em] transition-all"
            >
              <span className="truncate">دخول الحصة</span>
              <span className="material-symbols-outlined mr-2 text-xl">login</span>
            </button>
            <button
              onClick={handleRetry}
              className="w-full flex cursor-pointer items-center justify-center overflow-hidden rounded-xl h-14 px-4 border-2 border-primary text-text-main dark:text-primary hover:bg-primary/10 transition-colors text-lg font-bold leading-normal tracking-[0.015em]"
            >
              <span className="truncate">إجراء الاختبار مجدداً</span>
              <span className="material-symbols-outlined mr-2 text-xl">refresh</span>
            </button>
            <div className="text-center mt-2">
              <a
                href="#"
                className="text-text-secondary hover:text-primary dark:text-gray-400 dark:hover:text-primary text-sm font-medium underline underline-offset-4 decoration-dotted"
              >
                تواجه مشكلة مستمرة؟ تواصل مع الدعم الفني
              </a>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

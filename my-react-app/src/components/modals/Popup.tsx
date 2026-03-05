'use client'

import { useAppStore } from '../../store/useAppStore'

export default function Popup() {
  const { isPopupOpen, closePopup } = useAppStore()

  if (!isPopupOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-xl shadow-2xl overflow-hidden border border-primary/10">
        {/* Close Button */}
        <button
          onClick={closePopup}
          className="absolute top-4 left-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
        >
          <span className="material-symbols-outlined">close</span>
        </button> 

        {/* Modal Header */}
        <div className="px-8 pt-10 pb-6 text-center">
          <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary">
            <span className="material-symbols-outlined text-3xl">menu_book</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            أهلاً بك في قرين أونلاين
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            يرجى اختيار الفئة العمرية لنتمكن من تخصيص تجربتك
          </p>
        </div>

        {/* Age Group Grid */}
        <div className="px-8 pb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-md mx-auto">
            {/* Option 1: Children */}
            <div className="group relative flex flex-col items-center p-4 rounded-xl border-2 border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-800/50 hover:border-primary/50 cursor-pointer transition-all">
              <div className="w-16 h-16 flex items-center justify-center rounded-full bg-primary/10 text-primary mb-3">
                <span className="material-symbols-outlined text-3xl">child_care</span>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100">أطفال</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">5-12</p>
            </div>

            {/* Option 2: Youth */}
            <div className="group relative flex flex-col items-center p-4 rounded-xl border-2 border-primary bg-primary/5 dark:bg-primary/10 cursor-pointer transition-all shadow-sm">
              <div className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white">
                <span className="material-symbols-outlined text-xs">check</span>
              </div>
              <div className="w-16 h-16 flex items-center justify-center rounded-full bg-primary/20 text-primary mb-3">
                <span className="material-symbols-outlined text-3xl">school</span>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100">شباب</h3>
              <p className="text-sm text-primary font-medium">13-18</p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-8 pb-10 flex flex-col gap-4">
          <button
            onClick={closePopup}
            className="w-full h-14 bg-primary text-slate-900 text-lg font-bold rounded-xl hover:bg-opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-primary/20"
          >
            متابعة
          </button>
          <button
            onClick={closePopup}
            className="w-full py-2 text-slate-500 dark:text-slate-400 font-medium hover:text-primary transition-colors text-center underline underline-offset-4 decoration-primary/30"
          >
            تخطي الآن
          </button>
        </div>

        {/* Decorative background elements */}
        <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-16 -left-16 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      </div>
    </div>
  )
}

'use client'

import Header from '../../../components/layout/Header'
import { Link } from 'react-router-dom'

export default function PostSessionSummaryPage() {
  return (
    <>
      <Header />
      <main className="flex-1 flex justify-center py-8 px-4 sm:px-8 bg-background-light dark:bg-background-dark">
        <div className="flex flex-col max-w-[960px] w-full gap-8">
          {/* Breadcrumbs */}
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Link to="/" className="text-text-secondary hover:text-primary transition-colors">
              الرئيسية
            </Link>
            <span className="material-symbols-outlined text-text-secondary text-sm rotate-180">chevron_right</span>
            <Link to="/dashboard" className="text-text-secondary hover:text-primary transition-colors">
              جلساتي
            </Link>
            <span className="material-symbols-outlined text-text-secondary text-sm rotate-180">chevron_right</span>
            <span className="text-text-main font-semibold">ملخص الجلسة</span>
          </div>

          {/* Title Section */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-start flex-wrap gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-black text-text-main mb-2">ملخص الجلسة</h1>
                <p className="text-text-secondary text-base">٢٤ أكتوبر ٢٠٢٣ • ٤٥ دقيقة</p>
              </div>
              <button className="flex items-center gap-2 text-primary font-bold hover:bg-primary/10 px-4 py-2 rounded-lg transition-colors">
                <span className="material-symbols-outlined">share</span>
                <span>مشاركة التقرير</span>
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Attendance */}
            <div className="bg-white dark:bg-surface-dark rounded-xl p-6 border border-border-light dark:border-border-dark shadow-sm flex flex-col gap-3 relative overflow-hidden group hover:border-primary/50 transition-colors">
              <div className="absolute top-0 right-0 w-1 h-full bg-green-500"></div>
              <div className="flex justify-between items-start">
                <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded-lg text-green-600 dark:text-green-400">
                  <span className="material-symbols-outlined">check_circle</span>
                </div>
              </div>
              <div>
                <p className="text-text-secondary text-sm font-medium mb-1">الحضور</p>
                <p className="text-text-main dark:text-white text-2xl font-bold">حاضر</p>
              </div>
            </div>

            {/* Duration */}
            <div className="bg-white dark:bg-surface-dark rounded-xl p-6 border border-border-light dark:border-border-dark shadow-sm flex flex-col gap-3 relative overflow-hidden group hover:border-primary/50 transition-colors">
              <div className="absolute top-0 right-0 w-1 h-full bg-blue-500"></div>
              <div className="flex justify-between items-start">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg text-blue-600 dark:text-blue-400">
                  <span className="material-symbols-outlined">schedule</span>
                </div>
              </div>
              <div>
                <p className="text-text-secondary text-sm font-medium mb-1">المدة</p>
                <p className="text-text-main dark:text-white text-2xl font-bold">٤٥ دقيقة</p>
              </div>
            </div>

            {/* Content */}
            <div className="bg-white dark:bg-surface-dark rounded-xl p-6 border border-border-light dark:border-border-dark shadow-sm flex flex-col gap-3 relative overflow-hidden group hover:border-primary/50 transition-colors">
              <div className="absolute top-0 right-0 w-1 h-full bg-primary"></div>
              <div className="flex justify-between items-start">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded-lg text-primary-dark dark:text-primary">
                  <span className="material-symbols-outlined">menu_book</span>
                </div>
              </div>
              <div>
                <p className="text-text-secondary text-sm font-medium mb-1">المحتوى</p>
                <p className="text-text-main dark:text-white text-xl font-bold leading-tight">سورة البقرة، ١-١٠</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Teacher Evaluation & Notes */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {/* Teacher Notes */}
              <div className="bg-white dark:bg-surface-dark rounded-xl p-6 border border-border-light dark:border-border-dark shadow-sm">
                <h3 className="text-lg font-bold text-text-main dark:text-white mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">edit_note</span>
                  ملاحظات المعلم
                </h3>
                <p className="text-text-main dark:text-white leading-relaxed mb-6">
                  أداء ممتاز اليوم يا أحمد. تحسنت مخارج الحروف بشكل ملحوظ في الآيات ٥-٧. نحتاج للتركيز أكثر على أحكام
                  المد في الجلسة القادمة. استمر في التدريب على القلقلة.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full text-sm font-medium border border-green-100 dark:border-green-900/30">
                    الطلاقة: ممتاز
                  </span>
                  <span className="px-3 py-1 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 rounded-full text-sm font-medium border border-yellow-100 dark:border-yellow-900/30">
                    التجويد: جيد جداً
                  </span>
                  <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-full text-sm font-medium border border-blue-100 dark:border-blue-900/30">
                    الحفظ: مكتمل
                  </span>
                </div>
              </div>

              {/* Video Recording */}
              <div className="bg-white dark:bg-surface-dark rounded-xl p-6 border border-border-light dark:border-border-dark shadow-sm">
                <h3 className="text-lg font-bold text-text-main dark:text-white mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">videocam</span>
                  تسجيل الجلسة
                </h3>
                <div className="relative w-full aspect-video bg-neutral-100 dark:bg-neutral-800 rounded-lg overflow-hidden group cursor-pointer border border-border-light dark:border-border-dark">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                    style={{
                      backgroundImage:
                        "url('https://lh3.googleusercontent.com/aida-public/AB6AXuA_uluLBeeDlF_W9pokIV7_nwsAT4cmTMypVHepP5LOhSgtqKV5Axag9qvLnJPFFwLi35vffUYB-9mBjAR9gwrkZsEi59gKr8T815a5dWXSovqiD5QdX5mCCyCzJYcHv8L_E1Iy6JLfsoM7ZBpZ3wCeEMNLUnaNfhSHImq4W_Nkf9B3fGcgw-yI-Py8s-Q8soBeH0VI_mEHyMgX41EBm_VVjzpUCVvDFO81GSBsX_5Y5PCLPcvexHVpQAulpVsaysnd7vaf32vrrAN9')",
                    }}
                  ></div>
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                    <div className="size-14 bg-white/90 dark:bg-surface-dark/90 rounded-full flex items-center justify-center text-primary shadow-lg group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-3xl">play_arrow</span>
                    </div>
                  </div>
                  <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded font-medium">
                    ٤٥:٠٠
                  </div>
                </div>
              </div>
            </div>

            {/* Rating Sidebar */}
            <div className="flex flex-col gap-6">
              <div className="bg-white dark:bg-surface-dark rounded-xl p-6 border border-border-light dark:border-border-dark shadow-sm h-fit">
                <h3 className="text-lg font-bold text-text-main dark:text-white mb-4">تقييم المعلم</h3>
                <div className="flex flex-col items-center justify-center py-6 border-b border-border-light dark:border-border-dark mb-6">
                  <span className="text-5xl font-black text-text-main dark:text-white mb-2">٥.٠</span>
                  <div className="flex gap-1 text-primary mb-2">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="material-symbols-outlined fill-current">
                        star
                      </span>
                    ))}
                  </div>
                  <span className="text-text-secondary text-sm">بناءً على الأداء اليوم</span>
                </div>
                <div className="space-y-3">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <div key={rating} className="flex items-center gap-3">
                      <span className="text-sm font-bold w-4">{rating}</span>
                      <div className="flex-1 h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-primary rounded-full ${
                            rating === 5 ? 'w-full' : 'w-0'
                          }`}
                        ></div>
                      </div>
                      <span className="text-xs text-text-secondary w-8 text-left">
                        {rating === 5 ? '١٠٠٪' : '٠٪'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Next Session Teaser */}
              <div className="bg-white dark:bg-surface-dark rounded-xl p-6 border border-border-light dark:border-border-dark shadow-sm">
                <h3 className="text-lg font-bold text-text-main dark:text-white mb-4">الجلسة القادمة</h3>
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-neutral-100 dark:bg-neutral-800 p-3 rounded-lg text-text-secondary">
                    <span className="material-symbols-outlined">calendar_month</span>
                  </div>
                  <div>
                    <p className="font-bold text-text-main dark:text-white">٢٦ أكتوبر ٢٠٢٣</p>
                    <p className="text-sm text-text-secondary">٠٤:٠٠ مساءً - ٠٤:٤٥ مساءً</p>
                  </div>
                </div>
                <button className="w-full py-2 px-4 border border-border-light dark:border-border-dark rounded-lg text-text-main dark:text-white font-bold hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors text-sm">
                  تعديل الموعد
                </button>
              </div>
            </div>
          </div>

          {/* Promotion Card */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-[#f7d66e] to-[#f9e5a1] p-8 shadow-lg">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-10 mix-blend-overlay"></div>
            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white/20 to-transparent"></div>
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-1 text-center md:text-right">
                <h2 className="text-2xl font-black text-text-main mb-2">أكمل ختمة القرآن الكريم معنا</h2>
                <p className="text-text-main/80 text-lg mb-6 max-w-xl">
                  خطة تعليمية مخصصة طويلة المدى تساعدك على إتقان التلاوة والحفظ مع نخبة من المعلمين المعتمدين.
                </p>
                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full border border-black/5 shadow-sm">
                    <span className="material-symbols-outlined text-text-main text-sm">verified</span>
                    <span className="text-sm font-semibold">متابعة يومية</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full border border-black/5 shadow-sm">
                    <span className="material-symbols-outlined text-text-main text-sm">workspace_premium</span>
                    <span className="text-sm font-semibold">شهادة إتمام</span>
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0">
                <button className="bg-text-main text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl hover:bg-black hover:scale-105 transition-all flex items-center gap-2">
                  <span>تفعيل الخطة الآن</span>
                  <span className="material-symbols-outlined rtl:rotate-180">arrow_right_alt</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

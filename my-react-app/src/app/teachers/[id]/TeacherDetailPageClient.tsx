'use client'

import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Header from '../../../components/layout/Header'


export default function TeacherDetailPageClient() {
  const { id } = useParams<{ id: string }>()
  const [activeTab, setActiveTab] = useState<'bio' | 'availability' | 'reviews'>('bio')

  // Mock data - في الإنتاج، سيتم جلبها من API بناءً على params.id
  const teacher = {
    id: id || '1',
    name: 'الشيخ أحمد محمد',
    specialty: 'مدرس قرآن كريم وتجويد بخبرة ١٥ عاماً',
    rating: 5.0,
    reviews: 120,
    price: 150,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBED3Rycb2Y392o2F5Rz_493I9-Uqvm22l2Cp_rMZPbF3ES9uLAo7GirLW-jsOIqK6APFHHBRKZUULO6BxGnV8hyjDKSmwKXol6wWPCOu33xbM7U1GAk7ZKLlXYjkwPviSLn3K6im6e0mLFqKOojc-C1pPF4rz1fq9GORh1frgCT7F_GyEO4IPos2yuY5xOzCV77-IuVSsZdiVyOK2pVt4T7ftE3mEUTrmNVN_s_h6MJS0ofrPFOOeAeqdclQtKHYNEliiUGAHQ4AF-',
    languages: 'العربية والإنجليزية',
    location: 'القاهرة، مصر',
  }

  return (
    <>
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 sm:px-6 lg:px-8 max-w-7xl">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-[#8a8060] dark:text-text-secondary mb-8">
          <Link to="/" className="hover:text-primary transition-colors">
            الرئيسية
          </Link>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <Link to="/teachers" className="hover:text-primary transition-colors">
            المعلمين
          </Link>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="text-[#181611] dark:text-white font-medium">{teacher.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Content Column */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            {/* Profile Header */}
            <div className="bg-white dark:bg-[#1a170d] rounded-xl p-6 border border-[#e6e2de] dark:border-[#3a3528]">
              <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                <div className="relative shrink-0">
                  <img
                    alt={teacher.name}
                    className="w-32 h-32 rounded-full object-cover border-4 border-primary/20"
                    src={teacher.image}
                  />
                  <div className="absolute bottom-1 right-1 bg-green-500 rounded-full p-1 border-2 border-white dark:border-[#1a170d]">
                    <span className="block w-3 h-3 bg-white rounded-full"></span>
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-2xl sm:text-3xl font-bold text-[#181611] dark:text-white">{teacher.name}</h1>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      <span className="material-symbols-outlined text-[14px]">verified</span>
                      تم التحقق
                    </span>
                  </div>
                  <p className="text-[#8a8060] dark:text-text-secondary text-lg">{teacher.specialty}</p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <div className="flex items-center gap-1 text-primary text-sm font-bold bg-primary/10 px-3 py-1 rounded-lg">
                      <span className="material-symbols-outlined text-[18px] fill-1">star</span>
                      {teacher.rating} ({teacher.reviews} تقييم)
                    </div>
                    <div className="flex items-center gap-1 text-[#8a8060] dark:text-text-secondary text-sm bg-[#f5f3f0] dark:bg-[#2d2a24] px-3 py-1 rounded-lg">
                      <span className="material-symbols-outlined text-[18px]">translate</span>
                      {teacher.languages}
                    </div>
                    <div className="flex items-center gap-1 text-[#8a8060] dark:text-text-secondary text-sm bg-[#f5f3f0] dark:bg-[#2d2a24] px-3 py-1 rounded-lg">
                      <span className="material-symbols-outlined text-[18px]">location_on</span>
                      {teacher.location}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs Navigation */}
            <div className="border-b border-[#e6e2de] dark:border-[#3a3528]">
              <nav className="-mb-px flex space-x-8 space-x-reverse">
                <button
                  onClick={() => setActiveTab('bio')}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-bold text-base flex items-center gap-2 ${
                    activeTab === 'bio'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-[#8a8060] dark:text-text-secondary hover:text-[#181611] dark:hover:text-white hover:border-gray-300'
                  } transition-colors`}
                >
                  <span className="material-symbols-outlined">person</span>
                  نبذة عني
                </button>
                <button
                  onClick={() => setActiveTab('availability')}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-base flex items-center gap-2 ${
                    activeTab === 'availability'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-[#8a8060] dark:text-text-secondary hover:text-[#181611] dark:hover:text-white hover:border-gray-300'
                  } transition-colors`}
                >
                  <span className="material-symbols-outlined">calendar_month</span>
                  الأوقات المتاحة
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-base flex items-center gap-2 ${
                    activeTab === 'reviews'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-[#8a8060] dark:text-text-secondary hover:text-[#181611] dark:hover:text-white hover:border-gray-300'
                  } transition-colors`}
                >
                  <span className="material-symbols-outlined">reviews</span>
                  التقييمات
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="bg-white dark:bg-[#1a170d] rounded-xl p-6 sm:p-8 border border-[#e6e2de] dark:border-[#3a3528]">
              {activeTab === 'bio' && (
                <div className="space-y-8">
                  <section>
                    <h3 className="text-xl font-bold text-[#181611] dark:text-white mb-4 flex items-center gap-2">
                      <span className="w-1 h-6 bg-primary rounded-full"></span>
                      مرحباً بكم
                    </h3>
                    <div className="text-[#8a8060] dark:text-text-secondary leading-relaxed">
                      <p className="mb-4">
                        السلام عليكم ورحمة الله وبركاته، أنا الشيخ أحمد محمد، مدرس قرآن كريم وتجويد وقراءات معتمد من
                        الأزهر الشريف. لدي شغف كبير بتعليم كتاب الله للطلاب من جميع الأعمار والمستويات.
                      </p>
                      <p>
                        بفضل الله، قمت بتدريس مئات الطلاب حول العالم عبر الإنترنت، وأتميز بأسلوب تعليمي مرن يتناسب مع
                        قدرات كل طالب.
                      </p>
                    </div>
                  </section>
                </div>
              )}

              {activeTab === 'availability' && (
                <div className="text-center py-12">
                  <p className="text-[#8a8060] dark:text-text-secondary">قريباً: جدول الأوقات المتاحة</p>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="text-center py-12">
                  <p className="text-[#8a8060] dark:text-text-secondary">قريباً: التقييمات والمراجعات</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Column */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            {/* Pricing Card */}
            <div className="bg-white dark:bg-[#1a170d] rounded-xl border border-[#e6e2de] dark:border-[#3a3528] overflow-hidden shadow-xl">
              <div className="p-6 border-b border-[#e6e2de] dark:border-[#3a3528]">
                <div className="flex justify-between items-baseline mb-2">
                  <span className="text-[#8a8060] dark:text-text-secondary font-medium">سعر الحصة</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-[#181611] dark:text-white">{teacher.price}</span>
                    <span className="text-sm text-[#8a8060] dark:text-text-secondary">ج.م</span>
                    <span className="text-sm text-[#8a8060] dark:text-text-secondary">/ ساعة</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-green-400 text-sm mb-6">
                  <span className="material-symbols-outlined text-[18px]">bolt</span>
                  <span>رد سريع (خلال ساعة)</span>
                </div>
                <button className="w-full bg-primary hover:bg-primary/90 text-[#181611] font-bold text-lg py-3 rounded-lg shadow-lg transition-all mb-3">
                  احجز الان ( اول حصه مجانية )
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

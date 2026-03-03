'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'

export default function TeacherDetailPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState<'bio' | 'availability' | 'reviews'>('bio')

  return (
    <>
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 sm:px-6 lg:px-8 max-w-7xl">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-[#8a8060] dark:text-text-secondary mb-8">
          <Link href="/" className="hover:text-primary transition-colors">
            الرئيسية
          </Link>
          <span className="material-symbols-outlined text-[16px]">chevron_left</span>
          <Link href="/teachers" className="hover:text-primary transition-colors">
            المعلمين
          </Link>
          <span className="material-symbols-outlined text-[16px]">chevron_left</span>
          <span className="text-[#181611] dark:text-white font-medium">الشيخ أحمد محمد</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Content Column */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            {/* Profile Header */}
            <div className="bg-white dark:bg-[#1a170d] rounded-xl p-6 border border-[#e6e2de] dark:border-[#3a3528]">
              <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                <div className="relative shrink-0">
                  <img
                    alt="Portrait of Sheikh Ahmed Mohamed"
                    className="w-32 h-32 rounded-full object-cover border-4 border-primary/20"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBED3Rycb2Y392o2F5Rz_493I9-Uqvm22l2Cp_rMZPbF3ES9uLAo7GirLW-jsOIqK6APFHHBRKZUULO6BxGnV8hyjDKSmwKXol6wWPCOu33xbM7U1GAk7ZKLlXYjkwPviSLn3K6im6e0mLFqKOojc-C1pPF4rz1fq9GORh1frgCT7F_GyEO4IPos2yuY5xOzCV77-IuVSsZdiVyOK2pVt4T7ftE3mEUTrmNVN_s_h6MJS0ofrPFOOeAeqdclQtKHYNEliiUGAHQ4AF-"
                  />
                  <div className="absolute bottom-1 right-1 bg-green-500 rounded-full p-1 border-2 border-white dark:border-[#1a170d]">
                    <span className="block w-3 h-3 bg-white rounded-full"></span>
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-2xl sm:text-3xl font-bold text-[#181611] dark:text-white">الشيخ أحمد محمد</h1>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      <span className="material-symbols-outlined text-[14px]">verified</span>
                      تم التحقق
                    </span>
                  </div>
                  <p className="text-[#8a8060] dark:text-text-secondary text-lg">مدرس قرآن كريم وتجويد بخبرة ١٥ عاماً</p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <div className="flex items-center gap-1 text-primary text-sm font-bold bg-primary/10 px-3 py-1 rounded-lg">
                      <span className="material-symbols-outlined text-[18px] fill-1">star</span>
                      <span className="text-[#181611] dark:text-white">5.0</span>
                      <span className="text-[#8a8060] dark:text-text-secondary"> (١٢٠ تقييم)</span>
                    </div>
                    <div className="flex items-center gap-1 text-[#8a8060] dark:text-text-secondary text-sm bg-[#f5f3f0] dark:bg-[#2d2a24] px-3 py-1 rounded-lg">
                      <span className="material-symbols-outlined text-[18px]">translate</span>
                      يتحدث العربية والإنجليزية
                    </div>
                    <div className="flex items-center gap-1 text-[#8a8060] dark:text-text-secondary text-sm bg-[#f5f3f0] dark:bg-[#2d2a24] px-3 py-1 rounded-lg">
                      <span className="material-symbols-outlined text-[18px]">location_on</span>
                      القاهرة، مصر
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Video Intro */}
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black group cursor-pointer border border-[#e6e2de] dark:border-[#3a3528]">
              <img
                alt="Background of an open Quran"
                className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity duration-300"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB7uzSSUomCsUi2pkRUyXDQHL46gs1XfAk7Kqvt5ZTp2AafRLaqaqRz1aoNovdVjNEx5Wd-rVia6p5YilT3XTpWnRiZBnA_Zbr1SRbEE8lwjMlHM52oTMOBtr7mG7lQQvNdqQOaarmy8OtL6xOBKO806hcr8JvNieN_wbrp6M3a1DCC5TCr2jSI9yG516NlpIOtey-lODnoMuODAG_QjMm9LivE1luRkr0tOVOBIDkbJ990tGjBdebwmlBJYeuTOe9guDRh0mEMRg8O"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <button className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/90 text-surface-dark rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-primary/20 pl-1">
                  <span className="material-symbols-outlined text-4xl sm:text-5xl">play_arrow</span>
                </button>
              </div>
              <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur px-3 py-1 rounded text-white text-sm font-medium">
                02:15 دقيقة
              </div>
            </div>

            {/* Tabs Navigation */}
            <div className="border-b border-[#e6e2de] dark:border-[#3a3528]">
              <nav className="-mb-px flex space-x-8 space-x-reverse">
                <button
                  onClick={() => setActiveTab('bio')}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-bold text-base flex items-center gap-2 transition-colors ${
                    activeTab === 'bio'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-[#8a8060] dark:text-text-secondary hover:text-[#181611] dark:hover:text-white hover:border-gray-300'
                  }`}
                >
                  <span className="material-symbols-outlined">person</span>
                  نبذة عني
                </button>
                <button
                  onClick={() => setActiveTab('availability')}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-base flex items-center gap-2 transition-colors ${
                    activeTab === 'availability'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-[#8a8060] dark:text-text-secondary hover:text-[#181611] dark:hover:text-white hover:border-gray-300'
                  }`}
                >
                  <span className="material-symbols-outlined">calendar_month</span>
                  الأوقات المتاحة
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-base flex items-center gap-2 transition-colors ${
                    activeTab === 'reviews'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-[#8a8060] dark:text-text-secondary hover:text-[#181611] dark:hover:text-white hover:border-gray-300'
                  }`}
                >
                  <span className="material-symbols-outlined">reviews</span>
                  التقييمات
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'bio' && (
              <div className="bg-white dark:bg-[#1a170d] rounded-xl p-6 sm:p-8 border border-[#e6e2de] dark:border-[#3a3528] space-y-8">
                {/* Bio Section */}
                <section>
                  <h3 className="text-xl font-bold text-[#181611] dark:text-white mb-4 flex items-center gap-2">
                    <span className="w-1 h-6 bg-primary rounded-full"></span>
                    مرحباً بكم
                  </h3>
                  <div className="prose dark:prose-invert prose-lg max-w-none text-[#8a8060] dark:text-text-secondary leading-relaxed">
                    <p className="mb-4">
                      السلام عليكم ورحمة الله وبركاته، أنا الشيخ أحمد محمد، مدرس قرآن كريم وتجويد وقراءات
                      معتمد من الأزهر الشريف. لدي شغف كبير بتعليم كتاب الله للطلاب من جميع الأعمار والمستويات.
                    </p>
                    <p>
                      بفضل الله، قمت بتدريس مئات الطلاب حول العالم عبر الإنترنت، وأتميز بأسلوب تعليمي مرن
                      يتناسب مع قدرات كل طالب. سواء كنت مبتدئاً في تعلم القراءة العربية أو ترغب في إتقان أحكام
                      التجويد المتقدمة والحصول على إجازة، فأنا هنا لمساعدتك في رحلتك المباركة.
                    </p>
                  </div>
                </section>

                {/* Teaching Style */}
                <section>
                  <h3 className="text-xl font-bold text-[#181611] dark:text-white mb-4 flex items-center gap-2">
                    <span className="w-1 h-6 bg-primary rounded-full"></span>
                    أسلوب التدريس
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="bg-[#f5f3f0] dark:bg-[#2d2a24] p-4 rounded-lg border border-[#e6e2de] dark:border-[#3a3528]/50">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
                        <span className="material-symbols-outlined">school</span>
                      </div>
                      <h4 className="text-[#181611] dark:text-white font-bold mb-1">القرآن والتجويد</h4>
                      <p className="text-sm text-[#8a8060] dark:text-text-secondary">
                        تصحيح التلاوة وشرح أحكام التجويد بشكل مبسط وعملي.
                      </p>
                    </div>
                    <div className="bg-[#f5f3f0] dark:bg-[#2d2a24] p-4 rounded-lg border border-[#e6e2de] dark:border-[#3a3528]/50">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
                        <span className="material-symbols-outlined">child_care</span>
                      </div>
                      <h4 className="text-[#181611] dark:text-white font-bold mb-1">تعليم الأطفال</h4>
                      <p className="text-sm text-[#8a8060] dark:text-text-secondary">
                        أساليب تفاعلية وجذابة لتحبيب الأطفال في القرآن الكريم.
                      </p>
                    </div>
                    <div className="bg-[#f5f3f0] dark:bg-[#2d2a24] p-4 rounded-lg border border-[#e6e2de] dark:border-[#3a3528]/50">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
                        <span className="material-symbols-outlined">menu_book</span>
                      </div>
                      <h4 className="text-[#181611] dark:text-white font-bold mb-1">القاعدة النورانية</h4>
                      <p className="text-sm text-[#8a8060] dark:text-text-secondary">
                        تأسيس القراءة العربية الصحيحة للمبتدئين وغير الناطقين بالعربية.
                      </p>
                    </div>
                    <div className="bg-[#f5f3f0] dark:bg-[#2d2a24] p-4 rounded-lg border border-[#e6e2de] dark:border-[#3a3528]/50">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
                        <span className="material-symbols-outlined">workspace_premium</span>
                      </div>
                      <h4 className="text-[#181611] dark:text-white font-bold mb-1">الإجازات</h4>
                      <p className="text-sm text-[#8a8060] dark:text-text-secondary">
                        منح الإجازة بالسند المتصل إلى رسول الله صلى الله عليه وسلم.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Resume / Certifications */}
                <section>
                  <h3 className="text-xl font-bold text-[#181611] dark:text-white mb-4 flex items-center gap-2">
                    <span className="w-1 h-6 bg-primary rounded-full"></span>
                    المؤهلات والشهادات
                  </h3>
                  <ul className="space-y-4">
                    <li className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 bg-primary rounded-full mt-2"></div>
                        <div className="w-0.5 bg-[#e6e2de] dark:bg-[#3a3528] flex-1 h-full mt-1"></div>
                      </div>
                      <div className="pb-4">
                        <h4 className="text-[#181611] dark:text-white font-bold text-lg">إجازة في قراءة حفص عن عاصم</h4>
                        <p className="text-[#8a8060] dark:text-text-secondary text-sm">الأزهر الشريف • ٢٠١٠</p>
                      </div>
                    </li>
                    <li className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 bg-primary rounded-full mt-2"></div>
                        <div className="w-0.5 bg-[#e6e2de] dark:bg-[#3a3528] flex-1 h-full mt-1"></div>
                      </div>
                      <div className="pb-4">
                        <h4 className="text-[#181611] dark:text-white font-bold text-lg">بكالوريوس الدراسات الإسلامية والعربية</h4>
                        <p className="text-[#8a8060] dark:text-text-secondary text-sm">جامعة الأزهر • ٢٠٠٨</p>
                      </div>
                    </li>
                    <li className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 bg-primary rounded-full mt-2"></div>
                      </div>
                      <div>
                        <h4 className="text-[#181611] dark:text-white font-bold text-lg">
                          دورة في طرق تدريس اللغة العربية لغير الناطقين بها
                        </h4>
                        <p className="text-[#8a8060] dark:text-text-secondary text-sm">معهد تعليم اللغة العربية • ٢٠١٢</p>
                      </div>
                    </li>
                  </ul>
                </section>
              </div>
            )}

            {activeTab === 'availability' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Calendar & Slots Column */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Calendar & Slots */}
                  <div className="bg-white dark:bg-[#1a170d] rounded-xl p-6 border border-[#e6e2de] dark:border-[#3a3528]">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-[#181611] dark:text-white">اختر التاريخ</h3>
                    <div className="flex items-center gap-2 bg-[#f5f3f0] dark:bg-[#2d2a24] rounded-lg p-1">
                      <button className="p-1 hover:bg-white dark:hover:bg-white/10 rounded-md transition-colors text-[#181611] dark:text-white">
                        <span className="material-symbols-outlined text-xl">chevron_right</span>
                      </button>
                      <span className="text-sm font-bold px-2 text-[#181611] dark:text-white">أكتوبر ٢٠٢٣</span>
                      <button className="p-1 hover:bg-white dark:hover:bg-white/10 rounded-md transition-colors text-[#181611] dark:text-white">
                        <span className="material-symbols-outlined text-xl">chevron_left</span>
                      </button>
                    </div>
                  </div>
                  {/* Date Scroller */}
                  <div className="flex justify-between gap-2 overflow-x-auto pb-2 scrollbar-hide text-center">
                    {['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'].map(
                      (day, index) => (
                        <button
                          key={day}
                          className={`group flex flex-col items-center min-w-[3.5rem] p-2 rounded-xl transition-all ${
                            index === 2
                              ? 'bg-primary text-[#181611] shadow-md ring-2 ring-primary/20'
                              : 'hover:bg-[#f5f3f0] dark:hover:bg-[#2d2a24]'
                          }`}
                        >
                          <span className={`text-xs font-medium mb-1 ${index === 2 ? 'font-bold opacity-80' : 'text-[#8a8060] dark:text-text-secondary'}`}>
                            {day}
                          </span>
                          <span
                            className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold ${
                              index === 2
                                ? 'bg-white/20'
                                : 'text-[#181611] dark:text-white group-hover:bg-white dark:group-hover:bg-white/10 group-hover:shadow-sm'
                            }`}
                          >
                            {21 + index}
                          </span>
                        </button>
                      )
                    )}
                  </div>
                  <hr className="border-[#e6e2de] dark:border-[#3a3528] my-6" />
                  {/* Time Slots */}
                  <div className="space-y-6">
                    {/* Morning Section */}
                    <div>
                      <div className="flex items-center gap-2 mb-4 text-[#8a8060] dark:text-text-secondary">
                        <span className="material-symbols-outlined text-[20px]">wb_sunny</span>
                        <span className="text-sm font-bold uppercase tracking-wider">الصباح</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {['09:00 ص', '09:30 ص', '10:00 ص', '10:30 ص', '11:00 ص', '11:30 ص'].map((time, idx) => (
                          <button
                            key={time}
                            className={`py-2 px-3 rounded-lg border font-medium text-sm transition-all ${
                              idx === 0 || idx === 2 || idx === 3 || idx === 5
                                ? 'border-primary text-[#181611] dark:text-white hover:bg-primary hover:text-[#181611] shadow-[0_2px_0_0_rgba(244,192,37,0.4)] active:shadow-none active:translate-y-[2px]'
                                : 'bg-[#f5f3f0] dark:bg-[#2d2a24] text-[#8a8060] dark:text-text-secondary cursor-not-allowed opacity-60 border-transparent'
                            }`}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </div>
                    {/* Afternoon Section */}
                    <div>
                      <div className="flex items-center gap-2 mb-4 text-[#8a8060] dark:text-text-secondary">
                        <span className="material-symbols-outlined text-[20px]">partly_cloudy_day</span>
                        <span className="text-sm font-bold uppercase tracking-wider">بعد الظهر</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {['01:00 م', '01:30 م', '02:00 م', '02:30 م', '03:00 م', '03:30 م', '04:00 م', '04:30 م'].map(
                          (time, idx) => (
                            <button
                              key={time}
                              className={`py-2 px-3 rounded-lg border font-medium text-sm transition-all ${
                                idx === 0 || idx === 1 || idx === 3 || idx === 4 || idx === 7
                                  ? idx === 3
                                    ? 'border-primary bg-primary text-[#181611] font-bold shadow-none'
                                    : 'border-primary text-[#181611] dark:text-white hover:bg-primary hover:text-[#181611] shadow-[0_2px_0_0_rgba(244,192,37,0.4)] active:shadow-none active:translate-y-[2px]'
                                  : 'bg-[#f5f3f0] dark:bg-[#2d2a24] text-[#8a8060] dark:text-text-secondary cursor-not-allowed opacity-60 border-transparent'
                              }`}
                            >
                              {time}
                            </button>
                          )
                        )}
                      </div>
                    </div>
                    {/* Evening Section */}
                    <div>
                      <div className="flex items-center gap-2 mb-4 text-[#8a8060] dark:text-text-secondary">
                        <span className="material-symbols-outlined text-[20px]">nights_stay</span>
                        <span className="text-sm font-bold uppercase tracking-wider">المساء</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {['05:00 م', '05:30 م', '06:00 م'].map((time) => (
                          <button
                            key={time}
                            className="py-2 px-3 rounded-lg border border-primary text-[#181611] dark:text-white font-medium text-sm hover:bg-primary hover:text-[#181611] transition-all shadow-[0_2px_0_0_rgba(244,192,37,0.4)] active:shadow-none active:translate-y-[2px]"
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                    {/* Time Zone Info */}
                    <div className="flex items-center gap-3 p-4 bg-primary/10 rounded-xl border border-primary/20">
                      <span className="material-symbols-outlined text-primary text-2xl">schedule</span>
                      <div>
                        <p className="text-[#181611] dark:text-white text-sm font-bold">جميع الأوقات بتوقيتك المحلي</p>
                        <p className="text-[#8a8060] dark:text-text-secondary text-xs">آسيا/دبي (GMT+4)</p>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Booking Summary Sidebar */}
                <div className="hidden lg:block">
                  <div className="sticky top-24">
                    <div className="bg-white dark:bg-[#1a170d] rounded-xl p-6 border border-[#e6e2de] dark:border-[#3a3528] flex flex-col gap-6">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-lg text-[#181611] dark:text-white">تفاصيل الحجز</h3>
                        <button className="text-xs text-primary font-bold hover:underline">مسح</button>
                      </div>
                      <div className="flex items-center gap-4 p-4 bg-[#f5f3f0] dark:bg-[#2d2a24] rounded-lg">
                        <div
                          className="w-12 h-12 rounded-lg bg-cover bg-center"
                          style={{
                            backgroundImage:
                              'url(https://lh3.googleusercontent.com/aida-public/AB6AXuBED3Rycb2Y392o2F5Rz_493I9-Uqvm22l2Cp_rMZPbF3ES9uLAo7GirLW-jsOIqK6APFHHBRKZUULO6BxGnV8hyjDKSmwKXol6wWPCOu33xbM7U1GAk7ZKLlXYjkwPviSLn3K6im6e0mLFqKOojc-C1pPF4rz1fq9GORh1frgCT7F_GyEO4IPos2yuY5xOzCV77-IuVSsZdiVyOK2pVt4T7ftE3mEUTrmNVN_s_h6MJS0ofrPFOOeAeqdclQtKHYNEliiUGAHQ4AF-)',
                          }}
                        />
                        <div>
                          <p className="text-sm font-bold text-[#181611] dark:text-white">الشيخ أحمد محمد</p>
                          <p className="text-xs text-[#8a8060] dark:text-text-secondary">حصة ٣٠ دقيقة</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-[#8a8060] dark:text-text-secondary">التاريخ</span>
                          <span className="font-bold text-[#181611] dark:text-white">الاثنين، ٢٣ أكتوبر</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-[#8a8060] dark:text-text-secondary">الوقت</span>
                          <span className="font-bold text-[#181611] dark:text-white">٠٢:٣٠ م</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-[#8a8060] dark:text-text-secondary">السعر</span>
                          <span className="font-bold text-[#181611] dark:text-white">$15.00</span>
                        </div>
                        <div className="h-px w-full bg-[#e6e2de] dark:bg-[#3a3528]"></div>
                        <div className="flex justify-between items-center text-base">
                          <span className="font-bold text-[#181611] dark:text-white">الإجمالي</span>
                          <span className="font-bold text-primary text-xl">$15.00</span>
                        </div>
                      </div>
                      <Link
                        href={`/booking/${params.id}/confirm`}
                        className="w-full bg-primary hover:bg-primary/90 text-[#181611] font-bold py-3 rounded-lg shadow-md transition-all active:scale-[0.98] text-center"
                      >
                        احجز الحصة
                      </Link>
                      <div className="flex items-center justify-center gap-2 text-xs text-[#8a8060] dark:text-text-secondary">
                        <span className="material-symbols-outlined text-sm">lock</span>
                        <span>معاملة آمنة</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="bg-white dark:bg-[#1a170d] rounded-xl p-6 border border-[#e6e2de] dark:border-[#3a3528]">
                <h3 className="text-xl font-bold text-[#181611] dark:text-white mb-4">التقييمات</h3>
                <p className="text-[#8a8060] dark:text-text-secondary">سيتم إضافة التقييمات هنا</p>
              </div>
            )}
          </div>

          {/* Sidebar Column (Sticky) */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            {/* Pricing Card */}
            <div className="bg-white dark:bg-[#1a170d] rounded-xl border border-[#e6e2de] dark:border-[#3a3528] overflow-hidden shadow-xl shadow-black/20">
              <div className="p-6 border-b border-[#e6e2de] dark:border-[#3a3528]">
                <div className="flex justify-between items-baseline mb-2">
                  <span className="text-[#8a8060] dark:text-text-secondary font-medium">سعر الحصة</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-[#181611] dark:text-white">١٥٠</span>
                    <span className="text-sm text-[#8a8060] dark:text-text-secondary">ج.م</span>
                    <span className="text-sm text-[#8a8060] dark:text-text-secondary">/ ساعة</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-green-400 text-sm mb-6">
                  <span className="material-symbols-outlined text-[18px]">bolt</span>
                  <span>رد سريع (خلال ساعة)</span>
                </div>
                <Link
                  href={`/booking/${params.id}`}
                  className="w-full bg-primary hover:bg-primary/90 text-[#181611] font-bold text-lg py-3 rounded-lg shadow-lg shadow-primary/10 transition-all transform active:scale-[0.98] mb-3 block text-center"
                >
                  احجز حصة تجريبية
                </Link>
                <button className="w-full bg-transparent hover:bg-[#f5f3f0] dark:hover:bg-white/5 text-[#181611] dark:text-white border border-[#e6e2de] dark:border-[#3a3528] font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">chat</span>
                  أرسل رسالة
                </button>
              </div>
              <div className="p-6 bg-[#f5f3f0] dark:bg-[#2d2a24]/50">
                <h4 className="text-[#181611] dark:text-white font-bold mb-4 text-sm uppercase tracking-wider">ماذا تتضمن الحصة؟</h4>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-[#8a8060] dark:text-text-secondary text-sm">
                    <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">check_circle</span>
                    <span>خطة دراسية مخصصة</span>
                  </li>
                  <li className="flex items-start gap-3 text-[#8a8060] dark:text-text-secondary text-sm">
                    <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">check_circle</span>
                    <span>مواد تعليمية مجانية</span>
                  </li>
                  <li className="flex items-start gap-3 text-[#8a8060] dark:text-text-secondary text-sm">
                    <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">check_circle</span>
                    <span>تسجيل صوتي للحصة للمراجعة</span>
                  </li>
                  <li className="flex items-start gap-3 text-[#8a8060] dark:text-text-secondary text-sm">
                    <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">check_circle</span>
                    <span>شهادة إتمام المستوى</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

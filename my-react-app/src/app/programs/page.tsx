'use client'

import React from "react";
import Header from '../../components/layout/Header'
import LoginModal from '../../components/modals/LoginModal'
import Popup from '../../components/modals/Popup'
import { useAuthGuard } from '../../hooks/useRequireAuth'

export default function ProgramsPage() {
  const { requireAuth } = useAuthGuard()

  const handleEnrollProgram = () => {
    requireAuth(() => {
      // Proceed with enrollment logic after authentication
      console.log('Enrolling in program...')
      // TODO: Implement enrollment logic
    })
  }
  return (
    <>
      <Header />
      <main>
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-primary/5 -z-10" />
          <div className="max-w-4xl mx-auto text-center px-4">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/20 text-primary font-bold text-sm mb-6 uppercase tracking-wider">
              رحلة نحو النور
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-text-main mb-6 leading-tight">
              برامجنا التعليمية ( قراءه ، حفظ ، تدبر )
            </h1>
            <p className="text-lg md:text-xl text-text-muted leading-relaxed max-w-2xl mx-auto">
              نقدم مسارات تعليمية متكاملة صُممت بعناية لتناسب مختلف المستويات،
              تهدف إلى ربط المسلم بكتاب الله تلاوةً وحفظاً وتدبراً.
            </p>
          </div>
        </section>

        {/* Program Details */}
        <section className="py-16 space-y-24">
          {/* Program 1: Reading */}
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <div className="inline-flex items-center gap-2 text-primary mb-4">
                  <span className="material-symbols-outlined text-4xl">menu_book</span>
                  <span className="text-xl font-bold uppercase tracking-widest">مسار القراءة</span>
                </div>
                <h2 className="text-3xl font-bold mb-6 text-text-main leading-snug">
                  إتقان التلاوة وضبط المخارج
                </h2>
                <p className="text-text-muted text-lg mb-8 leading-relaxed">
                  تعلم القراءة الصحيحة للقرآن الكريم من الصفر حتى الإتقان، مع التركيز على مخارج الحروف وصفاتها وأحكام التجويد، لتلاوة خالية من اللحن.
                </p>
                <button
                  onClick={handleEnrollProgram}
                  className="bg-primary/10 text-primary border border-primary/20 px-8 py-3 rounded-lg font-bold hover:bg-primary hover:text-white transition-all"
                >
                  سجل في هذا المسار
                </button>
              </div>
              <div className="order-1 lg:order-2">
                <div className="relative rounded-3xl overflow-hidden aspect-video shadow-2xl">
                  <div className="absolute inset-0 bg-primary/20 mix-blend-multiply" />
                  <img
                    alt="Person reading Quran"
                    className="w-full h-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBwz-dskigmcO1ykMJbXlmxQghqX_wpvjoGi_XFpbjUYcQPg42shLNwG3SniaoCI-z3EbEQf3f84S47Npl44Z0ImltHxmY-6FGqLR34fFLkuMqCSB8xMYWD_tltuYp6g5JOh7Oi2N2Ogk-8lZuroE9NpbbFjKexWVjmzR9Hb8GkEorXEMUzB5VgLu1m5C-_Kd3LJp0yh1U9B_SklVYgdGHlp_WxXp5rSLDK6V9krBeiMc23NiVFWuK7bel2H13zhhMDkKLtSqx9fcYO"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Program 2: Memorization */}
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-2">
                <div className="inline-flex items-center gap-2 text-primary mb-4">
                  <span className="material-symbols-outlined text-4xl">history_edu</span>
                  <span className="text-xl font-bold uppercase tracking-widest">مسار الحفظ</span>
                </div>
                <h2 className="text-3xl font-bold mb-6 text-text-main leading-snug">
                  تثبيت الآيات في الصدور بأحكام التجويد
                </h2>
                <p className="text-text-muted text-lg mb-8 leading-relaxed">
                  برنامج مكثف يركز على ضبط مخارج الحروف وإتقان أحكام التجويد مع
                  متابعة مستمرة للحفظ الجديد والمراجعة الدورية، لضمان رسوخ الآيات
                  في الذاكرة.
                </p>
                <button
                  onClick={handleEnrollProgram}
                  className="bg-primary/10 text-primary border border-primary/20 px-8 py-3 rounded-lg font-bold hover:bg-primary hover:text-white transition-all"
                >
                  سجل في هذا المسار
                </button>
              </div>
              <div className="order-1 lg:order-1">
                <div className="relative rounded-3xl overflow-hidden aspect-video shadow-2xl">
                  <div className="absolute inset-0 bg-primary/20 mix-blend-multiply" />
                  <img
                    alt="Memorization group"
                    className="w-full h-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBePahIg96Bo7u6E0JLmKcpJ9hez6-IW5kHF-GoFLyAuo5OaKSV67MALZkavLZaJqK87Vw7JFA9MNQBtokoDxKRrc0HPE1NJ2jpKiZMGtF2BQ877LTssfJ9FyGcVLLOOMh4vC3Cr5muCyRpULuiPQnounhRsaJUwCLzH_0y_6O4eqX9YBgYtPSWUU9Y-TfSYPSHxIv40KqdeCU2EmMk6uAR2OchmTJLQrQpaJb7x1147D9IJR-SCEOGSZBjaeql6Uax6jqhDz2Ck66B"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Program 3: Reflection */}
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <div className="inline-flex items-center gap-2 text-primary mb-4">
                  <span className="material-symbols-outlined text-4xl">self_improvement</span>
                  <span className="text-xl font-bold uppercase tracking-widest">مسار التدبر</span>
                </div>
                <h2 className="text-3xl font-bold mb-6 text-text-main leading-snug">
                  فهم المعاني والعمل بالقرآن
                </h2>
                <p className="text-text-muted text-lg mb-8 leading-relaxed">
                  رحلة إيمانية في أعماق معاني الآيات، لتعزيز اليقين وتزكية النفس، وربط الواقع بهدي القرآن الكريم، ليكون منهج حياة.
                </p>
                <button
                  onClick={handleEnrollProgram}
                  className="bg-primary/10 text-primary border border-primary/20 px-8 py-3 rounded-lg font-bold hover:bg-primary hover:text-white transition-all"
                >
                  سجل في هذا المسار
                </button>
              </div>
              <div className="order-1 lg:order-2">
                <div className="relative rounded-3xl overflow-hidden aspect-video shadow-2xl">
                  <div className="absolute inset-0 bg-primary/20 mix-blend-multiply" />
                  <img
                    alt="Reflection and peaceful reading"
                    className="w-full h-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAtv_M4lA7SEASuoE-K9p3yQhiE6Sf_eHcuGF5i95CRtmiCaOEI6uL9TAVPPqYfdSgDgXGNjMlCGylSCtxVpq2D9W1SA5BPbsXOnWh9jvwRtg96fxqqQwjdfdq4r_zLO-nZXhumjH0nkiEKD-nnBx9mXL7uoEZ-v4h_bC-nYZ7-jc4FlKiSBaTcG0YDUguDykXKjpEzk8ZjqkCfHdHKHZOgOQXSmJtOFOedW5XWjeuMySLJySYqP1x_k7RcvO8RKV8tJO6MbDro7cqz"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <LoginModal />
      <Popup />
    </>
  )
}

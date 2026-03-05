import React from "react";
import { Link } from 'react-router-dom'

export default function HeroSection() {
  return (
    <div
      className="relative w-full min-h-[600px] flex items-center justify-center bg-cover bg-center overflow-hidden"
      style={{
        backgroundImage:
          'linear-gradient(to right, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.5)), url(/hero.png)',
      }}
    >
      {/* Overlay gradient for readability */}
      <div className="absolute inset-0 bg-gradient-to-l from-black/70 via-black/40 to-transparent" />
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col md:flex-row items-center md:items-start justify-center md:justify-start text-right">
        <div className="w-full md:w-1/2 flex flex-col gap-6 text-white">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full w-fit self-start border border-white/30">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs font-medium">متاح الآن للتسجيل المبكر</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black leading-tight">
            أفضل بداية <span className="text-primary">لرحلتك</span> مع القرآن
            الكريم
          </h1>
          <p className="text-lg md:text-xl text-gray-100 leading-relaxed font-light max-w-lg">
            انضم إلى آلاف الطلاب من جميع الأعمار الذين يثقون بنا لتعلم القرآن الكريم.
            معلمون معتمدون، جداول مرنة، ومنهجية متكاملة تناسب جميع المستويات.
          </p>

          {/* Social Proof */}
          <div className="flex items-center gap-4 mt-6 pt-6 border-t border-white/10">
            <div className="flex -space-x-3 space-x-reverse">
              <img
                alt="Parent 1"
                className="w-10 h-10 rounded-full border-2 border-white object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAhZs9H9Goymwlrc92aRaq-H87qw4TzprXGmXFmt_Qe_Im74iXt_gXcuaGvNUXgVBiYKNePKvThlnXUMzv3oQZRDK1ycCsWrezQJdQL74XWv1b88kwY08A-pmLNPiZQf_9pLNPdLUypzj9rq4ixzoL7ufXOGpEFlCidH1SVGUK6e9a8t0PQR5ivWSObEmakaJ4W2LJr-Q2EaPb4Fxh0AUKUhQuFFdPs2aZzvDcgxmv5If1oCRyq-Gndb9n4MK-IqL8h_vuWiK89y09V"
              />
              <img
                alt="Parent 2"
                className="w-10 h-10 rounded-full border-2 border-white object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBePahIg96Bo7u6E0JLmKcpJ9hez6-IW5kHF-GoFLyAuo5OaKSV67MALZkavLZaJqK87Vw7JFA9MNQBtokoDxKRrc0HPE1NJ2jpKiZMGtF2BQ877LTssfJ9FyGcVLLOOMh4vC3Cr5muCyRpULuiPQnounhRsaJUwCLzH_0y_6O4eqX9YBgYtPSWUU9Y-TfSYPSHxIv40KqdeCU2EmMk6uAR2OchmTJLQrQpaJb7x1147D9IJR-SCEOGSZBjaeql6Uax6jqhDz2Ck66B"
              />
              <img
                alt="Parent 3"
                className="w-10 h-10 rounded-full border-2 border-white object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDQDnobTZ2i7dVEPwnu-h-Vcb8irdNkwErgJnpNQUgyBhTUl8e19oCeYebrEkoqFiGCk6lrakQEvoTPfBQzu2OPKhtW1xzlEc2FGL_xMdEdWjGdkSa7y4Bb49BsHAF-sQULahn71XnBIhFt7sgsAuJSDE8ZhzIJmCxxBD9t55H08VGyR0fvLDx2_4BOK42yND-er9rP7qWzSgkZwK0XLoxPLf-JkkibcZws3h1Q95SpiS97dwudZwBgBor3AQD_4FCN_uLna5Jj44ig"
              />
              <div className="w-10 h-10 rounded-full border-2 border-white bg-white text-primary flex items-center justify-center text-xs font-bold shadow-sm">
                +2k
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex text-yellow-400 text-sm">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="material-symbols-outlined text-sm" style={{ fontSize: '16px' }}>
                    star
                  </span>
                ))}
              </div>
              <span className="text-sm text-gray-200">موثوق من قبل 2000+ طالب</span>
            </div>
          </div>
        </div>
        {/* Empty right side for background image visibility */}
        <div className="hidden md:block w-1/2 h-full" />
      </div>
    </div>
  )
}

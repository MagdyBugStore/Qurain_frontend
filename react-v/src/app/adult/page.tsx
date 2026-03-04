import Header from '@/components/layout/Header'
import LoginModal from '@/components/modals/LoginModal'
import Popup from '@/components/modals/Popup'
import { Link } from 'react-router-dom'


export default function AdultPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-12 lg:py-20 px-6">
          <div className="mx-auto max-w-[1280px]">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              {/* Hero Content */}
              <div className="flex flex-col gap-8 order-2 lg:order-1 text-right">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary w-fit">
                    <span className="material-symbols-outlined !text-sm">verified</span>
                    <span>مخصص للمبتدئين الكبار</span>
                  </div>
                  <h1 className="font-display text-4xl font-black leading-[1.2] tracking-tight text-text-main sm:text-5xl lg:text-6xl">
                    ابدأ رحلتك مع القرآن —{' '}
                    <span className="text-primary block mt-2">بغض النظر عن مستواك</span>
                  </h1>
                  <p className="text-lg leading-relaxed text-text-muted max-w-xl">
                    لا تقلق إذا كنت تبدأ من الصفر. منهجنا المخصص للبالغين يضمن لك
                    تعلماً هادئاً ومتدرجاً على أيدي معلمين صبورين ومتخصصين في تعليم
                    الكبار.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <Link
                    to="/start-free"
                    className="h-14 px-8 rounded-xl bg-primary text-text-main text-lg font-bold hover:bg-primary/90 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                  >
                    <span>جرّب مجاناً الآن</span>
                    <span className="material-symbols-outlined rtl:rotate-180">
                      arrow_right_alt
                    </span>
                  </Link>
                  <button className="h-14 px-8 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-text-main dark:text-white text-lg font-bold hover:bg-gray-50 dark:hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined">play_circle</span>
                    <span>شاهد كيف نعمل</span>
                  </button>
                </div>
              </div>
              {/* Hero Image */}
              <div className="relative order-1 lg:order-2">
                <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full opacity-50" />
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-2xl border-4 border-white dark:border-white/5">
                  <img
                    alt="Adult muslim man reading Quran peacefully"
                    className="h-full w-full object-cover transform hover:scale-105 transition-duration-700 transition-transform"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAtv_M4lA7SEASuoE-K9p3yQhiE6Sf_eHcuGF5i95CRtmiCaOEI6uL9TAVPPqYfdSgDgXGNjMlCGylSCtxVpq2D9W1SA5BPbsXOnWh9jvwRtg96fxqqQwjdfdq4r_zLO-nZXhumjH0nkiEKD-nnBx9mXL7uoEZ-v4h_bC-nYZ7-jc4FlKiSBaTcG0YDUguDykXKjpEzk8ZjqkCfHdHKHZOgOQXSmJtOFOedW5XWjeuMySLJySYqP1x_k7RcvO8RKV8tJO6MbDro7cqz"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-10 bg-white dark:bg-white/5 border-y border-[#e6e3db] dark:border-white/5">
          <div className="mx-auto max-w-[1280px] px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-background-light dark:hover:bg-white/5 transition-colors group cursor-default">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined">workspace_premium</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-text-main mb-1">معلمون معتمدون</h3>
                  <p className="text-sm text-text-muted">نخبة من الحفاظ والمجازين لتعليم الكبار</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-background-light dark:hover:bg-white/5 transition-colors group cursor-default">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined">event_available</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-text-main mb-1">إلغاء في أي وقت</h3>
                  <p className="text-sm text-text-muted">مرونة كاملة في اشتراكك بدون قيود</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-background-light dark:hover:bg-white/5 transition-colors group cursor-default">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined">lock_clock</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-text-main mb-1">دفع آمن</h3>
                  <p className="text-sm text-text-muted">بوابة دفع محمية وموثوقة عالمياً</p>
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

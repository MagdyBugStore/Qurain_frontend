import { Link } from 'react-router-dom'
import Header from '../../components/layout/Header'

import LoginModal from '../../components/modals/LoginModal'
import Popup from '../../components/modals/Popup'

export default function SectionsPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-12 lg:py-20 px-6 bg-background-light dark:bg-background-dark">
          <div className="mx-auto max-w-7xl">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              {/* Hero Content */}
              <div className="flex flex-col gap-8 order-2 lg:order-1 text-right">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary w-fit">
                    <span className="material-symbols-outlined !text-sm">verified</span>
                    <span>منصة تعليمية متخصصة</span>
                  </div>
                  <h1 className="font-display text-4xl font-black leading-[1.2] tracking-tight text-text-main sm:text-5xl lg:text-6xl">
                    تعلم القرآن الكريم{' '}
                    <span className="text-primary block mt-2">بأسلوب ممتع وتفاعلي</span>
                  </h1>
                  <p className="text-lg leading-relaxed text-text-muted max-w-xl">
                    منصة متخصصة لتعليم القرآن الكريم للأطفال والكبار مع نخبة من المعلمين
                    المجازين وبرامج تعليمية مخصصة
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <Link
                    to="/start-free"
                    className="h-14 px-8 rounded-xl bg-primary text-text-main text-lg font-bold hover:bg-primary/90 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                  >
                    <span>ابدأ مجاناً</span>
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
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[2rem] shadow-2xl border-4 border-white dark:border-white/5">
                  <div
                    className="h-full w-full bg-cover bg-center"
                    style={{
                      backgroundImage:
                        'url(https://lh3.googleusercontent.com/aida-public/AB6AXuC6STyTevMJoG9nIOHo-QYxO9Dr8v6F12ioIKDkyfVqjbl7HVZ6mlH94ql5nFCRJzsMYQUlAaJ5p5ModVkj4pwcKT3kkXsWbIVb6hTsG7ejIHx6nuY29ahNon1dtbdE-Qdtc_vZ-_QLTS_FdsxZqT60AJ-izFxzR145zYe9qBy8T3gkIPBDDv9PbmYysj67_DqCQElQ_c-45P1vDD-8Bbac_DEAt4ydIr4LQJZqEZamHrFo_3YBFb7neGfT0YNiZO9NhBn-7e108CgZ)',
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-6 right-6 text-white text-right">
                      <p className="font-bold text-lg">تعليم ممتع وتفاعلي</p>
                      <p className="text-sm opacity-90">بيئة آمنة لطفلك</p>
                    </div>
                  </div>
                </div>
                {/* Floating Badge */}
                <div className="absolute -bottom-6 -left-6 z-20 bg-white dark:bg-surface-dark p-4 rounded-xl shadow-xl flex items-center gap-3 border border-gray-200 dark:border-stone-700 max-w-[200px]">
                  <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                    <span className="material-symbols-outlined">school</span>
                  </div>
                  <div>
                    <p className="text-xs text-text-muted">الطلاب النشطون</p>
                    <p className="text-lg font-bold text-text-main">10,000+</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Learning Paths Section */}
        <section className="py-16 bg-white dark:bg-[#25221b]" id="paths">
          <div className="max-w-7xl mx-auto px-4 sm:px-10">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-text-main mb-4">
                مسارات التعلم المتخصصة
              </h2>
              <p className="text-text-muted max-w-2xl mx-auto">
                صممنا برامج تعليمية متنوعة تناسب جميع المستويات والأعمار لضمان رحلة
                قرآنية ممتعة ومثمرة
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: 'auto_stories',
                  title: 'تحفيظ القرآن',
                  description: 'برنامج متكامل لحفظ القرآن الكريم كاملاً مع المراجعة والتثبيت.',
                },
                {
                  icon: 'record_voice_over',
                  title: 'التجويد',
                  description: 'إتقان أحكام التلاوة ومخارج الحروف للقراءة بلسان عربي مبين.',
                },
                {
                  icon: 'child_care',
                  title: 'القاعدة النورانية',
                  description: 'تأسيس القراءة الصحيحة للأطفال المبتدئين بطريقة مبسطة.',
                },
                {
                  icon: 'language',
                  title: 'اللغة العربية',
                  description: 'تعلم لغة القرآن وقواعد النحو والصرف لفهم أعمق للنص القرآني.',
                },
              ].map((path, index) => (
                <div
                  key={index}
                  className="group bg-background-light dark:bg-surface-dark rounded-xl p-6 transition-all hover:-translate-y-1 hover:shadow-lg border border-transparent hover:border-primary/20"
                >
                  <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:bg-primary group-hover:text-text-main transition-colors">
                    <span className="material-symbols-outlined text-3xl">{path.icon}</span>
                  </div>
                  <h3 className="text-xl font-bold text-text-main mb-2">{path.title}</h3>
                  <p className="text-sm text-text-muted leading-relaxed">{path.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section className="py-16 px-4 sm:px-10 bg-background-light dark:bg-background-dark">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row gap-12 items-center">
              <div className="md:w-1/2">
                <h2 className="text-3xl font-bold text-text-main mb-6">
                  كيف يعمل قرآن أونلاين؟
                </h2>
                <p className="text-lg text-text-muted mb-8">
                  ابدأ رحلة تعلم القرآن في 3 خطوات بسيطة وميسرة لك ولطفلك.
                </p>
                <div className="space-y-6">
                  {[
                    {
                      step: 1,
                      title: 'اختر المعلم المناسب',
                      description: 'تصفح ملفات المعلمين، استمع لتلاوتهم، واختر الأنسب لطفلك.',
                    },
                    {
                      step: 2,
                      title: 'احجز التجربة المجانية',
                      description: 'حدد الموعد المناسب من جدول المعلم وجرب الحصة الأولى مجاناً.',
                    },
                    {
                      step: 3,
                      title: 'ابدأ التعلم',
                      description: 'انضم للفصل الافتراضي التفاعلي وابدأ رحلة الحفظ والتعلم.',
                    },
                  ].map((item) => (
                    <div key={item.step} className="flex gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white dark:bg-surface-dark border-2 border-primary text-primary flex items-center justify-center font-bold text-xl shadow-sm">
                        {item.step}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-text-main mb-1">
                          {item.title}
                        </h3>
                        <p className="text-text-muted text-sm">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="md:w-1/2 relative">
                <div className="absolute inset-0 bg-primary/10 rounded-full blur-3xl transform translate-x-12 translate-y-12" />
                <img
                  alt="Teacher explaining quran online"
                  className="relative rounded-2xl shadow-2xl w-full max-w-md mx-auto transform hover:scale-[1.02] transition-transform duration-500"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDzUX7hvsVpc5u50oWaKYbEuQJKC8-9ow_n7xZg7Bl3CYWWyU45uc_Y5P3Ls6Oe6VE_5vfxAQWhdGev-4u52D7EpA5j7f34P4oHsaYYpA-X6E6QS8PYdsU3E1w_Kg15VRJ3ghe7iPpnBL_9TNaY72CZxIlXeNcmw9BKMIt90kArQcze-WjV7XClS6bMB-_7c-2p5XKz6oswukUfgjc3md3KnAq2C0P1CVp8XdEYdmBrLTgN_14Ps0yGHlLiBzTJHR2x72N615YGMpPK"
                />
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

import React from "react";
import Header from '../../components/layout/Header'

import LoginModal from '../../components/modals/LoginModal'
import Popup from '../../components/modals/Popup'

export default function RoadmapPage() {
  const steps = [
    {
      icon: 'person_add',
      title: 'التسجيل المبدئي',
      description:
        'قم بإنشاء حسابك الخاص وتحديد تفضيلاتك الأساسية للتعلم (تلقين، حفظ، تجويد، أو إجازة).',
      position: 'left',
    },
    {
      icon: 'settings_suggest',
      title: 'الفحص التقني',
      description:
        'اختبار سريع للتأكد من جودة الصوت واتصال الإنترنت لضمان تجربة تعليمية سلسة دون انقطاع.',
      position: 'right',
    },
    {
      icon: 'assignment_turned_in',
      title: 'تحديد المستوى',
      description:
        'جلسة قصيرة مع أحد خبرائنا لتقييم مستواك في القراءة والحفظ ووضع الخطة الأنسب لك.',
      position: 'left',
    },
    {
      icon: 'school',
      title: 'اختيار المعلم والجدول',
      description:
        'اختر معلمك المفضل من بين نخبة من القراء المعتمدين وحدد المواعيد التي تناسب يومك.',
      position: 'right',
    },
    {
      icon: 'videocam',
      title: 'الحلقات التفاعلية',
      description:
        'ابدأ دروسك المباشرة عبر منصتنا الذكية التي توفر لك المصحف التفاعلي وأدوات التصحيح اللحظية.',
      position: 'left',
    },
    {
      icon: 'workspace_premium',
      title: 'الشهادة والإجازة',
      description:
        'عند إتمام المسار بنجاح، ستحصل على شهادة رسمية أو إجازة موثقة مسلسلة بالإسناد إلى رسول الله ﷺ.',
      position: 'right',
    },
  ]

  return (
    <>
      <Header />
      <main className="relative">
        {/* Hero Section */}
        <section className="py-16 md:py-24 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-6">
              خطواتك نحو الإتقان
            </span>
            <h2 className="text-4xl md:text-6xl font-black text-text-main mb-6 leading-tight">
              رحلتك التعليمية معنا
            </h2>
            <p className="text-text-muted max-w-2xl mx-auto text-lg leading-relaxed">
              نرافقك في كل خطوة من خطوات رحلتك مع القرآن الكريم، بدءاً من التسجيل
              وحتى الحصول على الإجازة والشهادة المعتمدة.
            </p>
          </div>
        </section>

        {/* Roadmap Steps */}
        <section className="pb-24">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            {/* Vertical Line for Desktop */}
            <div className="hidden md:block absolute right-1/2 translate-x-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/50 via-primary/20 to-transparent" />

            {steps.map((step, index) => (
              <div
                key={index}
                className={`relative flex flex-col md:flex-row items-center gap-8 mb-20 ${
                  step.position === 'right' ? 'md:flex-row-reverse' : ''
                }`}
              >
                <div className="flex-1">
                  <div className="bg-white dark:bg-background-dark p-8 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800">
                    <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                    <p className="text-text-muted">{step.description}</p>
                  </div>
                </div>
                <div
                  className={`z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${
                    index === 0 || index === steps.length - 1
                      ? 'bg-primary text-white shadow-xl shadow-primary/30'
                      : 'bg-white dark:bg-background-dark text-primary shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800'
                  }`}
                >
                  <span className="material-symbols-outlined text-3xl">{step.icon}</span>
                </div>
                <div className="flex-1 hidden md:block" />
              </div>
            ))}
          </div>
        </section>
      </main>
      <LoginModal />
      <Popup />
    </>
  )
}

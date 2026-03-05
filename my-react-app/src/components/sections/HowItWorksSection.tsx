import React from "react";

export default function HowItWorksSection() {
  const steps = [
    {
      number: 1,
      title: 'اختر المعلم المناسب',
      description: 'تصفح ملفات المعلمين، استمع لتلاوتهم، واختر الأنسب لطفلك.',
    },
    {
      number: 2,
      title: 'احجز التجربة المجانية',
      description: 'حدد الموعد المناسب من جدول المعلم وجرب الحصة الأولى مجاناً.',
    },
    {
      number: 3,
      title: 'ابدأ التعلم',
      description: 'انضم للفصل الافتراضي التفاعلي وابدأ رحلة الحفظ والتعلم.',
    },
  ]

  return (
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
              {steps.map((step) => (
                <div key={step.number} className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white dark:bg-surface-dark border-2 border-primary text-primary flex items-center justify-center font-bold text-xl shadow-sm">
                    {step.number}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-text-main mb-1">
                      {step.title}
                    </h3>
                    <p className="text-text-muted text-sm">{step.description}</p>
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
              src="/she5.png"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

import React from "react";

export default function TestimonialsSection() {
  const testimonials = [
    {
      name: 'سارة العلي',
      role: 'والدة الطالب يوسف (7 سنوات)',
      text: '"تجربة رائعة بكل المقاييس. ابني كان يجد صعوبة في نطق الحروف العربية، ولكن بفضل الله ثم صبر المعلمة وأسلوبها الشيق، تحسن مستواه بشكل ملحوظ في وقت قصير. المنصة سهلة الاستخدام جداً."',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuABxFLuQKySDCKSEHdF3ADsnALpZjXng60Sefib5pdwJ1KAUjMtHXW16ZG-c8TvKna_zYQ9VyZT_9_Uhbe9RKzh0zBkDbA--TV8CPB24KeXL7GIKccRvDiNBbpmOQRHzfrXLX24-n3QowmTbgfth5RVQ2z0o9246jI3_npDQjd99J8nkqdRgZu3qpWXqjGmXIElsqGypjUrCEM5rsDxqb6BL8ilce3tDez8WRvWnJH_xH1P_cXDFnb6_-5-wLYEu-bLuGmfQkxjaSi0',
    },
    {
      name: 'خالد عبدالله',
      role: 'والد الطالبة مريم (10 سنوات)',
      text: '"أفضل استثمار لتعليم أبنائي القرآن. المرونة في اختيار الأوقات ساعدتنا كثيراً في تنظيم وقتنا. المعلمون محترفون ويعرفون كيف يتعاملون مع الأطفال ويشجعونهم باستمرار."',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAVizUeQKJZ8s0rw1W6eTI4eoF4HtcgfU4L57y6YdbOK3sneAvjuyK0pdko9aGepjA7YoCYOrUCMjYDFvoS06Kq7kdUGZI2xLNq-deCLKhynEiWl19mUb9wLkCsqK-8glAIZFh4ROSUUIVNzW8oUjeJ_cXG9XsgcvV1cG0jEhCiSfwde6woO3xcTxLjK1ltGxmtyTfqVQihQoRXJe6Rox2bnJtWNRiSVzuBDw_fTIkSJSu2DnISKZZkMXqNKeBqvLY4HdOQGpJUJimX',
    },
  ]

  return (
    <section className="py-20 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-primary text-sm font-bold uppercase tracking-wider mb-2">
            قصص النجاح
          </h2>
          <h3 className="text-3xl md:text-4xl font-black text-text-main">
            ماذا يقول الآباء عن تجربتهم
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-background-light p-8 rounded-2xl relative">
              <span className="material-symbols-outlined absolute top-6 right-6 text-4xl text-gray-200">
                format_quote
              </span>
              <div className="flex items-center gap-4 mb-6">
                <img
                  alt={testimonial.name}
                  className="w-14 h-14 rounded-full object-cover"
                  src={testimonial.image}
                />
                <div>
                  <h5 className="font-bold text-text-main">{testimonial.name}</h5>
                  <p className="text-sm text-text-muted">{testimonial.role}</p>
                </div>
              </div>
              <p className="text-text-main leading-relaxed">{testimonial.text}</p>
              <div className="flex text-yellow-500 mt-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="material-symbols-outlined text-sm">star</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

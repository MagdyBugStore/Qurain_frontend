import React from "react";
import { Link } from 'react-router-dom'

export default function FeaturedTutorsSection() {
  const tutors = [
    {
      name: 'الشيخ أحمد محمد',
      specialty: 'متخصص في التجويد والقراءات',
      description: 'إجازة في القراءات العشر، خبرة أكثر من 10 سنوات في تعليم الأطفال والناشئة.',
      rating: 4.9,
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuANceWlhvlc5OzyEQ6Yw5RuVW0W5G1RQpo9Cjj6vuonq6SDWjA3GyxPV_S4eFslf3V1rwsQubSIL6zJZOTE4fNRB8Mz8IjNwygqUGBKvFWBdnpgV0KFhaTxrCrP75bX-cliClUezCSQF0dkFVyux2zbD4XpISu50SyBWXWxAldf9Jx-jyB4xzXt9JpodwWI26p90gZ53j_lwg5jfqkschS94M6KkQC0kqP4WWrJd2EAobsTH2DFB9t0oaOwKI_2aoZD2guovmb1yZBg',
      tags: ['حفص عن عاصم', 'ورش'],
    },
    {
      name: 'الأستاذة فاطمة علي',
      specialty: 'متخصصة في القاعدة النورانية',
      description: 'أسلوب مميز في تحبيب الأطفال في القرآن، صبورة جداً مع المبتدئين.',
      rating: 5.0,
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAKri3d2YSfegaGvjE-qQ9qr4zd-Tw_SDeqL9OCvZ63AvMIDb7WNzFkls7sYSYAmTRN65oa6zl9wvgihy73ySmxuFr_UiOO3s47YDDr6LuVom-XtB9eSGY_1MJWhOQISznulDWYHL6qtH4G_0Gjh961xVSBUX44IqUFQg-Mrg2JGe1Pf0fT7KvL0Ecg1mdEpD-WYc_47dFO0_g9U3gAOFiZzs6X9w-GHW0LPX5RdHUKk9_ZuIdFSaET5I8zVJSjF9vLMU_7AY2MfkSY',
      tags: ['نوراني', 'تربية إسلامية'],
    },
    {
      name: 'الشيخ عمر خالد',
      specialty: 'متخصص في الحفظ والمراجعة',
      description: 'حافظ لكتاب الله، يساعد الطلاب على وضع خطط حفظ ومراجعة فعالة.',
      rating: 4.8,
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCd687EdwPKsPHaDIVISwFZU2Q4cubQs3HsBA3EVOEZEAlfsZHYlQ1nHOdZQiBcVvXYgbM_CEhtQ7H4oN7B8WHUIeWX6R351bFfuIM4xZY6LIxm0LB12L2L95Y6_sGwMqo1BBVsxyH3OYxoG3XC9i6tMG-xk6wfPITnBIcN2IVSY7KR53_FIPt-FUN2oWsKdAM557-5pd-KQcfFOKlSZT_svnD5VqF_gesBgjemqlV_6eppWHYJto1GTT7meVelPipcAhAPDzwbNQMo',
      tags: ['تحفيظ', 'تفسير مبسط'],
    },
  ]

  return (
    <section className="py-20 bg-background-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-primary text-sm font-bold uppercase tracking-wider mb-2">
            نخبة المعلمين
          </h2>
          <h3 className="text-3xl md:text-4xl font-black text-text-main">
            تعلم على يد أفضل القراء والحفظة
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tutors.map((tutor, index) => (
            <div
              key={index}
              className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-shadow"
            >
              <div className="h-48 bg-gray-200 relative overflow-hidden">
                <img
                  alt={tutor.name}
                  className="w-full h-full object-cover object-top"
                  src={tutor.image}
                />
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-lg font-bold text-text-main">{tutor.name}</h4>
                  <div className="flex items-center text-yellow-500 text-sm font-bold gap-1">
                    <span className="material-symbols-outlined text-sm">star</span>
                    {tutor.rating}
                  </div>
                </div>
                <p className="text-primary text-sm font-medium mb-4">{tutor.specialty}</p>
                <p className="text-text-muted text-sm mb-4 line-clamp-2">
                  {tutor.description}
                </p>
                <div className="flex flex-wrap gap-2 text-xs">
                  {tutor.tags.map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="bg-gray-100 text-gray-600 px-2 py-1 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link
            to="/teachers"
            className="inline-flex items-center justify-center gap-2 text-primary font-bold border border-primary px-6 py-3 rounded-lg hover:bg-primary hover:text-white transition-colors"
          >
            <span>تصفح جميع المعلمين</span>
            <span className="material-symbols-outlined">group</span>
          </Link>
        </div>
      </div>
    </section>
  )
}

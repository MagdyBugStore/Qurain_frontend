'use client'
import React from "react";
import { useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../../components/layout/Header'
import LoginModal from '../../components/modals/LoginModal'
import Popup from '../../components/modals/Popup'
import { useAuthGuard } from '../../hooks/useRequireAuth'

export default function TeachersPage() {
  const { requireAuth } = useAuthGuard()
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const handleBookTrial = () => {
    requireAuth(() => {
      // Proceed with booking logic after authentication
      console.log('Booking trial session...')
      // TODO: Implement booking logic
    })
  }

  const allTeachers = [
    {
      id: '1',
      name: 'الشيخ أحمد محمد',
      specialty: 'متخصص في القاعدة النورانية لجميع الأعمار',
      description: 'خبرة 10 سنوات في التحفيظ أونلاين، إجازة في حفص عن عاصم.',
      rating: 5.0,
      reviews: 200,
      price: 15,
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCM-NJ4zjvTYCvRtQZ-M6Msw5F_jOn88MOuLaZPRACOrzjXlOGVxU4HNlTH72Dr2W5bce8J6porosanTS3dOpyhjCFTD582e6wbPqEKoOi3Fd3FuiDTHLuR_ad9WBk5saNbCP0pIIJI2MYbqhrbQXn1tR5t2fhwngQHLyhy9s1LqtQcdpGwaf0WSBDrXrRBGKVYVZmfrZqpO3nldPE2LwvCEQYO1GcCkSNF3T7EgdPVmJL0_WLkhmRYThWhb6gCjMpx2AaV-nsZa1EU',
      tags: ['مجاز في حفص'],
      hours: 1500,
      students: 200,
      qualification: 'خريج الأزهر الشريف',
      languages: 'العربية، الإنجليزية',
      completedSessions: 1500,
    },
    {
      id: '2',
      name: 'الشيخة فاطمة الزهراء',
      specialty: 'معلمة تجويد وقراءات',
      description: 'أسلوب متميز في تحبيب القرآن للفتيات والنساء، إجازة بالعشر الصغرى.',
      rating: 4.9,
      reviews: 350,
      price: 15,
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDtgAxqsa7sRA5bJJ2FYLprmo1lmlUyTeRobfh4ZIwr0fESH-A07yLAmTd51MW3_lldJ48FuRj1Slba75Mlfu2OwtYVoeHdNEhgeTzegE-QY9AAI_Ge1sZZDpZClpqrgIRsUkvqoIFcTLt8r99Gcbsj_WZ3G3hsGP-5L2LTcoulSLDKNUjDjctbyQHlaaxuv9FkRy3M54aI4sl0-7brrxA5JPaEpAEtLVjg00OwATiFzQ0HZlirJNtBxwLabbQ9MUDg9lPo9mLiV9iM',
      tags: ['إجازة بالعشر الصغرى'],
      hours: 2100,
      students: 350,
      qualification: 'إجازة برواية حفص',
      languages: 'العربية، الفرنسية',
      completedSessions: 2100,
    },
    {
      id: '3',
      name: 'الشيخ عمر عبد الله',
      specialty: 'ماجستير دراسات إسلامية',
      description: 'يجيد التعامل مع الناطقين بغير العربية، خبرة واسعة في تدريس التفسير المبسط.',
      rating: 4.8,
      reviews: 180,
      price: 12,
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAkmL84bAk34OWcni59ogSNFvhwIaq53XsmchabBtEIB68HWHbLXz2ql8sCSzQJNsaGIZ5Z1jb0qwhIPuonK1z5-9MFgVRWwsxBSgcdik5GA3YCe86mtUfzKfw3QTkYWPB_MaySIAgPh8BeVJGyMiH7_V0aAsPGCD402MDCXZQYERdY_laLaBQkqzi5Hx71UExcJbV4Lld-6GNlEDubfgDdSTKQKY9rs_ZNV-6OYMjKblZTiIWAAKbcVjnmXvO6V0P0RP7yJlHGUcCY',
      tags: ['ماجستير دراسات إسلامية'],
      hours: 1200,
      students: 180,
      qualification: 'دكتوراه في الدراسات الإسلامية',
      languages: 'العربية، الأردية',
      completedSessions: 1200,
    },
    {
      id: '4',
      name: 'الشيخ أحمد محمد',
      specialty: 'متخصص في التجويد والقراءات',
      description: 'إجازة في القراءات العشر، خبرة أكثر من 10 سنوات في تعليم القرآن لجميع الفئات العمرية.',
      rating: 4.9,
      reviews: 200,
      price: 18,
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuANceWlhvlc5OzyEQ6Yw5RuVW0W5G1RQpo9Cjj6vuonq6SDWjA3GyxPV_S4eFslf3V1rwsQubSIL6zJZOTE4fNRB8Mz8IjNwygqUGBKvFWBdnpgV0KFhaTxrCrP75bX-cliClUezCSQF0dkFVyux2zbD4XpISu50SyBWXWxAldf9Jx-jyB4xzXt9JpodwWI26p90gZ53j_lwg5jfqkschS94M6KkQC0kqP4WWrJd2EAobsTH2DFB9t0oaOwKI_2aoZD2guovmb1yZBg',
      tags: ['حفص عن عاصم', 'ورش'],
      hours: 1500,
      students: 200,
      qualification: 'خريج الأزهر الشريف',
      languages: 'العربية، الإنجليزية',
      completedSessions: 2500,
    },
    {
      id: '5',
      name: 'الأستاذة فاطمة علي',
      specialty: 'متخصصة في القاعدة النورانية',
      description: 'أسلوب مميز في تحبيب القرآن للطلاب، صبورة جداً مع المبتدئين من جميع الأعمار.',
      rating: 5.0,
      reviews: 350,
      price: 14,
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAKri3d2YSfegaGvjE-qQ9qr4zd-Tw_SDeqL9OCvZ63AvMIDb7WNzFkls7sYSYAmTRN65oa6zl9wvgihy73ySmxuFr_UiOO3s47YDDr6LuVom-XtB9eSGY_1MJWhOQISznulDWYHL6qtH4G_0Gjh961xVSBUX44IqUFQg-Mrg2JGe1Pf0fT7KvL0Ecg1mdEpD-WYc_47dFO0_g9U3gAOFiZzs6X9w-GHW0LPX5RdHUKk9_ZuIdFSaET5I8zVJSjF9vLMU_7AY2MfkSY',
      tags: ['نوراني', 'تربية إسلامية'],
      hours: 2100,
      students: 350,
      qualification: 'إجازة برواية حفص',
      languages: 'العربية، الفرنسية',
      completedSessions: 1200,
    },
    {
      id: '6',
      name: 'الشيخ عمر خالد',
      specialty: 'متخصص في الحفظ والمراجعة',
      description: 'حافظ لكتاب الله، يساعد الطلاب على وضع خطط حفظ ومراجعة فعالة.',
      rating: 4.8,
      reviews: 180,
      price: 10,
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCd687EdwPKsPHaDIVISwFZU2Q4cubQs3HsBA3EVOEZEAlfsZHYlQ1nHOdZQiBcVvXYgbM_CEhtQ7H4oN7B8WHUIeWX6R351bFfuIM4xZY6LIxm0LB12L2L95Y6_sGwMqo1BBVsxyH3OYxoG3XC9i6tMG-xk6wfPITnBIcN2IVSY7KR53_FIPt-FUN2oWsKdAM557-5pd-KQcfFOKlSZT_svnD5VqF_gesBgjemqlV_6eppWHYJto1GTT7meVelPipcAhAPDzwbNQMo',
      tags: ['تحفيظ', 'تفسير مبسط'],
      hours: 1200,
      students: 180,
      qualification: 'طالب بكلية القرآن',
      languages: 'العربية، الإنجليزية',
      completedSessions: 150,
    },
    {
      id: '7',
      name: 'الشيخ محمود علي',
      specialty: 'متخصص في القراءات العشر',
      description: 'إجازة في القراءات العشر الكبرى، خبرة 20 عاماً في التدريس.',
      rating: 4.9,
      reviews: 120,
      price: 20,
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuC2_fuCAcX99uPwiNfaJRgQrfgYXWnbLiT-Kqv6XMNSwFsluumi57plpFJY7YXU-Z8DKEDB_oKmZDfyACamFM_hozamNeII4oS-We-HqJNeGCNcj91zveK2Ev9gCM8mWP-WRxTqn6TdOEd5ecb5vX9MKLNymiCplR1KSnerG7e2ZvE-ayRAmocCUIyYaMflG_S4cFDxadiwsl69t0dmlQw1saRVlMSWRikjR_Z5CtWySpiUnrbISgASV_JSG87kg21GfeTDqNSlFC78',
      tags: ['قراءات', 'تجويد متقدم'],
      hours: 3000,
      students: 400,
      qualification: 'إجازة بالقراءات العشر',
      languages: 'العربية',
      completedSessions: 3000,
    },
    {
      id: '8',
      name: 'الأستاذة سارة إبراهيم',
      specialty: 'معلمة نورانية',
      description: 'متخصصة في تعليم القاعدة النورانية للمبتدئين من جميع الأعمار.',
      rating: 5.0,
      reviews: 95,
      price: 12,
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuB_4_z3deePswUFh1BlADJ7Q2TESJcAwk8decpvkyB3Afyp_yvuCoPJfjosRpLQyC6P4AdNOAjrSSgrDSoH7TFbF66BMY67yv_LQYGHaKorvqwLQ0ivqPQTMo3JZbUE8cPbHr2eFkzKasm4feH5iJFKiSQSbRjBR0NoM3ZsQRnMY68pcc3EuLEeFhEhCkH0fK4Q_Bnif-871posIvvqOzD6MMPeRaRVP2pVIoq8bU95kHsn2O8xnbl0yYfUSnCfCgS7Eexx7haHRytn',
      tags: ['نورانية', 'أطفال'],
      hours: 800,
      students: 120,
      qualification: 'إجازة برواية حفص',
      languages: 'العربية، الإنجليزية',
      completedSessions: 800,
    },
    {
      id: '9',
      name: 'الشيخ يوسف الحسن',
      specialty: 'مدرس تفسير وعلوم قرآن',
      description: 'دكتوراه في التفسير وعلوم القرآن، يشرح القرآن بطريقة مبسطة.',
      rating: 4.7,
      reviews: 165,
      price: 16,
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAj-RkjvS7-NECst0NgmWU2i6m_ZGxmQQg9qZwKHNXRwyJnmfEmIlcH5hFGto8ciymu_WOGScLlxilHaS7LzoyoEZ3-GAR3bkbA4jPh2Ycy6ynz0KE2mf4kElEZmUJMspz6Jg8AV0bHHgTuDbUVZdgpi-WA8ZBROkwTnQVzi1v2KS2Ni6TXuQFEAG_NGKigaMip2pa2yyfLy1cIiKEpLqZpNZ2Sgg21WpgCms5UN7AlKAvjd-g5Ow82J3RC3xQRiLFl2Xhzifdu0gDc',
      tags: ['تفسير', 'علوم قرآن'],
      hours: 1800,
      students: 250,
      qualification: 'دكتوراه في التفسير',
      languages: 'العربية، الإنجليزية',
      completedSessions: 1800,
    },
    {
      id: '10',
      name: 'الأستاذة نور الهدى',
      specialty: 'معلمة تحفيظ للنساء',
      description: 'حافظة للقرآن الكريم، متخصصة في تحفيظ النساء والفتيات.',
      rating: 4.7,
      reviews: 45,
      price: 8,
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuC17s4k_CeEkNp3Bk5pXnRQd6Cwt9CytG5qDXtpqKsReh7f58RYg1-9aB8U2CiT-O7rjZ8Tipz9l5a_ycVN_ckEGwPieL5505A-3UgEYWYJhPNqUbDuY-HVkWbFTgbJt_JraiVj8bM2eKVxnLimG9RruGNrn-zDKb60DrqqcBzqolR2SusfvUoJCN0CQiCMlk0j7OgVP2uX5eqzYry5U7eiXAcw3qXkdhRfjX2-GAJMcCEMU11kvhF7wzD11xJkDMXpcRJ-_NhsnRI8',
      tags: ['تأسيس', 'أطفال'],
      hours: 300,
      students: 50,
      qualification: 'حافظة للقرآن الكريم',
      languages: 'العربية',
      completedSessions: 300,
    },
    {
      id: '11',
      name: 'الشيخ خالد الصالح',
      specialty: 'مدرس لغة عربية وقرآن',
      description: 'خبرة في تعليم اللغة العربية للناطقين بغيرها مع تعليم القرآن.',
      rating: 4.6,
      reviews: 88,
      price: 11,
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAp5ka81Cesb_-ZabHcpG2cviXxsRHXNIqcUcCcxikDtI_h3m85mRzFaVo52JQwXWYojlFFmvdoyVROSfIw77nrq6EKeay6CsXOg1Akfu6dqjWs__VDk0VW3uwNzyt8P678q1C3eJJ3w6CN3_A94oNx_I8mYeY4HHTxQY0TFMqd10PDTqqVEQN7GIgi1vxMYwdbPjw1XCufccUSMBuFWDMletgdModTxVlp9ewi1AjPlE68gXwLdMAamVfZNGUFv-FG54KA4XqoqMYZ',
      tags: ['لغة عربية', 'قرآن'],
      hours: 950,
      students: 140,
      qualification: 'ماجستير لغة عربية',
      languages: 'العربية، الإنجليزية، الفرنسية',
      completedSessions: 950,
    },
    {
      id: '12',
      name: 'الأستاذة آمنة الصادق',
      specialty: 'معلمة قراءات متقدمة',
      description: 'إجازة في قراءات متعددة، متخصصة في تعليم القراءات للنساء.',
      rating: 5.0,
      reviews: 105,
      price: 13,
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAlCqazZcM7NMx0az3D0t3yM7BwzEwzg5ss1rlum9jZZtPIkVvSi1QSUEzs8XwDb9tVpcCq9Nvd7hlWv-xrGVcdEAF74gQSCMHkbHDajuCTmPwLm8CWBw8vkEHpB4y8R7dWfR3IqCxDKLjIp77yMh9AfNlJt6k2e7OM9uF5N-fWEFigV6Q4Etc4nwkVRD41tm2fodgh9Xqikl_4VS_iYsMGA3nFAijiyW4pHABNmu3o-c7kLUhb2LPBJsA-2z8fMksY2eorgg84Ymte',
      tags: ['متقدم', 'نساء فقط'],
      hours: 1800,
      students: 220,
      qualification: 'تخصص قراءات وعلوم قرآن',
      languages: 'العربية، الملايو',
      completedSessions: 1800,
    },
  ]

  const topTeachers = allTeachers.slice(0, 3)
  const regularTeachers = allTeachers.slice(3)

  return (
    <>
      <Header />
      <main className="flex-grow layout-container px-4 sm:px-10 py-6 max-w-[1400px] mx-auto w-full">
        {/* Breadcrumbs */}
        <div className="flex flex-wrap gap-2 mb-6 font-arabic">
          <Link to="/" className="text-[#8a8060] text-sm font-medium leading-normal hover:text-primary">
            الرئيسية
          </Link>
          <span className="text-[#8a8060] text-sm font-medium leading-normal">/</span>
          <span className="text-[#181611] dark:text-white text-sm font-medium leading-normal">المعلمون</span>
        </div>

        {/* Hero: Top 3 Recommendations */}
        <section className="mb-12 hidden">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-[#181611] dark:text-white text-2xl md:text-3xl font-bold leading-tight font-arabic">
                أفضل 3 معلمين لك
              </h1>
              <p className="text-[#8a8060] text-sm md:text-base mt-2 font-arabic">
                تم اختيارهم بناءً على تفضيلاتك واهتماماتك التعليمية
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full text-primary font-bold text-xs md:text-sm font-arabic border border-primary/20">
              <span className="material-symbols-outlined text-lg">auto_awesome</span>
              <span>توصيات الذكاء الاصطناعي</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topTeachers.map((teacher, index) => (
              <Link
                key={teacher.id}
                to={`/teachers/${teacher.id}`}
                className={`relative flex flex-col items-center bg-white dark:bg-[#1a170d] rounded-xl border-2 border-primary shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300 cursor-pointer ${
                  index === 1 ? 'transform md:-translate-y-2' : ''
                }`}
              >
                {index === 0 && (
                  <div className="absolute top-0 right-0 bg-primary text-[#181611] text-xs font-bold px-3 py-1 rounded-bl-lg z-10 font-arabic flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">stars</span>
                    خيار ممتاز
                  </div>
                )}
                {index === 1 && (
                  <>
                    <div className="absolute top-0 inset-x-0 h-1 bg-primary"></div>
                    <div className="absolute top-4 right-0 bg-primary text-[#181611] text-xs font-bold px-3 py-1 rounded-l-lg z-10 font-arabic flex items-center gap-1 shadow-md">
                      <span className="material-symbols-outlined text-sm">auto_awesome</span>
                      الأكثر تطابقاً
                    </div>
                  </>
                )}
                {index === 2 && (
                  <div className="absolute top-0 right-0 bg-primary text-[#181611] text-xs font-bold px-3 py-1 rounded-bl-lg z-10 font-arabic flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">trending_up</span>
                    صاعد
                  </div>
                )}
                <div className="w-full h-32 bg-gradient-to-b from-[#fffbeb] to-white dark:from-[#2d2a24] dark:to-[#1a170d] relative">
                  <div className="absolute -bottom-12 right-1/2 translate-x-1/2">
                    <div
                      className="w-24 h-24 rounded-full border-4 border-white dark:border-[#1a170d] bg-gray-200 overflow-hidden"
                      style={{
                        backgroundImage: `url(${teacher.image})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    />
                  </div>
                </div>
                <div className="pt-14 pb-6 px-4 text-center w-full">
                  <h3 className="text-lg font-bold text-[#181611] dark:text-white font-arabic">
                    {teacher.name}
                  </h3>
                  <p className="text-[#8a8060] text-sm mb-3 font-arabic">{teacher.specialty}</p>
                  <div className="flex items-center justify-center gap-1 text-primary mb-4">
                    <span className="material-symbols-outlined text-lg filled">star</span>
                    <span className="font-bold text-[#181611] dark:text-white">{teacher.rating}</span>
                    <span className="text-[#8a8060] text-xs">({teacher.reviews} تقييم)</span>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2 mb-4">
                    {teacher.tags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="bg-[#f5f3f0] dark:bg-[#2d2a24] text-[#181611] dark:text-white px-2 py-1 rounded text-xs font-arabic"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-4 border-t border-[#f5f3f0] dark:border-[#2d2a24] w-full">
                    <div className="text-right">
                      <p className="text-xs text-[#8a8060] font-arabic">السعر للساعة</p>
                      <p className="text-lg font-bold text-primary">{teacher.price}$</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleBookTrial()
                      }}
                      className={`bg-primary hover:bg-primary/90 text-[#181611] text-sm font-bold py-2 px-4 rounded-lg font-arabic transition-colors ${
                        index === 1 ? 'shadow-md shadow-primary/20' : ''
                      }`}
                    >
                      {index === 1 ? 'احجز تجربة مجانية' : 'احجز تجربة'}
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Mobile Filter Overlay */}
          {isFilterOpen && (
            <button
              type="button"
              aria-label="Close filter"
              className="lg:hidden fixed inset-0 bg-black/30 z-40"
              onClick={() => setIsFilterOpen(false)}
            />
          )}
          {/* Filters Sidebar */}
          <aside className={`w-full lg:w-72 flex-shrink-0 space-y-6 transition-transform duration-300 ${isFilterOpen ? 'fixed lg:relative top-0 right-0 h-full lg:h-auto overflow-y-auto lg:overflow-visible bg-white dark:bg-[#1a170d] z-50 lg:z-auto p-4 lg:p-0 block max-w-sm lg:max-w-none' : 'hidden lg:block'}`}>
            <div className="bg-white dark:bg-[#1a170d] rounded-xl p-5 shadow-sm border border-[#e6e2de] dark:border-[#3a3528]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg font-arabic text-[#181611] dark:text-white">
                  تصفية النتائج
                </h3>
                <div className="flex items-center gap-2">
                  <button className="text-primary text-sm font-medium hover:underline font-arabic">
                    مسح الكل
                  </button>
                  <button
                    onClick={() => setIsFilterOpen(false)}
                    className="lg:hidden text-text-main hover:text-primary p-1"
                    aria-label="Close filter"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
              </div>
              {/* Subjects Filter */}
              <div className="mb-6">
                <h4 className="font-medium mb-3 text-sm text-[#8a8060] font-arabic">المادة التعليمية</h4>
                <div className="flex flex-wrap gap-2">
                  <button className="px-3 py-1.5 rounded-full bg-primary text-[#181611] text-sm font-medium font-arabic border border-primary">
                    الكل
                  </button>
                  <button className="px-3 py-1.5 rounded-full bg-white dark:bg-[#2d2a24] text-[#181611] dark:text-[#dadada] text-sm font-medium border border-[#e6e2de] dark:border-[#4d4738] hover:border-primary font-arabic transition-colors">
                    تجويد
                  </button>
                  <button className="px-3 py-1.5 rounded-full bg-white dark:bg-[#2d2a24] text-[#181611] dark:text-[#dadada] text-sm font-medium border border-[#e6e2de] dark:border-[#4d4738] hover:border-primary font-arabic transition-colors">
                    حفظ
                  </button>
                  <button className="px-3 py-1.5 rounded-full bg-white dark:bg-[#2d2a24] text-[#181611] dark:text-[#dadada] text-sm font-medium border border-[#e6e2de] dark:border-[#4d4738] hover:border-primary font-arabic transition-colors">
                    لغة عربية
                  </button>
                  <button className="px-3 py-1.5 rounded-full bg-white dark:bg-[#2d2a24] text-[#181611] dark:text-[#dadada] text-sm font-medium border border-[#e6e2de] dark:border-[#4d4738] hover:border-primary font-arabic transition-colors">
                    قراءات
                  </button>
                </div>
              </div>
              {/* Price Slider */}
              <div className="mb-6">
                <h4 className="font-medium mb-3 text-sm text-[#8a8060] font-arabic">نطاق السعر (للساعة)</h4>
                <input
                  className="w-full h-2 bg-[#f5f3f0] dark:bg-[#2d2a24] rounded-lg appearance-none cursor-pointer accent-primary"
                  type="range"
                  min="5"
                  max="50"
                  defaultValue="25"
                />
                <div className="flex justify-between mt-2 text-sm text-[#181611] dark:text-white font-arabic">
                  <span>5$</span>
                  <span className="font-bold text-primary">25$</span>
                  <span>50$+</span>
                </div>
              </div>
              {/* Gender Filter */}
              <div className="mb-6">
                <h4 className="font-medium mb-3 text-sm text-[#8a8060] font-arabic">جنس المعلم</h4>
                <div className="space-y-2 font-arabic">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center">
                      <input
                        className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-[#8a8060] checked:bg-primary checked:border-primary transition-all"
                        type="checkbox"
                      />
                      <span className="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <svg
                          className="h-3.5 w-3.5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            clipRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            fillRule="evenodd"
                          />
                        </svg>
                      </span>
                    </div>
                    <span className="text-[#181611] dark:text-[#dadada] group-hover:text-primary transition-colors">
                      معلم
                    </span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center">
                      <input
                        className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-[#8a8060] checked:bg-primary checked:border-primary transition-all"
                        type="checkbox"
                      />
                      <span className="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <svg
                          className="h-3.5 w-3.5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            clipRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            fillRule="evenodd"
                          />
                        </svg>
                      </span>
                    </div>
                    <span className="text-[#181611] dark:text-[#dadada] group-hover:text-primary transition-colors">
                      معلمة
                    </span>
                  </label>
                </div>
              </div>
              {/* Rating Filter */}
              <div className="mb-2">
                <h4 className="font-medium mb-3 text-sm text-[#8a8060] font-arabic">التقييم</h4>
                <div className="space-y-2 font-arabic">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input className="peer sr-only" name="rating" type="radio" />
                    <div className="w-4 h-4 rounded-full border border-[#8a8060] peer-checked:bg-primary peer-checked:border-primary"></div>
                    <span className="flex items-center gap-1 text-[#181611] dark:text-[#dadada]">
                      <span className="material-symbols-outlined text-primary text-sm filled">star</span>
                      <span>4.5 فما فوق</span>
                    </span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input className="peer sr-only" name="rating" type="radio" />
                    <div className="w-4 h-4 rounded-full border border-[#8a8060] peer-checked:bg-primary peer-checked:border-primary"></div>
                    <span className="flex items-center gap-1 text-[#181611] dark:text-[#dadada]">
                      <span className="material-symbols-outlined text-primary text-sm filled">star</span>
                      <span>4.0 فما فوق</span>
                    </span>
                  </label>
                </div>
              </div>
            </div>
            {/* Promo Banner Sidebar */}
            <div className="bg-primary/10 rounded-xl p-5 border border-primary/20 text-center">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-3 text-white">
                <span className="material-symbols-outlined">card_giftcard</span>
              </div>
              <h4 className="font-bold text-[#181611] dark:text-white mb-1 font-arabic">جرب مجاناً!</h4>
              <p className="text-xs text-[#8a8060] mb-3 font-arabic">
                احصل على حصة تجريبية مجانية مع أي معلم تختاره.
              </p>
            </div>
          </aside>

          {/* Grid Content */}
          <div className="flex-grow">
            {/* Sorting Bar */}
            <div className="flex flex-wrap items-center justify-between mb-6 pb-4 border-b border-[#e6e2de] dark:border-[#3a3528]">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="lg:hidden flex items-center gap-2 px-3 py-2 rounded-lg border border-[#e6e2de] dark:border-[#3a3528] bg-white dark:bg-[#1a170d] text-[#181611] dark:text-white hover:bg-[#f5f3f0] dark:hover:bg-[#2d2a24] transition-colors font-arabic"
                  aria-label="Toggle filter"
                >
                  <span className="material-symbols-outlined text-lg">tune</span>
                  <span className="text-sm font-medium">تصفية</span>
                </button>
                <p className="text-[#8a8060] font-arabic text-sm">
                  <span className="font-bold text-[#181611] dark:text-white">{allTeachers.length}</span> معلم متاح
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#8a8060] font-arabic">ترتيب حسب:</span>
                <select className="bg-transparent border-none text-[#181611] dark:text-white font-medium text-sm focus:ring-0 cursor-pointer font-arabic pr-0 pl-8">
                  <option>الأعلى تقييماً</option>
                  <option>السعر: الأقل للأعلى</option>
                  <option>السعر: الأعلى للأقل</option>
                  <option>الأكثر خبرة</option>
                </select>
              </div>
            </div>
            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 place-items-center">
              {regularTeachers.map((teacher) => (
                <Link
                  key={teacher.id}
                  to={`/teachers/${teacher.id}`}
                  className="bg-white dark:bg-[#1a170d] rounded-xl border border-[#e6e2de] dark:border-[#3a3528] overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full cursor-pointer w-full"
                >
                  <div className="p-5 flex flex-col h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-14 h-14 rounded-full bg-gray-200 overflow-hidden flex-shrink-0"
                          style={{
                            backgroundImage: `url(${teacher.image})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }}
                        />
                        <div>
                          <h3 className="font-bold text-[#181611] dark:text-white font-arabic text-lg leading-tight">
                            {teacher.name}
                          </h3>
                          <div className="flex items-center gap-1 mt-1">
                            <span className="material-symbols-outlined text-primary text-sm filled">star</span>
                            <span className="text-sm font-bold text-[#181611] dark:text-white">
                              {teacher.rating}
                            </span>
                            <span className="text-xs text-[#8a8060]">({teacher.reviews})</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-lg font-bold text-primary font-arabic">{teacher.price}$</span>
                        <span className="text-[10px] text-[#8a8060] font-arabic">/ساعة</span>
                      </div>
                    </div>
                    <div className="space-y-2 mb-4 flex-grow">
                      <div className="flex items-center gap-2 text-sm text-[#4d4738] dark:text-[#a09a8a] font-arabic">
                        <span className="material-symbols-outlined text-base">school</span>
                        <span>{teacher.qualification}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[#4d4738] dark:text-[#a09a8a] font-arabic">
                        <span className="material-symbols-outlined text-base">translate</span>
                        <span>يتحدث: {teacher.languages}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[#4d4738] dark:text-[#a09a8a] font-arabic">
                        <span className="material-symbols-outlined text-base">schedule</span>
                        <span>{teacher.completedSessions}+ حصة مكتملة</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {teacher.tags.map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="px-2 py-1 bg-[#f5f3f0] dark:bg-[#2d2a24] text-[#8a8060] text-xs rounded font-arabic"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleBookTrial()
                      }}
                      className="w-full py-2.5 rounded-lg border-2 border-primary text-[#181611] dark:text-white font-bold text-sm hover:bg-primary hover:text-white transition-all font-arabic mt-auto text-center"
                    >
                      احجز تجربة
                    </button>
                  </div>
                </Link>
              ))}
            </div>
            {/* Pagination */}
            <div className="flex justify-center mt-12 mb-6">
              <div className="flex items-center gap-2 font-arabic">
                <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#e6e2de] dark:border-[#3a3528] bg-white dark:bg-[#1a170d] text-[#8a8060] hover:bg-[#f5f3f0] dark:hover:bg-[#2d2a24]">
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
                <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary text-[#181611] font-bold">
                  1
                </button>
                <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#e6e2de] dark:border-[#3a3528] bg-white dark:bg-[#1a170d] text-[#181611] dark:text-white hover:bg-[#f5f3f0] dark:hover:bg-[#2d2a24]">
                  2
                </button>
                <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#e6e2de] dark:border-[#3a3528] bg-white dark:bg-[#1a170d] text-[#181611] dark:text-white hover:bg-[#f5f3f0] dark:hover:bg-[#2d2a24]">
                  3
                </button>
                <span className="text-[#8a8060]">...</span>
                <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#e6e2de] dark:border-[#3a3528] bg-white dark:bg-[#1a170d] text-[#181611] dark:text-white hover:bg-[#f5f3f0] dark:hover:bg-[#2d2a24]">
                  8
                </button>
                <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#e6e2de] dark:border-[#3a3528] bg-white dark:bg-[#1a170d] text-[#8a8060] hover:bg-[#f5f3f0] dark:hover:bg-[#2d2a24]">
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <LoginModal />
      <Popup />
    </>
  )
}

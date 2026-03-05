import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  ar: {
    translation: {
      nav: {
        home: "الرئيسية",
        programs: "البرامج",
        teachers: "المعلمون",
        eval: "جلسة تقييم مجانية",
        dashboard: "لوحة الطالب",
        admin: "لوحة الإدارة"
      },
      auth: {
        login: "تسجيل الدخول"
      },
      hero: {
        badge: "✨ جلسة تقييم مجانية متاحة",
        ayah_ref: "سورة القمر ١٧:٥٤",
        title_line1: "تعلّم القرآن عبر الإنترنت",
        title_line2: "في أي وقت ومن أي مكان",
        desc: "اتصل بمعلمي قرآن معتمدين وذوي خبرة لجلسات فردية مخصصة من راحة منزلك.",
        cta_trial: "احجز جلسة تقييم مجانية",
        cta_teachers: "تصفح المعلمين",
        stat_students: "الطلاب",
        stat_teachers: "المعلمون",
        stat_rating: "متوسط التقييم",
        stat_countries: "دول"
      },
      programsSection: {
        eyebrow: "برامجنا",
        title: "تعليم قرآني متكامل",
        desc: "اختر من بين مجموعة من البرامج المصممة بعناية لتناسب احتياجاتك.",
        learnMore: "اعرف المزيد",
        enrollNow: "سجّل الآن"
      },
      howItWorks: {
        eyebrow: "كيف تعمل المنصة",
        title: "ابدأ في ٤ خطوات بسيطة",
        desc: "ابدأ رحلتك مع القرآن اليوم – لا يستغرق الأمر سوى دقائق قليلة.",
        steps: {
          one_title: "احجز جلسة تقييم",
          one_desc: "اطلب جلسة تقييم مجانية في الوقت الذي يناسبك.",
          two_title: "قابل معلمك",
          two_desc: "احصل على جلسة مجانية لمدة ٣٠ دقيقة لتقييم مستواك وأهدافك.",
          three_title: "اختر خطتك",
          three_desc: "اختر الخطة والجدول الذي يناسب أسلوب حياتك.",
          four_title: "ابدأ التعلم",
          four_desc: "ابدأ جلسات فردية منتظمة عبر زووم."
        }
      },
      teachersSection: {
        eyebrow: "معلمونا",
        title: "تعلم مع مشايخ ومعلمات معتمدين",
        desc: "جميع معلمينا مجازون ومؤهلون ومتحمسون لجعل القرآن قريباً من الجميع.",
        card: {
          pricePerHour: "دولار/ساعة",
          expYears: "سنة خبرة",
          reviews: "مراجعة",
          bookSession: "احجز جلسة"
        }
      },
      pricingSection: {
        eyebrow: "الأسعار",
        title: "خطط واضحة ومرنة",
        desc: "اشتراكات شهرية بدون أي رسوم مخفية. يمكنك الإلغاء في أي وقت.",
        mostPopular: "الأكثر شيوعاً",
        perMonth: "شهرياً",
        sessionsSummary: "جلسة · {{perWeek}} مرات/الأسبوع",
        getStarted: "ابدأ الآن"
      },
      testimonialsSection: {
        eyebrow: "آراء الطلاب",
        title: "ماذا يقول طلابنا"
      },
      evalPage: {
        eyebrow: "جلسة مجانية",
        title: "احجز جلسة التقييم المجانية",
        desc: "املأ بياناتك وسنرتب لك جلسة مجانية لمدة ٣٠ دقيقة لتقييم مستواك وترشيح أفضل برنامج لك.",
        submittedTitle: "تم استلام الطلب",
        submittedDesc: "شكراً لك! سيقوم فريقنا بمراجعة طلبك والتواصل معك خلال ٢٤ ساعة لتأكيد الجلسة.",
        submittedAgain: "احجز طلباً آخر",
        cardTitle: "بياناتك",
        cardSub: "الحقول المشار إليها بعلامة * مطلوبة.",
        firstName: "الاسم الأول *",
        firstNamePlaceholder: "مثال: أحمد",
        lastName: "اسم العائلة *",
        lastNamePlaceholder: "مثال: خان",
        email: "البريد الإلكتروني *",
        emailPlaceholder: "you@email.com",
        phone: "رقم الجوال",
        phonePlaceholder: "مثال: ‎+44 7xxx xxxxxx",
        program: "البرنامج *",
        programPlaceholder: "اختر برنامجاً",
        level: "المستوى الحالي",
        levelPlaceholder: "اختر المستوى",
        levelOptions: {
          beginner0: "مبتدئ تماماً",
          beginner: "مبتدئ",
          intermediate: "متوسط",
          advanced: "متقدم"
        },
        submit: "إرسال الطلب"
      }
    }
  },
  en: {
    translation: {
      nav: {
        home: "Home",
        programs: "Programs",
        teachers: "Teachers",
        eval: "Free Evaluation",
        dashboard: "Student Dashboard",
        admin: "Admin Panel"
      },
      auth: {
        login: "Log In"
      },
      hero: {
        badge: "✨ Free Evaluation Session Available",
        ayah_ref: "Surah Al-Qamar 54:17",
        title_line1: "Learn Quran Online",
        title_line2: "Anytime, Anywhere",
        desc: "Connect with certified, experienced Quran teachers for personalized one-on-one sessions from the comfort of your home.",
        cta_trial: "Book Free Evaluation",
        cta_teachers: "Browse Teachers",
        stat_students: "Students",
        stat_teachers: "Teachers",
        stat_rating: "Average Rating",
        stat_countries: "Countries"
      },
      programsSection: {
        eyebrow: "Our Programs",
        title: "Comprehensive Quran Education",
        desc: "Choose from a variety of carefully designed programs to suit your needs.",
        learnMore: "Learn More",
        enrollNow: "Enroll Now"
      },
      howItWorks: {
        eyebrow: "How It Works",
        title: "Start in 4 Simple Steps",
        desc: "Begin your Quran journey today - it only takes a few minutes.",
        steps: {
          one_title: "Book Evaluation",
          one_desc: "Request a free evaluation session at your convenience.",
          two_title: "Meet Your Teacher",
          two_desc: "Get a free 30-min session to assess your level and goals.",
          three_title: "Choose Your Plan",
          three_desc: "Select a plan and schedule that fits your lifestyle.",
          four_title: "Start Learning",
          four_desc: "Begin regular one-on-one sessions via Zoom."
        }
      },
      teachersSection: {
        eyebrow: "Our Teachers",
        title: "Learn with Certified Sheikhs",
        desc: "All our teachers are certified (Ijazah), qualified, and passionate about making Quran accessible to everyone.",
        card: {
          pricePerHour: "$/hr",
          expYears: "Years Exp.",
          reviews: "Reviews",
          bookSession: "Book Session"
        }
      },
      pricingSection: {
        eyebrow: "Pricing",
        title: "Clear, Flexible Plans",
        desc: "Monthly subscriptions with no hidden fees. Cancel anytime.",
        mostPopular: "Most Popular",
        perMonth: "/month",
        sessionsSummary: "Session · {{perWeek}} times/week",
        getStarted: "Get Started"
      },
      testimonialsSection: {
        eyebrow: "Testimonials",
        title: "What Our Students Say"
      },
      evalPage: {
        eyebrow: "Free Session",
        title: "Book Your Free Evaluation",
        desc: "Fill in your details and we'll arrange a free 30-minute session to assess your level and recommend the best program.",
        submittedTitle: "Request Received",
        submittedDesc: "Thank you! Our team will review your request and contact you within 24 hours to confirm the session.",
        submittedAgain: "Book Another",
        cardTitle: "Your Details",
        cardSub: "Fields marked with * are required.",
        firstName: "First Name *",
        firstNamePlaceholder: "e.g. Ahmed",
        lastName: "Last Name *",
        lastNamePlaceholder: "e.g. Khan",
        email: "Email Address *",
        emailPlaceholder: "you@email.com",
        phone: "Mobile Number",
        phonePlaceholder: "e.g. +44 7xxx xxxxxx",
        program: "Program *",
        programPlaceholder: "Select a program",
        level: "Current Level",
        levelPlaceholder: "Select level",
        levelOptions: {
          beginner0: "Absolute Beginner",
          beginner: "Beginner",
          intermediate: "Intermediate",
          advanced: "Advanced"
        },
        submit: "Submit Request"
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "ar", // default language
    fallbackLng: "ar",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;

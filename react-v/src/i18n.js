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
        timezone: "المنطقة الزمنية",
        timezonePlaceholder: "اختر منطقتك الزمنية",
        notes: "ملاحظات إضافية",
        notesPlaceholder: "اكتب أهدافك، مواعيدك المناسبة، أو أي متطلبات خاصة...",
        submit: "احجز جلسة التقييم المجانية",
        toastRequired: "يرجى تعبئة الحقول المطلوبة.",
        toastSubmitted: "تم إرسال طلب التقييم، سنتواصل معك قريباً.",
        privacy: "🔒 بياناتك آمنة ولن يتم مشاركتها. متوافقون مع GDPR."
      },
      teachersPage: {
        eyebrow: "معلمون معتمدون",
        title: "ابحث عن المعلم المناسب لك",
        desc: "تصفح المعلمين المجربين والمعتمدين واحجز جلسة اليوم.",
        filterLabel: "تصفية حسب:",
        filters: {
          all: "الكل",
          tajweed: "التجويد",
          children: "الأطفال",
          hifz: "الحفظ",
          arabic: "اللغة العربية",
          newMuslims: "المسلمون الجدد"
        },
        reviewsCount: "{{count}} مراجعة",
        onlineNow: "● متصل الآن",
        offline: "○ غير متصل",
        bookSession: "احجز جلسة",
        modal: {
          selectSlotLabel: "اختر موعداً متاحاً",
          sessionDuration: "مدة الجلسة",
          duration30: "٣٠ دقيقة",
          duration45: "٤٥ دقيقة",
          duration60: "٦٠ دقيقة",
          toastSelectSlot: "يرجى اختيار موعد أولاً.",
          toastBooked: "تم حجز جلسة مع {{name}} في {{slot}}.",
          confirm: "تأكيد الحجز – {{slot}}",
          selectToContinue: "اختر موعداً للمتابعة"
        }
      },
      programsPage: {
        eyebrow: "البرامج",
        title: "برامج التعلم لدينا"
      },
      footer: {
        brandDesc: "منصة موثوقة لتعليم القرآن عبر الإنترنت تربط الطلاب حول العالم بمعلمين معتمدين لجلسات فردية مخصصة.",
        programs: "البرامج",
        platform: "المنصة",
        support: "الدعم",
        platformLinks: [
          "ابحث عن معلم",
          "احجز جلسة مجانية",
          "الأسعار",
          "لوحة الطالب",
          "لوحة الإدارة"
        ],
        supportLinks: [
          "تواصل معنا",
          "الأسئلة الشائعة",
          "سياسة الخصوصية",
          "الشروط والأحكام",
          "اللائحة الأوروبية GDPR"
        ],
        bottom: "© ٢٠٢٦ منصة القرآن. جميع الحقوق محفوظة. · متوافقون مع GDPR · نخدم طلاباً في أكثر من ١٠ دول."
      },
      form: {
        currentPassword: "كلمة المرور الحالية",
        newPassword: "كلمة المرور الجديدة",
        confirmPassword: "تأكيد كلمة المرور",
        saveChanges: "حفظ التغييرات",
        updatePassword: "تحديث كلمة المرور"
      },
      toasts: {
        profileUpdated: "تم تحديث الملف الشخصي بنجاح.",
        passwordChanged: "تم تغيير كلمة المرور بنجاح.",
        zoomConnecting: "جاري الاتصال بزوم...",
        rescheduleSent: "تم إرسال طلب إعادة الجدولة.",
        bookingFlow: "جاري فتح مسار الحجز...",
        reviewForm: "جاري فتح نموذج التقييم...",
        selectSlot: "يرجى اختيار موعد أولاً."
      },
      loginPage: {
        eyebrow: "تسجيل الدخول",
        title: "سجل الدخول إلى حسابك",
        desc: "استخدم حساب Google أو Apple لتسجيل الدخول بسرعة وأمان.",
        googleSignIn: "تسجيل الدخول باستخدام Google",
        appleSignIn: "تسجيل الدخول باستخدام Apple",
        loading: "جاري تسجيل الدخول...",
        success: "تم تسجيل الدخول بنجاح!",
        error: "حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى.",
        privacy: "🔒 بياناتك آمنة ومشفرة. نحن لا نشارك معلوماتك مع أي طرف ثالث."
      },
      personalInfoPage: {
        eyebrow: "معلوماتك الشخصية",
        title: "أكمل ملفك الشخصي",
        desc: "نحتاج إلى بعض المعلومات الأساسية لبدء رحلتك مع القرآن الكريم.",
        step1Title: "المعلومات الأساسية",
        step1Desc: "الخطوة 1",
        step2Title: "التفاصيل الشخصية",
        step2Desc: "الخطوة 2",
        step3Title: "تفضيلات التعلم",
        step3Desc: "الخطوة 3",
        step4Title: "الأهداف والملاحظات",
        step4Desc: "الخطوة 4",
        firstName: "الاسم الأول",
        firstNamePlaceholder: "مثال: أحمد",
        lastName: "اسم العائلة",
        lastNamePlaceholder: "مثال: خان",
        phone: "رقم الجوال",
        phonePlaceholder: "مثال: +44 7xxx xxxxxx",
        dateOfBirth: "تاريخ الميلاد",
        gender: "الجنس",
        genderPlaceholder: "اختر",
        genderMale: "ذكر",
        genderFemale: "أنثى",
        genderOther: "أفضل عدم الإفصاح",
        country: "البلد",
        countryPlaceholder: "مثال: المملكة العربية السعودية",
        timezone: "المنطقة الزمنية",
        timezonePlaceholder: "اختر منطقتك الزمنية",
        program: "البرنامج",
        programPlaceholder: "اختر برنامجاً",
        level: "المستوى",
        levelPlaceholder: "اختر المستوى",
        levelOptions: {
          beginner0: "مبتدئ تماماً",
          beginner: "مبتدئ",
          intermediate: "متوسط",
          advanced: "متقدم"
        },
        goals: "أهدافك من التعلم",
        goalsPlaceholder: "اكتب أهدافك من تعلم القرآن الكريم...",
        notes: "ملاحظات إضافية",
        notesPlaceholder: "أي معلومات إضافية تريد مشاركتها...",
        next: "التالي",
        back: "السابق",
        submit: "إرسال",
        toastRequired: "يرجى تعبئة جميع الحقول المطلوبة.",
        toastSubmitted: "تم حفظ معلوماتك بنجاح!"
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
        dashboard: "Dashboard",
        admin: "Admin"
      },
      auth: {
        login: "Log in"
      },
      loginPage: {
        eyebrow: "Login",
        title: "Sign in to your account",
        desc: "Use your Google or Apple account to sign in quickly and securely.",
        googleSignIn: "Sign in with Google",
        appleSignIn: "Sign in with Apple",
        loading: "Signing in...",
        success: "Successfully signed in!",
        error: "An error occurred during sign in. Please try again.",
        privacy: "🔒 Your data is secure and encrypted. We do not share your information with any third parties."
      },
      personalInfoPage: {
        eyebrow: "Your Information",
        title: "Complete Your Profile",
        desc: "We need some basic information to start your journey with the Quran.",
        step1Title: "Basic Information",
        step1Desc: "Step 1",
        step2Title: "Personal Details",
        step2Desc: "Step 2",
        step3Title: "Learning Preferences",
        step3Desc: "Step 3",
        step4Title: "Goals & Notes",
        step4Desc: "Step 4",
        firstName: "First Name",
        firstNamePlaceholder: "e.g., Ahmed",
        lastName: "Last Name",
        lastNamePlaceholder: "e.g., Khan",
        phone: "Phone Number",
        phonePlaceholder: "e.g., +44 7xxx xxxxxx",
        dateOfBirth: "Date of Birth",
        gender: "Gender",
        genderPlaceholder: "Select",
        genderMale: "Male",
        genderFemale: "Female",
        genderOther: "Prefer not to say",
        country: "Country",
        countryPlaceholder: "e.g., Saudi Arabia",
        timezone: "Timezone",
        timezonePlaceholder: "Select your timezone",
        program: "Program",
        programPlaceholder: "Select a program",
        level: "Level",
        levelPlaceholder: "Select your level",
        levelOptions: {
          beginner0: "Complete Beginner",
          beginner: "Beginner",
          intermediate: "Intermediate",
          advanced: "Advanced"
        },
        goals: "Your Learning Goals",
        goalsPlaceholder: "Write your goals for learning the Quran...",
        notes: "Additional Notes",
        notesPlaceholder: "Any additional information you'd like to share...",
        next: "Next",
        back: "Back",
        submit: "Submit",
        toastRequired: "Please fill in all required fields.",
        toastSubmitted: "Your information has been saved successfully!"
      }
    }
  }
};

i18n.use(initReactI18next).init({
  resources,
  lng: "ar",
  fallbackLng: "ar",
  interpolation: {
    escapeValue: false
  }
});

export default i18n;


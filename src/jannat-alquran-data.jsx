const QuranProgramIcon = (
  <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true">
    <rect x="6" y="8" width="12" height="24" rx="2" fill="#F9F5EC" stroke="#1C3A2E" />
    <rect x="22" y="8" width="12" height="24" rx="2" fill="#F9F5EC" stroke="#1C3A2E" />
    <path d="M12 14h4" stroke="#C8922A" strokeWidth="1.5" />
    <path d="M24 14h4" stroke="#C8922A" strokeWidth="1.5" />
    <path d="M14 18c1.2 0.8 1.8 1.3 2 2-0.2 0.7-0.8 1.2-2 2" fill="none" stroke="#C8922A" strokeWidth="1.5" />
    <path d="M26 18c1.2 0.8 1.8 1.3 2 2-0.2 0.7-0.8 1.2-2 2" fill="none" stroke="#C8922A" strokeWidth="1.5" />
  </svg>
);

const ChildrenProgramIcon = (
  <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true">
    <circle cx="20" cy="14" r="6" fill="#F9F5EC" stroke="#1C3A2E" />
    <circle cx="18" cy="13.5" r="0.8" fill="#1C3A2E" />
    <circle cx="22" cy="13.5" r="0.8" fill="#1C3A2E" />
    <path d="M18 16c0.8 0.8 1.2 1 2 1s1.2-0.2 2-1" fill="none" stroke="#C8922A" strokeWidth="1.2" />
    <rect x="11" y="21" width="18" height="11" rx="5.5" fill="#C8922A" opacity="0.16" />
    <path d="M12 32c2-3 4.8-4.5 8-4.5S26 29 28 32" fill="none" stroke="#1C3A2E" strokeWidth="1.5" />
  </svg>
);

const HifzProgramIcon = (
  <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true">
    <rect x="10" y="8" width="18" height="24" rx="3" fill="#F9F5EC" stroke="#1C3A2E" />
    <path d="M14 12h10" stroke="#C8922A" strokeWidth="1.5" />
    <path d="M14 16h10" stroke="#C8922A" strokeWidth="1.5" />
    <path d="M14 20h7" stroke="#C8922A" strokeWidth="1.5" />
    <path d="M20 24l-3 3 3 3" fill="none" stroke="#1C3A2E" strokeWidth="1.5" />
  </svg>
);

const ArabicProgramIcon = (
  <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true">
    <rect x="7" y="9" width="26" height="22" rx="5" fill="#F9F5EC" stroke="#1C3A2E" />
    <path d="M14 24c1.5 1.5 3.2 2.2 5.5 2.2 3.3 0 5.8-1.9 5.8-4.7 0-2.4-1.6-4-4-4-1.6 0-2.8 0.7-3.6 1.9" fill="none" stroke="#C8922A" strokeWidth="1.6" />
    <path d="M18 17.2c0.5-1.5 1.3-2.6 2.5-3.4" fill="none" stroke="#1C3A2E" strokeWidth="1.4" />
    <circle cx="24.5" cy="14.5" r="1.1" fill="#1C3A2E" />
  </svg>
);

const NewMuslimsProgramIcon = (
  <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true">
    <path d="M10 24c2.2-3 4.4-4.5 6.6-4.5 2.3 0 3.6 1.3 4.6 2.6 1.1-1.6 2.6-2.6 4.6-2.6 2.1 0 4.1 1.4 6.2 4.5" fill="#F9F5EC" stroke="#1C3A2E" strokeWidth="1.5" />
    <path d="M15 26l3 3.2c0.5 0.5 1.2 0.5 1.7 0L22 26" fill="none" stroke="#C8922A" strokeWidth="1.5" />
    <circle cx="16" cy="15" r="3" fill="#F9F5EC" stroke="#1C3A2E" />
    <circle cx="24" cy="15" r="3" fill="#F9F5EC" stroke="#1C3A2E" />
    <path d="M8 30h24" stroke="#E0CFA8" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const PROGRAMS = [
  { id:1, icon:QuranProgramIcon, nameAr:"القرآن الكريم للكبار", nameEn:"Quran for Adults", desc:"Comprehensive Quran learning for adults including recitation, tajweed rules, and memorization at your own pace.", descAr:"برنامج شامل لتعلم القرآن الكريم للكبار يشمل التلاوة وأحكام التجويد والحفظ بحسب مستواك.", features:["Tajweed & proper recitation","Flexible scheduling","Beginner to advanced"], featuresAr:["تجويد وتلاوة صحيحة","مواعيد مرنة","من المبتدئ إلى المتقدم"] },
  { id:2, icon:ChildrenProgramIcon, nameAr:"برنامج الأطفال", nameEn:"Children's Program", desc:"Fun, engaging Quran education tailored for children aged 5–16, with interactive learning methods.", descAr:"برنامج ممتع ومشوق لتعليم القرآن للأطفال من ٥ إلى ١٦ سنة بأساليب تفاعلية.", features:["Age-appropriate curriculum","Interactive sessions","Progress reports for parents"], featuresAr:["منهج مناسب للأعمار","حصص تفاعلية","تقارير تقدم للوالدين"] },
  { id:3, icon:HifzProgramIcon, nameAr:"تحفيظ القرآن", nameEn:"Quran Memorization", desc:"Structured hifz program with regular revision, tracking, and personalized memorization plans.", descAr:"برنامج تحفيظ منظم مع مراجعة مستمرة ومتابعة وخطط حفظ شخصية.", features:["Personalized hifz plan","Weekly revision tracking","Ijazah preparation"], featuresAr:["خطة حفظ مخصصة","متابعة مراجعة أسبوعية","إعداد للإجازة"] },
  { id:4, icon:ArabicProgramIcon, nameAr:"اللغة العربية", nameEn:"Arabic Language", desc:"Learn Modern Standard Arabic and Quranic Arabic from beginner to advanced levels.", descAr:"تعلم العربية الفصحى والعربية القرآنية من المستوى المبتدئ حتى المتقدم.", features:["Grammar & vocabulary","Reading comprehension","Speaking & writing"], featuresAr:["قواعد ومفردات","فهم المقروء","محادثة وكتابة"] },
  { id:5, icon:NewMuslimsProgramIcon, nameAr:"المسلمون الجدد", nameEn:"New Muslims", desc:"Specially designed for new Muslims to learn the basics of Islam, prayer, and Quran recitation.", descAr:"برنامج مخصص للمسلمين الجدد لتعلم أساسيات الإسلام والصلاة وتلاوة القرآن.", features:["Fundamentals of Islam","Prayer guide","Patient, supportive teachers"], featuresAr:["أساسيات العقيدة والعبادة","دليل عملي للصلاة","معلمون صبورون وداعمون"] },
];

export const TEACHERS = [
  { id:1, name:"Sheikh Ahmad Al-Masri", nameAr:"الشيخ أحمد المصري", emoji:"👳", specialty:"Tajweed & Hifz", specialtyAr:"تجويد وتحفيظ القرآن", rating:4.9, reviews:127, price:18, online:true, exp:12, lang:["Arabic","English"] },
  { id:2, name:"Ustadha Fatima Noor", nameAr:"الأستاذة فاطمة نور", emoji:"🧕", specialty:"Children's Quran", specialtyAr:"قرآن الأطفال", rating:4.8, reviews:98, price:15, online:true, exp:8, lang:["Arabic","English"] },
  { id:3, name:"Sheikh Omar Al-Qari", nameAr:"الشيخ عمر القارئ", emoji:"👳", specialty:"Arabic Language", specialtyAr:"اللغة العربية", rating:4.7, reviews:84, price:20, online:false, exp:15, lang:["Arabic"] },
  { id:4, name:"Ustadha Mariam Hassan", nameAr:"الأستاذة مريم حسن", emoji:"🧕", specialty:"New Muslims", specialtyAr:"المسلمون الجدد", rating:5.0, reviews:63, price:16, online:true, exp:6, lang:["English","Arabic"] },
  { id:5, name:"Sheikh Yusuf Ibrahim", nameAr:"الشيخ يوسف إبراهيم", emoji:"👳", specialty:"Quran for Adults", specialtyAr:"القرآن للكبار", rating:4.9, reviews:152, price:22, online:true, exp:18, lang:["Arabic","English"] },
  { id:6, name:"Ustadha Zahra Al-Aziz", nameAr:"الأستاذة زهرة العزيز", emoji:"🧕", specialty:"Women's Classes", specialtyAr:"دروس النساء", rating:4.8, reviews:76, price:15, online:true, exp:9, lang:["Arabic","English"] },
];

export const SESSIONS = [
  { id:1, teacher:"Sheikh Ahmad Al-Masri", teacherAr:"الشيخ أحمد المصري", date:"Mon, 24 Feb 2026", time:"10:00 AM", program:"Tajweed & Hifz", programAr:"تجويد وتحفيظ القرآن", status:"scheduled", statusAr:"مجدولة", duration:"45 min", durationAr:"٤٥ دقيقة" },
  { id:2, teacher:"Ustadha Fatima Noor", teacherAr:"الأستاذة فاطمة نور", date:"Wed, 19 Feb 2026", time:"02:00 PM", program:"Children's Quran", programAr:"قرآن الأطفال", status:"completed", statusAr:"مكتملة", duration:"30 min", durationAr:"٣٠ دقيقة" },
  { id:3, teacher:"Sheikh Omar Al-Qari", teacherAr:"الشيخ عمر القارئ", date:"Fri, 14 Feb 2026", time:"06:00 PM", program:"Arabic Language", programAr:"اللغة العربية", status:"completed", statusAr:"مكتملة", duration:"60 min", durationAr:"٦٠ دقيقة" },
  { id:4, teacher:"Sheikh Ahmad Al-Masri", teacherAr:"الشيخ أحمد المصري", date:"Mon, 17 Feb 2026", time:"10:00 AM", program:"Tajweed & Hifz", programAr:"تجويد وتحفيظ القرآن", status:"cancelled", statusAr:"ملغاة", duration:"45 min", durationAr:"٤٥ دقيقة" },
  { id:5, teacher:"Ustadha Mariam Hassan", teacherAr:"الأستاذة مريم حسن", date:"Sat, 22 Feb 2026", time:"04:00 PM", program:"New Muslims", programAr:"المسلمون الجدد", status:"rescheduled", statusAr:"أعيد جدولتها", duration:"45 min", durationAr:"٤٥ دقيقة" },
];

export const NOTIFICATIONS = [
  { id:1, icon:"📅", type:"green", title:"Session Reminder", titleAr:"تذكير بالجلسة", body:"Your session with Sheikh Ahmad Al-Masri starts in 2 hours at 10:00 AM.", bodyAr:"جلستك مع الشيخ أحمد المصري ستبدأ بعد ساعتين في الساعة ١٠:٠٠ صباحًا.", time:"1 hour ago", timeAr:"منذ ساعة", unread:true },
  { id:2, icon:"✅", type:"amber", title:"Session Completed", titleAr:"تم إنهاء الجلسة", body:"Your Arabic Language session with Sheikh Omar Al-Qari has been marked as completed.", bodyAr:"تم وضع علامة مكتملة على جلسة اللغة العربية مع الشيخ عمر القارئ.", time:"3 hours ago", timeAr:"منذ ٣ ساعات", unread:true },
  { id:3, icon:"💳", type:"blue", title:"Payment Received", titleAr:"تم استلام الدفعة", body:"Your monthly subscription payment of $75 has been successfully processed.", bodyAr:"تمت معالجة دفعة اشتراكك الشهرية بقيمة ٧٥ دولارًا بنجاح.", time:"Yesterday", timeAr:"أمس", unread:false },
  { id:4, icon:"⭐", type:"amber", title:"Rate Your Session", titleAr:"قيّم جلستك", body:"How was your session with Ustadha Fatima Noor? Please leave a review.", bodyAr:"كيف كانت جلستك مع الأستاذة فاطمة نور؟ يرجى ترك تقييم.", time:"2 days ago", timeAr:"منذ يومين", unread:false },
  { id:5, icon:"📚", type:"green", title:"Progress Update", titleAr:"تحديث التقدم", body:"You have completed 3 of 5 Juz' in your memorization plan. Keep it up!", bodyAr:"أكملت ٣ من أصل ٥ أجزاء في خطة الحفظ الخاصة بك. استمر على هذا الخير!", time:"3 days ago", timeAr:"منذ ٣ أيام", unread:false },
];

export const SLOTS = [
  "Mon 24 Feb – 9:00 AM","Mon 24 Feb – 10:00 AM","Mon 24 Feb – 11:00 AM","Mon 24 Feb – 2:00 PM",
  "Tue 25 Feb – 9:00 AM","Tue 25 Feb – 3:00 PM","Wed 26 Feb – 10:00 AM","Wed 26 Feb – 4:00 PM",
];

export const SLOTS_AR = [
  "الاثنين ٢٤ فبراير – ٩:٠٠ صباحًا","الاثنين ٢٤ فبراير – ١٠:٠٠ صباحًا","الاثنين ٢٤ فبراير – ١١:٠٠ صباحًا","الاثنين ٢٤ فبراير – ٢:٠٠ مساءً",
  "الثلاثاء ٢٥ فبراير – ٩:٠٠ صباحًا","الثلاثاء ٢٥ فبراير – ٣:٠٠ مساءً","الأربعاء ٢٦ فبراير – ١٠:٠٠ صباحًا","الأربعاء ٢٦ فبراير – ٤:٠٠ مساءً",
];

export const PLANS = [
  { name:"Basic", nameAr:"الباقة الأساسية", sessionsPerWeek:2, sessionsPerMonth:8, price:49, features:["2 sessions/week","45-minute sessions","1 program access","Email support"], featuresAr:["جلستان في الأسبوع","جلسات لمدة ٤٥ دقيقة","وصول إلى برنامج واحد","دعم عبر البريد الإلكتروني"] },
  { name:"Standard", nameAr:"الباقة القياسية", sessionsPerWeek:3, sessionsPerMonth:12, price:75, featured:true, features:["3 sessions/week","45 or 60-minute sessions","All programs access","Priority support","Progress reports"], featuresAr:["٣ جلسات في الأسبوع","جلسات لمدة ٤٥ أو ٦٠ دقيقة","وصول إلى جميع البرامج","دعم بأولوية أعلى","تقارير تقدم دورية"] },
  { name:"Premium", nameAr:"الباقة المميزة", sessionsPerWeek:5, sessionsPerMonth:20, price:119, features:["5 sessions/week","60-minute sessions","All programs + Arabic","Dedicated teacher","Monthly evaluation"], featuresAr:["٥ جلسات في الأسبوع","جلسات لمدة ٦٠ دقيقة","جميع البرامج مع العربية","معلم مخصص","تقييم شهري"] },
];

export const TESTIMONIALS = [
  { text:"My daughter has memorised 3 Juz' in just 6 months. The teachers are incredibly patient and supportive. Highly recommended!", textAr:"ابنتي حفظت ٣ أجزاء في ٦ أشهر فقط. المعلمون في غاية الصبر والدعم. أنصح بها بشدة!", name:"Amira S.", nameAr:"أميرة س.", location:"London, UK", locationAr:"لندن، المملكة المتحدة", stars:5 },
  { text:"As a new Muslim I was nervous, but Ustadha Mariam made me feel so welcome. My recitation has improved massively in just 3 months.", textAr:"كمسلم جديد كنت متوتّرًا، لكن الأستاذة مريم جعلتني أشعر بترحيب كبير. تحسنت تلاوتي بشكل كبير خلال ٣ أشهر فقط.", name:"James O.", nameAr:"جايمس أ.", location:"Manchester, UK", locationAr:"مانشستر، المملكة المتحدة", stars:5 },
  { text:"The scheduling is so flexible for my busy work life. I can book sessions at any time and the quality is consistently excellent.", textAr:"مواعيد الحصص مرنة جدًا مع انشغالي في العمل. أستطيع حجز الجلسات في أي وقت والجودة متميزة دائمًا.", name:"Khalid R.", nameAr:"خالد ر.", location:"Toronto, Canada", locationAr:"تورونتو، كندا", stars:5 },
];

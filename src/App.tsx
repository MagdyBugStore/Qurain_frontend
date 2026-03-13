import React from "react";
import { useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import "./jannat-alquran.css";

import { AuthProvider } from "./contexts/AuthContext";
import Footer from "./components/layout/Footer";
import { ToastContainer } from "./components/layout/ToastContainer";
import { SEOHead } from "./components/seo/SEOHead";
import { useAppStore } from "./store/useAppStore";
import { LandingPage } from "./legacy-pages/LandingPage";
import { EvalPage } from "./legacy-pages/EvalPage";
import { DashboardPage } from "./legacy-pages/DashboardPage";
import { PersonalInfoPage } from "./legacy-pages/PersonalInfoPage";
// Import new app pages
import Home from "./app/page";
import AdultPage from "./app/adult/page";
import ProgramsPageNew from "./app/programs/page";
import TeachersPageNew from "./app/teachers/page";
import TeacherDetailPage from "./app/teachers/[id]/page";
import BookingPage from "./app/booking/[id]/page";
import BookingConfirmPage from "./app/booking/[id]/confirm/page";
import TechnicalCheckPage from "./app/technical-check/[id]/page";
import WaitingRoomPage from "./app/waiting-room/[id]/page";
import LiveSessionPage from "./app/live-session/[id]/page";
import PostSessionPage from "./app/post-session/[id]/page";
import RoadmapPage from "./app/roadmap/page";
import SectionsPage from "./app/sections/page";
import PersonalInfoPageNew from "./app/personal-info/page";
import TeacherApplicationPage from "./app/teacher-application/page";
import TeacherApplicationReviewPage from "./app/teacher-application/review/page";
import ProfilePage from "./app/profile/[id]/page";
import ProfileRedirect from "./app/profile/ProfileRedirect";
import AdminDashboard from "./app/admin/page";
import WalletPage from "./app/wallet/page";
import SupportPage from "./app/support/page";

function AppShell() {
  const [toasts, setToasts] = useState<{ id: number; msg: string; type: string }[]>([]);
  const storeToasts = useAppStore((state) => state.toasts);
  const location = useLocation();

  const addToast = (msg: string, type: string = "success") => {
    const id = Date.now();
    setToasts((current) => [...current, { id, msg, type }]);
    setTimeout(() => {
      setToasts((current) => current.filter((t) => t.id !== id));
    }, 3500);
  };
  
  // Combine both toast systems (legacy and store-based)
  const allToasts = [...toasts, ...storeToasts];

  const publicPaths = ["/", "/programs", "/teachers", "/eval"];
  const isPublicPage = publicPaths.includes(location.pathname);

  // SEO configuration per page
  const getSEOConfig = () => {
    const path = location.pathname;
    const geoLocation = {
      region: "SA",
      placename: "Saudi Arabia",
      latitude: 24.7136,
      longitude: 46.6753
    };

    switch (path) {
      case "/":
        return {
          title: "منصة القرآن - تعلم القرآن الكريم عبر الإنترنت | Quran Platform",
          description: "منصة متخصصة لتعلم القرآن الكريم عبر الإنترنت مع معلمين معتمدين. برامج شاملة تشمل التلاوة، التجويد، الحفظ، واللغة العربية.",
          keywords: "تعلم القرآن, تحفيظ القرآن, تجويد, تلاوة, اللغة العربية, دروس قرآنية أونلاين",
          type: "website",
          geoLocation
        };
      case "/programs":
        return {
          title: "برامج تعلم القرآن - منصة القرآن | Quran Learning Programs",
          description: "اكتشف برامجنا الشاملة لتعلم القرآن: القرآن للكبار، برنامج الأطفال، تحفيظ القرآن، اللغة العربية، وبرنامج المسلمين الجدد.",
          keywords: "برامج تعلم القرآن, تحفيظ القرآن, تجويد, برنامج الأطفال, اللغة العربية",
          type: "website",
          geoLocation
        };
      case "/teachers":
        return {
          title: "معلمو القرآن المعتمدون - منصة القرآن | Certified Quran Teachers",
          description: "تعرف على معلمينا المعتمدين ذوي الخبرة في تعليم القرآن الكريم، التجويد، واللغة العربية. احجز جلسة مع معلمك المفضل.",
          keywords: "معلمو القرآن, معلمين معتمدين, تجويد, تحفيظ القرآن, دروس قرآنية",
          type: "website",
          geoLocation
        };
      case "/eval":
        return {
          title: "جلسة تقييم مجانية - منصة القرآن | Free Evaluation Session",
          description: "احجز جلسة تقييم مجانية لمعرفة مستواك في القرآن الكريم وتحديد البرنامج المناسب لك.",
          keywords: "جلسة تقييم مجانية, تقييم مستوى القرآن, اختبار تجويد",
          type: "website",
          geoLocation
        };
      case "/dashboard":
        return {
          title: "لوحة الطالب - منصة القرآن | Student Dashboard",
          description: "تابع تقدمك في تعلم القرآن الكريم، جلساتك القادمة، ومعلميك.",
          type: "website",
          noindex: true,
          geoLocation
        };
      case "/admin":
        return {
          title: "لوحة الإدارة - منصة القرآن | Admin Panel",
          description: "لوحة تحكم إدارية لمنصة القرآن.",
          type: "website",
          noindex: true,
          geoLocation
        };
      case "/personal-info":
        return {
          title: "المعلومات الشخصية - منصة القرآن | Personal Information",
          description: "أكمل معلوماتك الشخصية للبدء في رحلتك مع القرآن.",
          type: "website",
          noindex: true,
          geoLocation
        };
      case "/profile":
        return {
          title: "الملف الشخصي - منصة القرآن | Profile",
          description: "إدارة ملفك الشخصي، تقدمك، إنجازاتك، وجدول حصصك.",
          type: "website",
          noindex: true,
          geoLocation
        };
      case "/student-profile":
      case "/teacher-profile":
        // Redirect old routes to new unified profile
        return {
          title: "الملف الشخصي - منصة القرآن | Profile",
          description: "إدارة ملفك الشخصي، تقدمك، إنجازاتك، وجدول حصصك.",
          type: "website",
          noindex: true,
          geoLocation
        };
      default:
        // Handle /profile/:id pattern
        if (path.startsWith("/profile/")) {
          return {
            title: "الملف الشخصي - منصة القرآن | Profile",
            description: "إدارة ملفك الشخصي، تقدمك، إنجازاتك، وجدول حصصك.",
            type: "website",
            noindex: true,
            geoLocation
          };
        }
        return {
          title: "منصة القرآن - تعلم القرآن الكريم عبر الإنترنت",
          description: "منصة متخصصة لتعلم القرآن الكريم عبر الإنترنت مع معلمين معتمدين.",
          type: "website",
          geoLocation
        };
    }
  };

  const seoConfig = getSEOConfig();

  return (
    <div className="app">
      <SEOHead {...seoConfig} />
      <Routes>
        {/* Legacy routes */}
        <Route path="/legacy" element={<LandingPage />} />
        <Route path="/eval" element={<EvalPage addToast={addToast} />} />
        <Route path="/personal-info" element={<PersonalInfoPageNew />} />
        <Route path="/personal-info-legacy" element={<PersonalInfoPage addToast={addToast} />} />
        <Route path="/dashboard" element={<DashboardPage addToast={addToast} />} />
        <Route path="/admin" element={<AdminDashboard addToast={addToast} />} />
        
        {/* New app routes */}
        <Route path="/" element={<Home />} />
        <Route path="/adult" element={<AdultPage />} />
        <Route path="/programs" element={<ProgramsPageNew />} />
        <Route path="/teachers" element={<TeachersPageNew />} />
        <Route path="/teachers/:id" element={<TeacherDetailPage />} />
        <Route path="/booking/:id" element={<BookingPage />} />
        <Route path="/booking/:id/confirm" element={<BookingConfirmPage />} />
        <Route path="/technical-check/:id" element={<TechnicalCheckPage />} />
        <Route path="/waiting-room/:id" element={<WaitingRoomPage />} />
        <Route path="/live-session/:id" element={<LiveSessionPage />} />
        <Route path="/post-session/:id" element={<PostSessionPage />} />
        <Route path="/roadmap" element={<RoadmapPage />} />
        <Route path="/sections" element={<SectionsPage />} />
        <Route path="/profile/:id" element={<ProfilePage />} />
        <Route path="/profile" element={<ProfileRedirect />} />
        {/* Legacy routes - redirect to /profile */}
        <Route path="/student-profile" element={<ProfileRedirect />} />
        <Route path="/teacher-profile" element={<ProfileRedirect />} />
        <Route path="/teacher-application" element={<TeacherApplicationPage />} />
        <Route path="/teacher-application/review" element={<TeacherApplicationReviewPage />} />
        <Route path="/wallet" element={<WalletPage />} />
        <Route path="/support" element={<SupportPage />} />
        
        {/* Fallback */}
        <Route path="*" element={<Home />} />
      </Routes>
      {isPublicPage && <Footer />}
      <ToastContainer toasts={allToasts} />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </BrowserRouter>
  );
}


import { useState } from "react";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import "./jannat-alquran.css";
import { AuthProvider } from "./contexts/AuthContext";
import { Topbar } from "./components/layout/Topbar";
import { Footer } from "./components/layout/Footer";
import { ToastContainer } from "./components/layout/ToastContainer";
import { SEOHead } from "./components/seo/SEOHead";
import { LandingPage } from "./pages/LandingPage";
import { EvalPage } from "./pages/EvalPage";
import { TeachersPage } from "./pages/TeachersPage";
import { ProgramsPage } from "./pages/ProgramsPage";
import { DashboardPage } from "./pages/DashboardPage";
import { AdminPage } from "./pages/AdminPage";
import { LoginPage } from "./pages/LoginPage";
import { PersonalInfoPage } from "./pages/PersonalInfoPage";

function AppShell() {
  const [toasts, setToasts] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  const addToast = (msg, type = "success") => {
    const id = Date.now();
    setToasts((current) => [...current, { id, msg, type }]);
    setTimeout(() => {
      setToasts((current) => current.filter((t) => t.id !== id));
    }, 3500);
  };

  const navLinks = [
    { id: "home", path: "/" },
    { id: "programs", path: "/programs" },
    { id: "teachers", path: "/teachers" },
    { id: "eval", path: "/eval" },
  ];

  const publicPaths = ["/", "/programs", "/teachers", "/eval", "/login"];
  const isPublicPage = publicPaths.includes(location.pathname);

  const handleNavigate = (path) => {
    navigate(path);
  };

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
      case "/login":
        return {
          title: "تسجيل الدخول - منصة القرآن | Login",
          description: "سجل الدخول إلى حسابك باستخدام Google أو Apple.",
          type: "website",
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
      default:
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
      <Topbar currentPath={location.pathname} navLinks={navLinks} onNavigate={handleNavigate} />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/programs" element={<ProgramsPage />} />
        <Route path="/teachers" element={<TeachersPage addToast={addToast} />} />
        <Route path="/eval" element={<EvalPage addToast={addToast} />} />
        <Route path="/login" element={<LoginPage addToast={addToast} />} />
        <Route path="/personal-info" element={<PersonalInfoPage addToast={addToast} />} />
        <Route path="/dashboard" element={<DashboardPage addToast={addToast} />} />
        <Route path="/admin" element={<AdminPage addToast={addToast} />} />
        <Route path="*" element={<LandingPage />} />
      </Routes>
      {isPublicPage && <Footer onNavigate={handleNavigate} />}
      <ToastContainer toasts={toasts} />
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

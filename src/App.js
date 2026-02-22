import { useState } from "react";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import "./jannat-alquran.css";
import { Topbar } from "./components/layout/Topbar";
import { Footer } from "./components/layout/Footer";
import { ToastContainer } from "./components/layout/ToastContainer";
import { LandingPage } from "./pages/LandingPage";
import { EvalPage } from "./pages/EvalPage";
import { TeachersPage } from "./pages/TeachersPage";
import { ProgramsPage } from "./pages/ProgramsPage";
import { DashboardPage } from "./pages/DashboardPage";
import { AdminPage } from "./pages/AdminPage";

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

  const publicPaths = ["/", "/programs", "/teachers", "/eval"];
  const isPublicPage = publicPaths.includes(location.pathname);

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <div className="app">
      <Topbar currentPath={location.pathname} navLinks={navLinks} onNavigate={handleNavigate} />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/programs" element={<ProgramsPage />} />
        <Route path="/teachers" element={<TeachersPage addToast={addToast} />} />
        <Route path="/eval" element={<EvalPage addToast={addToast} />} />
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
      <AppShell />
    </BrowserRouter>
  );
}

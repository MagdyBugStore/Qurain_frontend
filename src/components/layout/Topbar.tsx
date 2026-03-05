import { useState } from "react";
import { useTranslation } from "react-i18next";

interface NavLink {
  id: string;
  path: string;
}

interface TopbarProps {
  currentPath: string;
  navLinks: NavLink[];
  onNavigate: (path: string) => void;
}

export function Topbar({ currentPath, navLinks, onNavigate }: TopbarProps) {
  const { t, i18n } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const changeLanguage = (lang: string) => {
    if (i18n.language === lang) return;
    i18n.changeLanguage(lang);
    const html = document.documentElement;
    if (html) {
      html.dir = lang === "ar" ? "rtl" : "ltr";
      html.lang = lang;
    }
  };

  return (
    <header className="topbar">
      <div className="topbar-logo" onClick={() => onNavigate("/")}>
        <div className="topbar-logo-icon">🕌</div>
        <div className="topbar-logo-text">
          <span className="topbar-logo-ar">منصة القرآن</span>
          <span className="topbar-logo-en">Quran Platform</span>
        </div>
      </div>
      <nav className="topbar-nav">
        {navLinks.map((n) => (
          <button
            key={n.id}
            className={`tnav-btn${currentPath === n.path ? " active" : ""}`}
            onClick={() => {
              onNavigate(n.path);
              setMobileMenuOpen(false);
            }}
          >
            {t(`nav.${n.id}`)}
          </button>
        ))}
      </nav>
      <div className="topbar-right">
        <div className="topbar-lang-switcher">
          <button
            type="button"
            onClick={() => changeLanguage("ar")}
            className={`lang-btn${i18n.language === "ar" ? " active" : ""}`}
          >
            ع
          </button>
          <span className="lang-separator">/</span>
          <button
            type="button"
            onClick={() => changeLanguage("en")}
            className={`lang-btn${i18n.language === "en" ? " active" : ""}`}
          >
            EN
          </button>
        </div>
        <button className="topbar-cta" onClick={() => onNavigate("/login")}>
          {t("auth.login")}
        </button>
        <button 
          className="topbar-mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`hamburger${mobileMenuOpen ? " open" : ""}`}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>
      </div>
      {mobileMenuOpen && (
        <div className="topbar-mobile-menu">
          {navLinks.map((n) => (
            <button
              key={n.id}
              className={`mobile-nav-btn${currentPath === n.path ? " active" : ""}`}
              onClick={() => {
                onNavigate(n.path);
                setMobileMenuOpen(false);
              }}
            >
              {t(`nav.${n.id}`)}
            </button>
          ))}
          <div className="mobile-lang-switcher">
            <button
              type="button"
              onClick={() => changeLanguage("ar")}
              className={`mobile-lang-btn${i18n.language === "ar" ? " active" : ""}`}
            >
              ع
            </button>
            <span className="lang-separator">/</span>
            <button
              type="button"
              onClick={() => changeLanguage("en")}
              className={`mobile-lang-btn${i18n.language === "en" ? " active" : ""}`}
            >
              EN
            </button>
          </div>
          <button 
            className="mobile-nav-btn mobile-cta"
            onClick={() => {
              onNavigate("/login");
              setMobileMenuOpen(false);
            }}
          >
            {t("auth.login")}
          </button>
        </div>
      )}
    </header>
  );
}

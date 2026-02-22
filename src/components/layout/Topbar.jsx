import { useTranslation } from "react-i18next";

export function Topbar({ currentPath, navLinks, onNavigate }) {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lang) => {
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
          <span className="topbar-logo-ar">جنة القرآن</span>
          <span className="topbar-logo-en">Jannat Al-Quran</span>
        </div>
      </div>
      <nav className="topbar-nav">
        {navLinks.map((n) => (
          <button
            key={n.id}
            className={`tnav-btn${currentPath === n.path ? " active" : ""}`}
            onClick={() => onNavigate(n.path)}
          >
            {t(`nav.${n.id}`)}
          </button>
        ))}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            marginInline: 8
          }}
        >
          <button
            type="button"
            onClick={() => changeLanguage("ar")}
            style={{
              border: "none",
              background: i18n.language === "ar" ? "var(--forest)" : "transparent",
              color: i18n.language === "ar" ? "#fff" : "var(--text-m)",
              padding: "4px 8px",
              borderRadius: 999,
              fontSize: 11,
              cursor: "pointer"
            }}
          >
            ع
          </button>
          <span style={{ fontSize: 11, color: "var(--text-l)" }}>/</span>
          <button
            type="button"
            onClick={() => changeLanguage("en")}
            style={{
              border: "none",
              background: i18n.language === "en" ? "var(--forest)" : "transparent",
              color: i18n.language === "en" ? "#fff" : "var(--text-m)",
              padding: "4px 8px",
              borderRadius: 999,
              fontSize: 11,
              cursor: "pointer"
            }}
          >
            EN
          </button>
        </div>
        <button className="topbar-cta" onClick={() => onNavigate("/eval")}>
          {t("auth.login")}
        </button>
      </nav>
    </header>
  );
}

import { useTranslation } from "react-i18next";
import { PROGRAMS } from "../../jannat-alquran-data";

export function Footer({ onNavigate }) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  const publicLinks = t("footer.platformLinks", { returnObjects: true });
  const supportLinks = t("footer.supportLinks", { returnObjects: true });

  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <div className="topbar-logo">
            <div className="topbar-logo-icon" style={{ background: "rgba(255,255,255,.1)" }}>
              🕌
            </div>
            <div className="topbar-logo-text">
              <span className="topbar-logo-ar">جنة القرآن</span>
              <span className="topbar-logo-en">Jannat Al-Quran</span>
            </div>
          </div>
          <p className="footer-brand-desc">{t("footer.brandDesc")}</p>
        </div>
        <div>
          <h4 className="footer-heading">{t("footer.programs")}</h4>
          <ul className="footer-links">
            {PROGRAMS.map((p) => (
              <li key={p.id} onClick={() => onNavigate("programs")}>
                {isArabic ? p.nameAr : p.nameEn}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="footer-heading">{t("footer.platform")}</h4>
          <ul className="footer-links">
            {publicLinks.map((label, index) => {
              const routes = ["/teachers", "/eval", "/programs", "/dashboard", "/admin"];
              const target = routes[index] || "/";
              return (
                <li key={label} onClick={() => onNavigate(target)}>
                  {label}
                </li>
              );
            })}
          </ul>
        </div>
        <div>
          <h4 className="footer-heading">{t("footer.support")}</h4>
          <ul className="footer-links">
            {supportLinks.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="footer-bottom">{t("footer.bottom")}</div>
    </footer>
  );
}

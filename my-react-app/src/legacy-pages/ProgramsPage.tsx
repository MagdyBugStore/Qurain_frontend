import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PROGRAMS } from "../jannat-alquran-data";

export function ProgramsPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isArabic = i18n.language === "ar";
  return (
    <div className="page section">
      <div className="section-header">
        <span className="section-eyebrow">{t("programsPage.eyebrow")}</span>
        <h2 className="section-title">{t("programsPage.title")}</h2>
      </div>
      <div className="programs-grid">
        {PROGRAMS.map((p) => (
          <div key={p.id} className="program-card">
            <div className="program-icon">{p.icon}</div>
            <div className="program-title-ar">{p.nameAr}</div>
            <div className="program-title-en">{p.nameEn}</div>
            <p className="program-desc">{isArabic ? p.descAr : p.desc}</p>
            <div className="program-features">
              {(isArabic ? p.featuresAr : p.features).map((f, idx) => (
                <div key={idx} className="prog-feat">
                  <span className="prog-feat-dot" />
                  {f}
                </div>
              ))}
            </div>
            <button className="program-cta" onClick={() => navigate("/eval")}>
              {t("programsSection.enrollNow")}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
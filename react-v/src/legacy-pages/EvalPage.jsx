import { useState } from "react";
import { useTranslation } from "react-i18next";
import { PROGRAMS } from "../jannat-alquran-data";

export function EvalPage({ addToast }) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    program: "",
    level: "",
    timezone: "",
    notes: "",
  });

  const update = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handleSubmit = () => {
    if (!form.firstName || !form.email || !form.program) {
      addToast(t("evalPage.toastRequired"), "info");
      return;
    }
    setSubmitted(true);
    addToast(t("evalPage.toastSubmitted"), "success");
  };

  return (
    <div className="page eval-section">
      <div className="eval-container">
        <div className="section-header mb32">
          <span className="section-eyebrow">{t("evalPage.eyebrow")}</span>
          <h2 className="section-title">{t("evalPage.title")}</h2>
          <p className="section-desc">{t("evalPage.desc")}</p>
        </div>

        {submitted ? (
          <div className="eval-card text-center">
            <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
            <h3
              style={{
                fontFamily: "'Playfair Display',serif",
                fontSize: 24,
                color: "var(--forest)",
                marginBottom: 12,
              }}
            >
              {t("evalPage.submittedTitle")}
            </h3>
            <p
              style={{
                color: "var(--text-m)",
                lineHeight: 1.7,
                marginBottom: 24,
              }}
            >
              {t("evalPage.submittedDesc")}
            </p>
            <button
              className="form-submit"
              style={{ width: "auto", padding: "12px 28px" }}
              onClick={() => setSubmitted(false)}
            >
              {t("evalPage.submittedAgain")}
            </button>
          </div>
        ) : (
          <div className="eval-card">
            <h3 className="eval-card-title">{t("evalPage.cardTitle")}</h3>
            <p className="eval-card-sub">{t("evalPage.cardSub")}</p>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">{t("evalPage.firstName")}</label>
                <input
                  className="form-input"
                  placeholder={t("evalPage.firstNamePlaceholder")}
                  value={form.firstName}
                  onChange={(e) => update("firstName", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">{t("evalPage.lastName")}</label>
                <input
                  className="form-input"
                  placeholder={t("evalPage.lastNamePlaceholder")}
                  value={form.lastName}
                  onChange={(e) => update("lastName", e.target.value)}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">{t("evalPage.email")}</label>
                <input
                  className="form-input"
                  type="email"
                  placeholder={t("evalPage.emailPlaceholder")}
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">{t("evalPage.phone")}</label>
                <input
                  className="form-input"
                  placeholder={t("evalPage.phonePlaceholder")}
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">{t("evalPage.program")}</label>
                <select
                  className="form-select"
                  value={form.program}
                  onChange={(e) => update("program", e.target.value)}
                >
                  <option value="">{t("evalPage.programPlaceholder")}</option>
                  {PROGRAMS.map((p) => (
                    <option key={p.id} value={isArabic ? p.nameAr : p.nameEn}>
                      {isArabic ? p.nameAr : p.nameEn}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">{t("evalPage.level")}</label>
                <select
                  className="form-select"
                  value={form.level}
                  onChange={(e) => update("level", e.target.value)}
                >
                  <option value="">{t("evalPage.levelPlaceholder")}</option>
                  <option>{t("evalPage.levelOptions.beginner0")}</option>
                  <option>{t("evalPage.levelOptions.beginner")}</option>
                  <option>{t("evalPage.levelOptions.intermediate")}</option>
                  <option>{t("evalPage.levelOptions.advanced")}</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">{t("evalPage.timezone")}</label>
              <select
                className="form-select"
                value={form.timezone}
                onChange={(e) => update("timezone", e.target.value)}
              >
                <option value="">{t("evalPage.timezonePlaceholder")}</option>
                <option>GMT (London)</option>
                <option>GMT+2 (Cairo)</option>
                <option>GMT+3 (Riyadh)</option>
                <option>EST (New York)</option>
                <option>PST (Los Angeles)</option>
                <option>CST (Toronto)</option>
                <option>GST (Dubai)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">{t("evalPage.notes")}</label>
              <textarea
                className="form-textarea"
                placeholder={t("evalPage.notesPlaceholder")}
                value={form.notes}
                onChange={(e) => update("notes", e.target.value)}
              />
            </div>

            <button className="form-submit" onClick={handleSubmit}>
              {t("evalPage.submit")}
            </button>
            <p
              style={{
                fontSize: 12,
                color: "var(--text-l)",
                textAlign: "center",
                marginTop: 12,
              }}
            >
              {t("evalPage.privacy")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

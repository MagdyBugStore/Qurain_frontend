import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PROGRAMS, TEACHERS, PLANS, TESTIMONIALS } from "../jannat-alquran-data";
import { Stars } from "../components/common/Stars";

export function LandingPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isArabic = i18n.language === "ar";
  return (
    <div className="page">
      <section className="hero">
        <div className="hero-pattern" />
        <div className="hero-ornament" />
        <div className="hero-content">
          <div className="hero-badge">{t("hero.badge")}</div>
          <div className="hero-ayah">
            وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ فَهَلْ مِن مُّدَّكِرٍ
          </div>
          <div className="hero-ayah-ref">{t("hero.ayah_ref")}</div>
          <h1 className="hero-title">
            {t("hero.title_line1")}
            <br />
            <span>{t("hero.title_line2")}</span>
          </h1>
          <p className="hero-desc">
            {t("hero.desc")}
          </p>
          <div className="hero-actions">
            <button className="btn-hero-primary" onClick={() => navigate("/eval")}>
              {t("hero.cta_trial")}
            </button>
            <button className="btn-hero-secondary" onClick={() => navigate("/teachers")}>
              {t("hero.cta_teachers")}
            </button>
          </div>
          <div className="hero-stats">
            {[
              ["500+", t("hero.stat_students")],
              ["50+", t("hero.stat_teachers")],
              ["5 ★", t("hero.stat_rating")],
              ["10+", t("hero.stat_countries")],
            ].map(([n, l]) => (
              <div key={l} className="hero-stat">
                <div className="hero-stat-num">{n}</div>
                <div className="hero-stat-label">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <span className="section-eyebrow">{t("programsSection.eyebrow")}</span>
          <h2 className="section-title">{t("programsSection.title")}</h2>
          <p className="section-desc">{t("programsSection.desc")}</p>
        </div>
        <div className="programs-grid">
          {PROGRAMS.map((p) => (
            <div key={p.id} className="program-card" onClick={() => navigate("/eval")}>
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
              <button className="program-cta">{t("programsSection.learnMore")}</button>
            </div>
          ))}
        </div>
      </section>

      <section className="section bg-warm">
        <div className="section-header">
          <span className="section-eyebrow">{t("howItWorks.eyebrow")}</span>
          <h2 className="section-title">{t("howItWorks.title")}</h2>
          <p className="section-desc">{t("howItWorks.desc")}</p>
        </div>
        <div className="steps-grid">
          {[
            ["1", t("howItWorks.steps.one_title"), t("howItWorks.steps.one_desc")],
            ["2", t("howItWorks.steps.two_title"), t("howItWorks.steps.two_desc")],
            ["3", t("howItWorks.steps.three_title"), t("howItWorks.steps.three_desc")],
            ["4", t("howItWorks.steps.four_title"), t("howItWorks.steps.four_desc")],
          ].map(([n, title, desc]) => (
            <div key={n} className="step-card">
              <div className="step-num">{n}</div>
              <div className="step-title">{title}</div>
              <p className="step-desc">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <span className="section-eyebrow">{t("teachersSection.eyebrow")}</span>
          <h2 className="section-title">{t("teachersSection.title")}</h2>
          <p className="section-desc">{t("teachersSection.desc")}</p>
        </div>
        <div className="teachers-grid">
          {TEACHERS.slice(0, 4).map((teacher) => (
            <div key={teacher.id} className="teacher-card" onClick={() => navigate("/teachers")}>
              <div className="teacher-avatar">
                {teacher.emoji}
                {teacher.online && <div className="teacher-badge-online" />}
              </div>
              <div className="teacher-name">{isArabic ? teacher.nameAr : teacher.name}</div>
              <div className="teacher-specialty">{isArabic ? teacher.specialtyAr : teacher.specialty}</div>
              <Stars rating={teacher.rating} />
              <div className="teacher-info mb8">
                <span className="teacher-price">
                  ${teacher.price}/{t("teachersSection.card.pricePerHour")}
                </span>
                <span>·</span>
                <span>
                  {teacher.exp} {t("teachersSection.card.expYears")}
                </span>
              </div>
              <button className="teacher-btn">{t("teachersSection.card.bookSession")}</button>
            </div>
          ))}
        </div>
      </section>

      <section className="section bg-warm">
        <div className="section-header">
          <span className="section-eyebrow">{t("pricingSection.eyebrow")}</span>
          <h2 className="section-title">{t("pricingSection.title")}</h2>
          <p className="section-desc">{t("pricingSection.desc")}</p>
        </div>
        <div className="pricing-grid">
          {PLANS.map((plan) => (
            <div key={plan.name} className={`pricing-card${plan.featured ? " featured" : ""}`}>
              {plan.featured && (
                <div className="pricing-badge">{t("pricingSection.mostPopular")}</div>
              )}
              <div className="pricing-plan">{plan.name}</div>
              <div className="pricing-price">
                ${plan.price}
                <span>{t("pricingSection.perMonth")}</span>
              </div>
              <div className="pricing-period">
                {t("pricingSection.sessionsSummary", { perWeek: plan.sessionsPerWeek })}
              </div>
              <ul className="pricing-features">
                {(isArabic ? plan.featuresAr : plan.features).map((feature, idx) => (
                  <li key={idx}>
                    <span className="check-icon">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                className={`pricing-btn ${
                  plan.featured ? "pricing-btn-primary" : "pricing-btn-outline"
                }`}
                onClick={() => navigate("/eval")}
              >
                {t("pricingSection.getStarted")}
              </button>
            </div>
          ))}
        </div>
      </section>

      <section
        className="section bg-forest"
        style={{ background: "linear-gradient(135deg,#1c3a2e,#254d3d)" }}
      >
        <div className="section-header">
          <span className="section-eyebrow" style={{ color: "var(--amber-l)" }}>
            {t("testimonialsSection.eyebrow")}
          </span>
          <h2 className="section-title" style={{ color: "#fff" }}>
            {t("testimonialsSection.title")}
          </h2>
        </div>
        <div className="testimonials-grid">
          {TESTIMONIALS.map((testimonial, i) => (
            <div key={i} className="testimonial-card">
              <div className="testimonial-stars">
                {Array(testimonial.stars)
                  .fill(0)
                  .map((_, j) => (
                    <span key={j} className="t-star">
                      ★
                    </span>
                  ))}
              </div>
              <p className="testimonial-text">"{isArabic ? testimonial.textAr : testimonial.text}"</p>
              <div className="testimonial-author">
                <div className="t-avatar">😊</div>
                <div>
                  <div className="t-name">{isArabic ? testimonial.nameAr : testimonial.name}</div>
                  <div className="t-location">{isArabic ? testimonial.locationAr : testimonial.location}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

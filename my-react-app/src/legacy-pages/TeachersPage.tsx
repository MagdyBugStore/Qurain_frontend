import React from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { TEACHERS, SLOTS, SLOTS_AR, type Teacher } from "../jannat-alquran-data";
import { Stars } from "../components/common/Stars";

interface TeachersPageProps {
  addToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export function TeachersPage({ addToast }: TeachersPageProps) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  const [filter, setFilter] = useState("All");
  const [bookModal, setBookModal] = useState<Teacher | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const filters = ["All", "Tajweed", "Children", "Hifz", "Arabic", "New Muslims"];

  const filtered =
    filter === "All"
      ? TEACHERS
      : TEACHERS.filter((teacher) =>
          teacher.specialty.toLowerCase().includes(filter.toLowerCase())
        );

  return (
    <div className="page section" style={{ paddingTop: 40 }}>
      <div className="section-header" style={{ marginBottom: 32 }}>
        <span className="section-eyebrow">{t("teachersPage.eyebrow")}</span>
        <h2 className="section-title">{t("teachersPage.title")}</h2>
        <p className="section-desc">{t("teachersPage.desc")}</p>
      </div>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div className="filters-bar">
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-l)" }}>
            {t("teachersPage.filterLabel")}
          </span>
          <div className="filter-sep" />
          {filters.map((f) => (
            <button
              key={f}
              className={`filter-chip${filter === f ? " active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f === "All"
                ? t("teachersPage.filters.all")
                : f === "Tajweed"
                ? t("teachersPage.filters.tajweed")
                : f === "Children"
                ? t("teachersPage.filters.children")
                : f === "Hifz"
                ? t("teachersPage.filters.hifz")
                : f === "Arabic"
                ? t("teachersPage.filters.arabic")
                : t("teachersPage.filters.newMuslims")}
            </button>
          ))}
        </div>

        <div className="teachers-grid">
          {filtered.map((teacher) => (
            <div key={teacher.id} className="teacher-card">
              <div className="teacher-avatar">
                {teacher.emoji}
                {teacher.online && <div className="teacher-badge-online" />}
              </div>
              <div className="teacher-name">{isArabic ? teacher.nameAr : teacher.name}</div>
              <div className="teacher-specialty">{isArabic ? teacher.specialtyAr : teacher.specialty}</div>
              <Stars rating={teacher.rating} />
              <div style={{ fontSize: 12, color: "var(--text-l)", marginBottom: 8 }}>
                {t("teachersPage.reviewsCount", { count: teacher.reviews })}
              </div>
              <div
                className="teacher-info mb4"
                style={{ display: "flex", gap: 4, justifyContent: "center", flexWrap: "wrap" }}
              >
                <span className="teacher-price">${teacher.price}/session</span>
                <span>·</span>
                <span>{teacher.exp} yrs</span>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 4,
                  justifyContent: "center",
                  flexWrap: "wrap",
                  marginBottom: 14,
                }}
              >
                {teacher.lang.map((l) => (
                  <span key={l} className="tag tag-forest" style={{ fontSize: 10 }}>
                    {l}
                  </span>
                ))}
                <span
                  className={`tag ${teacher.online ? "tag-green" : "tag-amber"}`}
                  style={{ fontSize: 10 }}
                >
                  {teacher.online ? t("teachersPage.onlineNow") : t("teachersPage.offline")}
                </span>
              </div>
              <button
                className="teacher-btn"
                onClick={() => {
                  setBookModal(teacher);
                  setSelectedSlot(null);
                }}
              >
                {t("teachersPage.bookSession")}
              </button>
            </div>
          ))}
        </div>
      </div>

      {bookModal && (
        <div
          className="modal-overlay"
          onClick={(e) => e.target === e.currentTarget && setBookModal(null)}
        >
          <div className="modal modal-inner">
            <button className="modal-close" onClick={() => setBookModal(null)}>
              ×
            </button>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  background: "linear-gradient(135deg,var(--forest),var(--forest-l))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                }}
              >
                {bookModal.emoji}
              </div>
              <div>
                <div className="modal-title" style={{ marginBottom: 2 }}>
                  {isArabic ? bookModal.nameAr : bookModal.name}
                </div>
                <div className="modal-sub" style={{ marginBottom: 0 }}>
                  {isArabic ? bookModal.specialtyAr : bookModal.specialty} · ${bookModal.price}/session
                </div>
              </div>
            </div>

            <p
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "var(--text-m)",
                marginBottom: 10,
                letterSpacing: 0.3,
              }}
            >
              SELECT AVAILABLE SLOT
            </p>
            <div className="slots-grid">
              {(isArabic ? SLOTS_AR : SLOTS).map((s, i) => (
                <button
                  key={i}
                  className={`slot-btn${selectedSlot === s ? " selected" : ""}${
                    i === 2 ? " taken" : ""
                  }`}
                  onClick={() => i !== 2 && setSelectedSlot(s)}
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="form-group">
              <label className="form-label">{t("teachersPage.modal.sessionDuration")}</label>
              <select className="form-select">
                <option>{t("teachersPage.modal.duration30")}</option>
                <option>{t("teachersPage.modal.duration45")}</option>
                <option>{t("teachersPage.modal.duration60")}</option>
              </select>
            </div>

            <button
              className="form-submit"
              style={{
                background: selectedSlot
                  ? "linear-gradient(135deg,var(--forest),var(--forest-l))"
                  : "var(--border)",
              }}
              onClick={() => {
                if (!selectedSlot) {
                  addToast(t("teachersPage.modal.toastSelectSlot"), "info");
                  return;
                }
                addToast(
                  t("teachersPage.modal.toastBooked", {
                    name: bookModal.name,
                    slot: selectedSlot,
                  }),
                  "success"
                );
                setBookModal(null);
              }}
            >
              {selectedSlot
                ? t("teachersPage.modal.confirm", { slot: selectedSlot })
                : t("teachersPage.modal.selectToContinue")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

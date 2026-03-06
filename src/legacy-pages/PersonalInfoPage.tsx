import React from "react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { PROGRAMS } from "../jannat-alquran-data";

interface PersonalInfoPageProps {
  addToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

interface UserProfileForm {
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  country: string;
  timezone: string;
  program: string;
  level: string;
  goals: string;
  notes: string;
}

export function PersonalInfoPage({ addToast }: PersonalInfoPageProps) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  const navigate = useNavigate();
  const { user, userProfile, saveUserProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState<UserProfileForm>({
    firstName: "",
    lastName: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    country: "",
    timezone: "",
    program: "",
    level: "",
    goals: "",
    notes: "",
  });

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    // Load existing profile if available
    if (userProfile) {
      setForm(userProfile as UserProfileForm);
      // If profile is complete, redirect to profile page
      if (userProfile.firstName && userProfile.lastName && userProfile.phone) {
        if (user?.uid) {
          navigate(`/profile/${user.uid}`);
        } else {
          navigate("/profile");
        }
      }
    } else {
      // Pre-fill from auth user
      if (user.displayName) {
        const nameParts = user.displayName.split(" ");
        setForm((prev) => ({
          ...prev,
          firstName: nameParts[0] || "",
          lastName: nameParts.slice(1).join(" ") || "",
        }));
      }
      if (user.email) {
        // Email is already available from auth
      }
    }
  }, [user, userProfile, navigate]);

  const update = (key: keyof UserProfileForm, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!form.firstName || !form.lastName || !form.phone) {
        addToast(t("personalInfoPage.toastRequired"), "info");
        return;
      }
    } else if (currentStep === 2) {
      if (!form.dateOfBirth || !form.gender || !form.country) {
        addToast(t("personalInfoPage.toastRequired"), "info");
        return;
      }
    } else if (currentStep === 3) {
      if (!form.program || !form.level) {
        addToast(t("personalInfoPage.toastRequired"), "info");
        return;
      }
    }
    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = () => {
    if (!form.goals) {
      addToast(t("personalInfoPage.toastRequired"), "info");
      return;
    }

    saveUserProfile(form);
    addToast(t("personalInfoPage.toastSubmitted"), "success");
    setTimeout(() => {
      if (user?.uid) {
        navigate(`/profile/${user.uid}`);
      } else {
        navigate("/profile");
      }
    }, 1000);
  };

  const steps = [
    { number: 1, title: t("personalInfoPage.step1Title"), desc: t("personalInfoPage.step1Desc") },
    { number: 2, title: t("personalInfoPage.step2Title"), desc: t("personalInfoPage.step2Desc") },
    { number: 3, title: t("personalInfoPage.step3Title"), desc: t("personalInfoPage.step3Desc") },
    { number: 4, title: t("personalInfoPage.step4Title"), desc: t("personalInfoPage.step4Desc") },
  ];

  return (
    <div className="page eval-section">
      <div className="eval-container">
        <div className="section-header mb32">
          <span className="section-eyebrow">{t("personalInfoPage.eyebrow")}</span>
          <h2 className="section-title">{t("personalInfoPage.title")}</h2>
          <p className="section-desc">{t("personalInfoPage.desc")}</p>
        </div>

        {/* Progress Steps */}
        <div style={{ marginBottom: 32, display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
          {steps.map((step) => (
            <div
              key={step.number}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                minWidth: 100,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  backgroundColor: currentStep >= step.number ? "var(--forest)" : "var(--text-l)",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                  fontSize: 16,
                }}
              >
                {currentStep > step.number ? "✓" : step.number}
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 12, fontWeight: "bold", color: "var(--forest)" }}>
                  {step.title}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-m)", marginTop: 4 }}>
                  {step.desc}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="eval-card">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <>
              <h3 className="eval-card-title">{t("personalInfoPage.step1Title")}</h3>
              <p className="eval-card-sub">{t("personalInfoPage.step1Desc")}</p>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">{t("personalInfoPage.firstName")} *</label>
                  <input
                    className="form-input"
                    placeholder={t("personalInfoPage.firstNamePlaceholder")}
                    value={form.firstName}
                    onChange={(e) => update("firstName", e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">{t("personalInfoPage.lastName")} *</label>
                  <input
                    className="form-input"
                    placeholder={t("personalInfoPage.lastNamePlaceholder")}
                    value={form.lastName}
                    onChange={(e) => update("lastName", e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{t("personalInfoPage.phone")} *</label>
                <input
                  className="form-input"
                  type="tel"
                  placeholder={t("personalInfoPage.phonePlaceholder")}
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                />
              </div>

              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 24 }}>
                <button className="form-submit" onClick={handleNext}>
                  {t("personalInfoPage.next")}
                </button>
              </div>
            </>
          )}

          {/* Step 2: Personal Details */}
          {currentStep === 2 && (
            <>
              <h3 className="eval-card-title">{t("personalInfoPage.step2Title")}</h3>
              <p className="eval-card-sub">{t("personalInfoPage.step2Desc")}</p>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">{t("personalInfoPage.dateOfBirth")} *</label>
                  <input
                    className="form-input"
                    type="date"
                    value={form.dateOfBirth}
                    onChange={(e) => update("dateOfBirth", e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">{t("personalInfoPage.gender")} *</label>
                  <select
                    className="form-select"
                    value={form.gender}
                    onChange={(e) => update("gender", e.target.value)}
                  >
                    <option value="">{t("personalInfoPage.genderPlaceholder")}</option>
                    <option value="male">{t("personalInfoPage.genderMale")}</option>
                    <option value="female">{t("personalInfoPage.genderFemale")}</option>
                    <option value="prefer-not-to-say">{t("personalInfoPage.genderOther")}</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">{t("personalInfoPage.country")} *</label>
                  <input
                    className="form-input"
                    placeholder={t("personalInfoPage.countryPlaceholder")}
                    value={form.country}
                    onChange={(e) => update("country", e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">{t("personalInfoPage.timezone")}</label>
                  <select
                    className="form-select"
                    value={form.timezone}
                    onChange={(e) => update("timezone", e.target.value)}
                  >
                    <option value="">{t("personalInfoPage.timezonePlaceholder")}</option>
                    <option>GMT (London)</option>
                    <option>GMT+2 (Cairo)</option>
                    <option>GMT+3 (Riyadh)</option>
                    <option>EST (New York)</option>
                    <option>PST (Los Angeles)</option>
                    <option>CST (Toronto)</option>
                    <option>GST (Dubai)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", gap: 12, justifyContent: "space-between", marginTop: 24 }}>
                <button
                  className="form-submit"
                  onClick={handleBack}
                  style={{ backgroundColor: "var(--text-l)" }}
                >
                  {t("personalInfoPage.back")}
                </button>
                <button className="form-submit" onClick={handleNext}>
                  {t("personalInfoPage.next")}
                </button>
              </div>
            </>
          )}

          {/* Step 3: Learning Preferences */}
          {currentStep === 3 && (
            <>
              <h3 className="eval-card-title">{t("personalInfoPage.step3Title")}</h3>
              <p className="eval-card-sub">{t("personalInfoPage.step3Desc")}</p>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">{t("personalInfoPage.program")} *</label>
                  <select
                    className="form-select"
                    value={form.program}
                    onChange={(e) => update("program", e.target.value)}
                  >
                    <option value="">{t("personalInfoPage.programPlaceholder")}</option>
                    {PROGRAMS.map((p) => (
                      <option key={p.id} value={isArabic ? p.nameAr : p.nameEn}>
                        {isArabic ? p.nameAr : p.nameEn}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">{t("personalInfoPage.level")} *</label>
                  <select
                    className="form-select"
                    value={form.level}
                    onChange={(e) => update("level", e.target.value)}
                  >
                    <option value="">{t("personalInfoPage.levelPlaceholder")}</option>
                    <option>{t("personalInfoPage.levelOptions.beginner0")}</option>
                    <option>{t("personalInfoPage.levelOptions.beginner")}</option>
                    <option>{t("personalInfoPage.levelOptions.intermediate")}</option>
                    <option>{t("personalInfoPage.levelOptions.advanced")}</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", gap: 12, justifyContent: "space-between", marginTop: 24 }}>
                <button
                  className="form-submit"
                  onClick={handleBack}
                  style={{ backgroundColor: "var(--text-l)" }}
                >
                  {t("personalInfoPage.back")}
                </button>
                <button className="form-submit" onClick={handleNext}>
                  {t("personalInfoPage.next")}
                </button>
              </div>
            </>
          )}

          {/* Step 4: Goals and Notes */}
          {currentStep === 4 && (
            <>
              <h3 className="eval-card-title">{t("personalInfoPage.step4Title")}</h3>
              <p className="eval-card-sub">{t("personalInfoPage.step4Desc")}</p>

              <div className="form-group">
                <label className="form-label">{t("personalInfoPage.goals")} *</label>
                <textarea
                  className="form-textarea"
                  placeholder={t("personalInfoPage.goalsPlaceholder")}
                  value={form.goals}
                  onChange={(e) => update("goals", e.target.value)}
                  rows={4}
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t("personalInfoPage.notes")}</label>
                <textarea
                  className="form-textarea"
                  placeholder={t("personalInfoPage.notesPlaceholder")}
                  value={form.notes}
                  onChange={(e) => update("notes", e.target.value)}
                  rows={4}
                />
              </div>

              <div style={{ display: "flex", gap: 12, justifyContent: "space-between", marginTop: 24 }}>
                <button
                  className="form-submit"
                  onClick={handleBack}
                  style={{ backgroundColor: "var(--text-l)" }}
                >
                  {t("personalInfoPage.back")}
                </button>
                <button className="form-submit" onClick={handleSubmit}>
                  {t("personalInfoPage.submit")}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

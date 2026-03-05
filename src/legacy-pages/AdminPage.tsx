import { useState } from "react";
import { useTranslation } from "react-i18next";
import { PROGRAMS, SESSIONS } from "../jannat-alquran-data";
import { StatusBadge } from "../components/common/StatusBadge";
import { ProgressBar } from "../components/common/ProgressBar";

interface AdminPageProps {
  addToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export function AdminPage({ addToast }: AdminPageProps) {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  const [tab, setTab] = useState("overview");

  const navItems = [
    { id: "overview", icon: "📊", label: "Overview" },
    { id: "users", icon: "👥", label: "Users" },
    { id: "teachers-pending", icon: "⏳", label: "Pending Teachers" },
    { id: "sessions", icon: "📅", label: "All Sessions" },
    { id: "payments", icon: "💰", label: "Payments" },
    { id: "reports", icon: "📈", label: "Reports" },
  ];

  const pendingTeachers = [
    {
      name: "Ustadh Bilal Rahman",
      email: "bilal@example.com",
      specialty: "Quran & Tajweed",
      applied: "19 Feb 2026",
    },
    {
      name: "Ustadha Nadia Khalil",
      email: "nadia@example.com",
      specialty: "Arabic Language",
      applied: "17 Feb 2026",
    },
    {
      name: "Sheikh Hassan Al-Sayed",
      email: "hassan@example.com",
      specialty: "Hifz Program",
      applied: "15 Feb 2026",
    },
  ];

  return (
    <div className="page">
      <div className="dash-layout">
        <aside className="dash-sidebar">
          <div className="dash-user-info">
            <div className="dash-avatar">🛡️</div>
            <div className="dash-user-name">Admin Panel</div>
            <div className="dash-user-role">Administrator</div>
          </div>
          <div className="dash-nav-group">
            {navItems.map((n) => (
              <div
                key={n.id}
                className={`dash-nav-item${tab === n.id ? " active" : ""}`}
                onClick={() => setTab(n.id)}
              >
                <span className="dash-nav-icon">{n.icon}</span>
                {n.label}
              </div>
            ))}
          </div>
        </aside>

        <main className="dash-content">
          {tab === "overview" && <AdminOverview isArabic={isArabic} />}
          {tab === "teachers-pending" && (
            <PendingTeachersTab pendingTeachers={pendingTeachers} addToast={addToast} />
          )}
          {tab === "sessions" && <AdminSessionsTab isArabic={isArabic} />}
          {tab === "payments" && <PaymentsTab />}
          {tab === "users" && <UsersTab addToast={addToast} />}
          {tab === "reports" && <ReportsTab />}
        </main>
      </div>
    </div>
  );
}

interface AdminOverviewProps {
  isArabic: boolean;
}

function AdminOverview({ isArabic }: AdminOverviewProps) {
  const stats = [
    { icon: "👥", v: 512, l: "Total Students", c: "+18 this month" },
    { icon: "👳", v: 52, l: "Active Teachers", c: "+3 this month" },
    { icon: "📅", v: 1840, l: "Sessions Conducted", c: "+124 this month" },
    { icon: "💰", v: "$12,450", l: "Monthly Revenue", c: "+8.5% vs last month" },
  ];

  const sessionStatus = [
    ["Completed", "1,420", "tag-green"],
    ["Scheduled", "380", "tag-forest"],
    ["Cancelled", "28", ""],
    ["No Show", "12", "tag-amber"],
  ];

  return (
    <div>
      <div className="dash-welcome mb24">
        <h2 className="dash-welcome-title">Admin Overview</h2>
        <p className="dash-welcome-sub">Platform statistics as of 22 Feb 2026</p>
      </div>
      <div className="kpi-grid">
        {stats.map((k) => (
          <div key={k.l} className="kpi-card">
            <div className="kpi-icon">{k.icon}</div>
            <div className="kpi-value">{k.v}</div>
            <div className="kpi-label">{k.l}</div>
            <div className="kpi-change kpi-up">{k.c}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 20 }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Session Status</h3>
          </div>
          {sessionStatus.map(([label, value, tag]) => (
            <div
              key={label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 0",
                borderBottom: "1px solid var(--border-l)",
              }}
            >
              <span style={{ fontSize: 14, color: "var(--text-m)" }}>{label}</span>
              <span className={`tag ${tag}`}>{value}</span>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Program Enrollments</h3>
          </div>
          {PROGRAMS.map((p) => (
            <div key={p.id} style={{ marginBottom: 12 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 13,
                  marginBottom: 4,
                }}
              >
                <span style={{ color: "var(--text-m)" }}>{isArabic ? p.nameAr : p.nameEn}</span>
                <span style={{ fontWeight: 600, color: "var(--forest)" }}>
                  {Math.floor(Math.random() * 100 + 50)}
                </span>
              </div>
              <ProgressBar pct={Math.floor(Math.random() * 60 + 30)} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface PendingTeacher {
  name: string;
  email: string;
  specialty: string;
  applied: string;
}

interface PendingTeachersTabProps {
  pendingTeachers: PendingTeacher[];
  addToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

function PendingTeachersTab({ pendingTeachers, addToast }: PendingTeachersTabProps) {
  return (
    <div>
      <div className="dash-welcome mb24">
        <h2 className="dash-welcome-title">Pending Teacher Approvals</h2>
        <p className="dash-welcome-sub">{pendingTeachers.length} teachers awaiting approval</p>
      </div>
      {pendingTeachers.map((t) => (
        <div key={t.email} className="card mb16">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: "linear-gradient(135deg,var(--forest),var(--forest-l))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
              }}
            >
              👳
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 16,
                  color: "var(--forest)",
                }}
              >
                {t.name}
              </div>
              <div style={{ fontSize: 13, color: "var(--text-m)" }}>
                {t.email} · {t.specialty}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-l)" }}>Applied: {t.applied}</div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                className="form-submit"
                style={{ width: "auto", padding: "9px 20px", fontSize: 14 }}
                onClick={() => addToast(`${t.name} approved!`, "success")}
              >
                ✓ Approve
              </button>
              <button
                className="card-action"
                onClick={() => addToast(`${t.name} rejected.`, "info")}
              >
                ✗ Reject
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

interface AdminSessionsTabProps {
  isArabic: boolean;
}

function AdminSessionsTab({ isArabic }: AdminSessionsTabProps) {
  return (
    <div>
      <div className="dash-welcome mb24">
        <h2 className="dash-welcome-title">All Sessions</h2>
      </div>
      <div className="card">
        <table className="sessions-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Teacher</th>
              <th>Program</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {SESSIONS.map((s) => (
              <tr key={s.id}>
                <td style={{ fontWeight: 600 }}>Ahmed Al-Rashid</td>
                <td>{isArabic ? s.teacherAr : s.teacher}</td>
                <td>{isArabic ? s.programAr : s.program}</td>
                <td>{s.date}</td>
                <td>
                  <StatusBadge status={isArabic ? s.statusAr : s.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PaymentsTab() {
  const rows = [
    ["Ahmed Al-Rashid", "Monthly Subscription", "$75.00", "1 Feb 2026", "succeeded"],
    ["Sara Mahmoud", "Monthly Subscription", "$49.00", "1 Feb 2026", "succeeded"],
    ["Omar Abdullah", "Pay per Session", "$22.00", "3 Feb 2026", "succeeded"],
    ["Khalid Hassan", "Monthly Subscription", "$119.00", "1 Feb 2026", "succeeded"],
    ["Fatima Ali", "Monthly Subscription", "$75.00", "2 Feb 2026", "failed"],
  ];

  return (
    <div>
      <div className="dash-welcome mb24">
        <h2 className="dash-welcome-title">Payments</h2>
        <p className="dash-welcome-sub">Total revenue: $12,450 this month</p>
      </div>
      <div className="card">
        <table className="sessions-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([name, type, amount, date, status]) => (
              <tr key={name + date}>
                <td style={{ fontWeight: 600 }}>{name}</td>
                <td>{type}</td>
                <td style={{ fontWeight: 700, color: "var(--forest)" }}>{amount}</td>
                <td>{date}</td>
                <td>
                  <span className={`tag ${status === "succeeded" ? "tag-green" : "tag-amber"}`}>
                    {status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface UsersTabProps {
  addToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

function UsersTab({ addToast }: UsersTabProps) {
  const rows = [
    ["Ahmed Al-Rashid", "student", "ahmed@ex.com", "active"],
    ["Sheikh Ahmad", "teacher", "ahmad@ex.com", "active"],
    ["Sara Mahmoud", "student", "sara@ex.com", "active"],
    ["Omar Test", "student", "omar@ex.com", "suspended"],
  ];

  return (
    <div>
      <div className="dash-welcome mb24">
        <h2 className="dash-welcome-title">User Management</h2>
      </div>
      <div className="card">
        <table className="sessions-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Email</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([name, role, email, status]) => (
              <tr key={email}>
                <td style={{ fontWeight: 600 }}>{name}</td>
                <td>
                  <span className={`tag ${role === "teacher" ? "tag-amber" : "tag-forest"}`}>
                    {role}
                  </span>
                </td>
                <td style={{ color: "var(--text-l)" }}>{email}</td>
                <td>
                  <span className={`tag ${status === "active" ? "tag-green" : "tag-amber"}`}>
                    {status}
                  </span>
                </td>
                <td>
                  <button
                    className="card-action"
                    style={{ fontSize: 12, padding: "4px 10px" }}
                    onClick={() => addToast("User action performed.", "info")}
                  >
                    {status === "active" ? "Suspend" : "Reactivate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ReportsTab() {
  const cards = [
    ["📊", "$12,450", "Monthly Revenue", "Feb 2026"],
    ["📅", 184, "Sessions This Month", "24 completed today"],
    ["🎯", "91%", "Attendance Rate", "Above target (85%)"],
    ["⭐", "4.87", "Avg Teacher Rating", "Based on 124 reviews"],
  ];

  return (
    <div>
      <div className="dash-welcome mb24">
        <h2 className="dash-welcome-title">Reports</h2>
      </div>
      <div className="kpi-grid" style={{ gridTemplateColumns: "repeat(2,1fr)" }}>
        {cards.map(([icon, value, label, caption]) => (
          <div key={label.toString()} className="kpi-card">
            <div className="kpi-icon">{icon}</div>
            <div className="kpi-value">{value}</div>
            <div className="kpi-label">{label}</div>
            <div
              style={{
                fontSize: 12,
                color: "var(--text-l)",
                marginTop: 4,
              }}
            >
              {caption}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

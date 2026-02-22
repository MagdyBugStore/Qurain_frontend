import { useState } from "react";
import { TEACHERS, SESSIONS, NOTIFICATIONS, PROGRAMS } from "../jannat-alquran-data";
import { Stars } from "../components/common/Stars";
import { StatusBadge } from "../components/common/StatusBadge";
import { ProgressBar } from "../components/common/ProgressBar";

export function DashboardPage({ addToast }) {
  const [activeTab, setActiveTab] = useState("overview");

  const navItems = [
    { id: "overview", icon: "🏠", label: "Overview" },
    { id: "sessions", icon: "📅", label: "My Sessions" },
    { id: "teachers", icon: "👳", label: "My Teachers" },
    { id: "progress", icon: "📈", label: "Progress" },
    { id: "subscription", icon: "💳", label: "Subscription" },
    { id: "notifications", icon: "🔔", label: "Notifications", badge: 2 },
    { id: "settings", icon: "⚙️", label: "Settings" },
  ];

  return (
    <div className="page">
      <div className="dash-layout">
        <aside className="dash-sidebar">
          <div className="dash-user-info">
            <div className="dash-avatar">😊</div>
            <div className="dash-user-name">Ahmed Al-Rashid</div>
            <div className="dash-user-role">Student</div>
          </div>
          <div className="dash-nav-group">
            <div className="dash-nav-label">Navigation</div>
            {navItems.map((n) => (
              <div
                key={n.id}
                className={`dash-nav-item${activeTab === n.id ? " active" : ""}`}
                onClick={() => setActiveTab(n.id)}
              >
                <span className="dash-nav-icon">{n.icon}</span>
                <span style={{ flex: 1 }}>{n.label}</span>
                {n.badge && (
                  <span
                    style={{
                      background: "var(--amber)",
                      color: "#fff",
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "2px 7px",
                      borderRadius: 40,
                    }}
                  >
                    {n.badge}
                  </span>
                )}
              </div>
            ))}
          </div>
        </aside>

        <main className="dash-content">
          {activeTab === "overview" && <OverviewTab addToast={addToast} />}
          {activeTab === "sessions" && <SessionsTab addToast={addToast} />}
          {activeTab === "teachers" && <TeachersTabDash />}
          {activeTab === "progress" && <ProgressTab />}
          {activeTab === "subscription" && <SubscriptionTab addToast={addToast} />}
          {activeTab === "notifications" && <NotificationsTab />}
          {activeTab === "settings" && <SettingsTab addToast={addToast} />}
        </main>
      </div>
    </div>
  );
}

function OverviewTab({ addToast }) {
  return (
    <div>
      <div className="dash-welcome">
        <h2 className="dash-welcome-title">Welcome back, Ahmed 👋</h2>
        <p className="dash-welcome-sub">
          Sunday, 22 February 2026 — You have 1 session today
        </p>
      </div>

      <div className="next-session">
        <div className="next-session-icon">📖</div>
        <div className="next-session-info">
          <div className="next-session-label">Next Session</div>
          <div className="next-session-title">Tajweed & Hifz with Sheikh Ahmad</div>
          <div className="next-session-time">
            Mon, 24 Feb 2026 · 10:00 AM · 45 minutes · via Zoom
          </div>
        </div>
        <div className="next-session-actions">
          <button className="btn-join" onClick={() => addToast("Connecting to Zoom...", "success")}>
            Join Now
          </button>
          <button
            className="btn-reschedule"
            onClick={() => addToast("Reschedule request sent!", "info")}
          >
            Reschedule
          </button>
        </div>
      </div>

      <div className="kpi-grid">
        {[
          { icon: "📚", value: 24, label: "Sessions Completed", change: "+3 this month", up: true },
          { icon: "🔥", value: "14", label: "Day Streak", change: "Personal best!", up: true },
          {
            icon: "📖",
            value: "3.5",
            label: "Juz' Memorised",
            change: "+0.5 this week",
            up: true,
          },
          {
            icon: "⭐",
            value: "4.9",
            label: "Teacher Rating",
            change: "Based on 24 sessions",
            up: null,
          },
        ].map((k) => (
          <div key={k.label} className="kpi-card">
            <div className="kpi-icon">{k.icon}</div>
            <div className="kpi-value">{k.value}</div>
            <div className="kpi-label">{k.label}</div>
            <div
              className={`kpi-change ${
                k.up === true ? "kpi-up" : k.up === false ? "kpi-down" : ""
              }`}
            >
              {k.change}
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Recent Sessions</h3>
          <button className="card-action">View All</button>
        </div>
        <table className="sessions-table">
          <thead>
            <tr>
              <th>Teacher</th>
              <th>Program</th>
              <th>Date & Time</th>
              <th>Duration</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {SESSIONS.slice(0, 4).map((s) => (
              <tr key={s.id}>
                <td style={{ fontWeight: 600, color: "var(--forest)" }}>{s.teacher}</td>
                <td>{s.program}</td>
                <td>
                  {s.date} · {s.time}
                </td>
                <td>{s.duration}</td>
                <td>
                  <StatusBadge status={s.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SessionsTab({ addToast }) {
  return (
    <div>
      <div className="dash-welcome mb24">
        <h2 className="dash-welcome-title">My Sessions</h2>
        <p className="dash-welcome-sub">View, manage and reschedule your learning sessions.</p>
      </div>
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">All Sessions</h3>
          <button
            className="card-action"
            onClick={() => addToast("Opening booking flow...", "info")}
          >
            + Book New Session
          </button>
        </div>
        <table className="sessions-table">
          <thead>
            <tr>
              <th>Teacher</th>
              <th>Program</th>
              <th>Date & Time</th>
              <th>Duration</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {SESSIONS.map((s) => (
              <tr key={s.id}>
                <td style={{ fontWeight: 600, color: "var(--forest)" }}>{s.teacher}</td>
                <td>{s.program}</td>
                <td>
                  {s.date} · {s.time}
                </td>
                <td>{s.duration}</td>
                <td>
                  <StatusBadge status={s.status} />
                </td>
                <td>
                  {s.status === "scheduled" && (
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        className="card-action"
                        style={{ padding: "4px 10px", fontSize: 12 }}
                        onClick={() => addToast("Joining Zoom...", "success")}
                      >
                        Join
                      </button>
                      <button
                        className="card-action"
                        style={{ padding: "4px 10px", fontSize: 12 }}
                        onClick={() => addToast("Reschedule request sent!", "info")}
                      >
                        Reschedule
                      </button>
                    </div>
                  )}
                  {s.status === "completed" && (
                    <button
                      className="card-action"
                      style={{ padding: "4px 10px", fontSize: 12 }}
                      onClick={() => addToast("Opening review form...", "info")}
                    >
                      Rate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TeachersTabDash() {
  return (
    <div>
      <div className="dash-welcome mb24">
        <h2 className="dash-welcome-title">My Teachers</h2>
        <p className="dash-welcome-sub">Your assigned teachers and their details.</p>
      </div>
      <div className="teachers-grid">
        {TEACHERS.slice(0, 3).map((t) => (
          <div key={t.id} className="teacher-card">
            <div className="teacher-avatar">
              {t.emoji}
              {t.online && <div className="teacher-badge-online" />}
            </div>
            <div className="teacher-name">{t.name}</div>
            <div className="teacher-specialty">{t.specialty}</div>
            <Stars rating={t.rating} />
            <div style={{ fontSize: 12, color: "var(--text-l)", marginBottom: 8 }}>
              {t.reviews} reviews
            </div>
            <div style={{ display: "flex", gap: 4, justifyContent: "center", marginBottom: 12 }}>
              <span
                className={`tag ${t.online ? "tag-green" : "tag-amber"}`}
                style={{ fontSize: 10 }}
              >
                {t.online ? "Active Now" : "Offline"}
              </span>
            </div>
            <button className="teacher-btn">Message</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProgressTab() {
  const topics = [
    { label: "Surah Al-Baqarah", pct: 65, note: "65 of 286 verses memorised" },
    { label: "Tajweed Rules", pct: 80, note: "16 of 20 rules completed" },
    { label: "Arabic Vocabulary", pct: 45, note: "225 of 500 words learnt" },
    { label: "Recitation Accuracy", pct: 92, note: "Excellent — 92% accuracy score" },
  ];

  return (
    <div>
      <div className="dash-welcome mb24">
        <h2 className="dash-welcome-title">My Progress</h2>
        <p className="dash-welcome-sub">Track your learning journey and achievements.</p>
      </div>
      <div className="card mb24">
        <div className="card-header">
          <h3 className="card-title">Overall Progress</h3>
        </div>
        {topics.map((t) => (
          <div key={t.label} className="mb16">
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "var(--forest)",
                }}
              >
                {t.label}
              </span>
              <span style={{ fontSize: 13, color: "var(--text-l)" }}>{t.pct}%</span>
            </div>
            <ProgressBar pct={t.pct} />
            <div style={{ fontSize: 12, color: "var(--text-l)", marginTop: 4 }}>{t.note}</div>
          </div>
        ))}
      </div>
      <div className="kpi-grid">
        {[
          { icon: "🏆", value: "6", label: "Certificates Earned" },
          { icon: "📅", value: "3", label: "Months Active" },
          { icon: "⏱️", value: "18h", label: "Total Study Time" },
          { icon: "🎯", value: "92%", label: "Attendance Rate" },
        ].map((k) => (
          <div key={k.label} className="kpi-card">
            <div className="kpi-icon">{k.icon}</div>
            <div className="kpi-value">{k.value}</div>
            <div className="kpi-label">{k.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SubscriptionTab({ addToast }) {
  return (
    <div>
      <div className="dash-welcome mb24">
        <h2 className="dash-welcome-title">Subscription & Billing</h2>
        <p className="dash-welcome-sub">Manage your plan and payment details.</p>
      </div>

      <div className="card mb20">
        <div className="card-header">
          <h3 className="card-title">Current Plan</h3>
          <span className="tag tag-green" style={{ padding: "6px 14px", fontSize: 12 }}>
            Active
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8, marginBottom: 8 }}>
          <span
            style={{
              fontFamily: "'Playfair Display',serif",
              fontSize: 40,
              fontWeight: 700,
              color: "var(--forest)",
            }}
          >
            $75
          </span>
          <span style={{ fontSize: 16, color: "var(--text-l)", marginBottom: 8 }}>/month</span>
        </div>
        <div style={{ fontSize: 14, color: "var(--text-m)", marginBottom: 20 }}>
          <strong>Standard Plan</strong> · 3 sessions/week · 12 sessions/month
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            className="card-action"
            onClick={() => addToast("Upgrade flow opening...", "info")}
          >
            Upgrade Plan
          </button>
          <button
            className="card-action"
            onClick={() => addToast("Cancellation policy shown.", "info")}
          >
            Cancel Subscription
          </button>
        </div>
      </div>

      <div className="card mb20">
        <div className="card-header">
          <h3 className="card-title">Sessions Balance</h3>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          {[
            ["8", "Sessions Used"],
            ["4", "Remaining"],
            ["12", "Total This Month"],
          ].map(([v, l]) => (
            <div key={l} className="kpi-card text-center">
              <div className="kpi-value">{v}</div>
              <div className="kpi-label">{l}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Payment History</h3>
        </div>
        <table className="sessions-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["1 Feb 2026", "Standard Plan – February", "$75.00", "succeeded"],
              ["1 Jan 2026", "Standard Plan – January", "$75.00", "succeeded"],
              ["1 Dec 2025", "Standard Plan – December", "$75.00", "succeeded"],
            ].map(([d, desc, amt, st]) => (
              <tr key={d}>
                <td>{d}</td>
                <td>{desc}</td>
                <td style={{ fontWeight: 600, color: "var(--forest)" }}>{amt}</td>
                <td>
                  <span className="tag tag-green">✓ {st}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function NotificationsTab() {
  const [notifs, setNotifs] = useState(NOTIFICATIONS);
  const markRead = (id) => {
    setNotifs((ns) => ns.map((n) => (n.id === id ? { ...n, unread: false } : n)));
  };

  return (
    <div>
      <div className="dash-welcome mb24">
        <h2 className="dash-welcome-title">Notifications</h2>
        <p className="dash-welcome-sub">{notifs.filter((n) => n.unread).length} unread notifications</p>
      </div>
      <div className="notif-list">
        {notifs.map((n) => (
          <div
            key={n.id}
            className={`notif-item${n.unread ? " unread" : ""}`}
            onClick={() => markRead(n.id)}
          >
            <div className={`notif-icon ${n.type}`}>{n.icon}</div>
            <div style={{ flex: 1 }}>
              <div className="notif-title">
                {n.title}{" "}
                {n.unread && (
                  <span className="tag tag-amber" style={{ fontSize: 10, marginLeft: 6 }}>
                    New
                  </span>
                )}
              </div>
              <div className="notif-body">{n.body}</div>
              <div className="notif-time">{n.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsTab({ addToast }) {
  const [form, setForm] = useState({
    name: "Ahmed Al-Rashid",
    email: "ahmed@example.com",
    phone: "+44 7123 456789",
    lang: "English",
    tz: "GMT (London)",
  });

  const update = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  return (
    <div>
      <div className="dash-welcome mb24">
        <h2 className="dash-welcome-title">Account Settings</h2>
        <p className="dash-welcome-sub">Update your profile and preferences.</p>
      </div>
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Personal Information</h3>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              className="form-input"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              className="form-input"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              className="form-input"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Preferred Language</label>
            <select
              className="form-select"
              value={form.lang}
              onChange={(e) => update("lang", e.target.value)}
            >
              <option>English</option>
              <option>Arabic</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Timezone</label>
          <select
            className="form-select"
            value={form.tz}
            onChange={(e) => update("tz", e.target.value)}
          >
            <option>GMT (London)</option>
            <option>GMT+2 (Cairo)</option>
            <option>GMT+3 (Riyadh)</option>
            <option>EST (New York)</option>
            <option>GST (Dubai)</option>
          </select>
        </div>
        <button
          className="form-submit"
          style={{ width: "auto", padding: "12px 28px", marginTop: 4 }}
          onClick={() => addToast("Profile updated successfully!", "success")}
        >
          Save Changes
        </button>
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-header">
          <h3 className="card-title">Change Password</h3>
        </div>
        <div className="form-group">
          <label className="form-label">Current Password</label>
          <input className="form-input" type="password" placeholder="••••••••" />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">New Password</label>
            <input className="form-input" type="password" placeholder="••••••••" />
          </div>
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input className="form-input" type="password" placeholder="••••••••" />
          </div>
        </div>
        <button
          className="form-submit"
          style={{ width: "auto", padding: "12px 28px", marginTop: 4 }}
          onClick={() => addToast("Password changed successfully!", "success")}
        >
          Update Password
        </button>
      </div>
    </div>
  );
}


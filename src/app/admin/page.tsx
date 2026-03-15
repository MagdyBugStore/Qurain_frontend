'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { StatusBadge } from '../../components/common/StatusBadge'
import { AdminService } from '../../services/adminService'
import { TEACHER_APPLICATION_STATUS } from '../../constants/status'
import { StudentService } from '../../services/studentService'
import { SubscriptionService, StudentSubscription } from '../../services/subscriptionService'
import type { StudentSession } from '../../shared/types/student.types'

interface TeacherApplication {
  id: string
  fullName?: string
  email?: string
  phone?: string
  subjects?: string[]
  status?: 'pending' | 'approved' | 'rejected'
  userId?: string
  createdAt?: any
  isIncomplete?: boolean
}

interface AdminDashboardProps {
  addToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export default function AdminDashboard({ addToast }: AdminDashboardProps) {
  const { userProfile, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("overview")
  const [applications, setApplications] = useState<TeacherApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [teacherFilter, setTeacherFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')
  
  // Sessions state
  const [sessions, setSessions] = useState<StudentSession[]>([])
  const [sessionsLoading, setSessionsLoading] = useState(false)
  const [sessionFilter, setSessionFilter] = useState<'all' | 'scheduled' | 'completed' | 'cancelled'>('all')
  
  // Subscriptions state
  const [subscriptions, setSubscriptions] = useState<StudentSubscription[]>([])
  const [subscriptionsLoading, setSubscriptionsLoading] = useState(false)
  const [subscriptionFilter, setSubscriptionFilter] = useState<'all' | 'active' | 'pending' | 'cancelled'>('all')

  // Check admin role
  useEffect(() => {
    if (!authLoading) {
      if (!userProfile || userProfile.accountType !== 'admin') {
        // Uncomment the line below to enforce admin check
        // navigate('/')
        // For testing purposes, we might want to allow access or log a warning
        console.warn('Accessing admin dashboard without admin role (for development/testing)')
      }
    }
  }, [userProfile, authLoading, navigate])

  // Fetch applications based on filter
  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true)
      try {
        const adminService = new AdminService()
        
        const filteredApps = await adminService.getTeacherApplications({
          status: teacherFilter,
          includeIncomplete: teacherFilter === 'all' || teacherFilter === 'pending',
        })
        
        setApplications(filteredApps)
      } catch (error) {
        console.error('Error fetching applications:', error)
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading && (activeTab === 'teachers' || activeTab === 'overview')) {
      fetchApplications()
    }
  }, [authLoading, teacherFilter, activeTab])

  // Fetch sessions
  useEffect(() => {
    const fetchSessions = async () => {
      if (activeTab !== 'sessions') return
      
      setSessionsLoading(true)
      try {
        const studentService = new StudentService()
        const filters = sessionFilter !== 'all' ? { status: sessionFilter } : undefined
        const allSessions = await studentService.getAllSessions(filters)
        setSessions(allSessions)
      } catch (error) {
        console.error('Error fetching sessions:', error)
        if (addToast) {
          addToast('Error fetching sessions', 'error')
        }
      } finally {
        setSessionsLoading(false)
      }
    }

    if (!authLoading && activeTab === 'sessions') {
      fetchSessions()
    }
  }, [authLoading, activeTab, sessionFilter])

  // Fetch subscriptions
  const fetchSubscriptions = useCallback(async () => {
    if (activeTab !== 'subscriptions') return
    
    setSubscriptionsLoading(true)
    try {
      const subscriptionService = new SubscriptionService()
      const filters = subscriptionFilter !== 'all' ? { status: subscriptionFilter } : undefined
      const allSubscriptions = await subscriptionService.getAllSubscriptions(filters)
      setSubscriptions(allSubscriptions)
    } catch (error) {
      console.error('Error fetching subscriptions:', error)
      if (addToast) {
        addToast('Error fetching subscriptions', 'error')
      }
    } finally {
      setSubscriptionsLoading(false)
    }
  }, [activeTab, subscriptionFilter, addToast])

  useEffect(() => {
    if (!authLoading && activeTab === 'subscriptions') {
      fetchSubscriptions()
    }
  }, [authLoading, activeTab, fetchSubscriptions])

  const handleStatusUpdate = async (appId: string, newStatus: 'approved' | 'rejected') => {
    try {
      const adminService = new AdminService()
      
      // Find user data from current applications list (needed for incomplete apps)
      const userApp = applications.find(app => app.id === appId)
      
      // Update application status (service handles both complete and incomplete apps)
      const updatedAppId = await adminService.updateApplicationStatus(appId, newStatus, userApp)
      
      // Update local state
      setApplications(prev => {
        if (appId.startsWith('temp_')) {
          // For incomplete apps, replace temp ID with real ID
          const updatedApp = {
            ...userApp!,
            id: updatedAppId,
            status: newStatus,
            isIncomplete: false
          }
          
          if (teacherFilter === 'all') {
            return prev.map(app => app.id === appId ? updatedApp : app)
          }
          return prev.filter(app => app.id !== appId)
        } else {
          // For existing apps, just update status
          if (teacherFilter === 'all') {
            return prev.map(app => app.id === appId ? { ...app, status: newStatus } : app)
          }
          return prev.filter(app => app.id !== appId)
        }
      })
      
      // Show toast notification
      if (addToast) {
        addToast(`Teacher application ${newStatus} successfully`, 'success')
      } else {
        alert(`Teacher application ${newStatus} successfully`)
      }
      
    } catch (error) {
      console.error('Error updating status:', error)
      if (addToast) {
        addToast('Error updating status', 'error')
      } else {
        alert('Error updating status')
      }
    }
  }

  const navItems = [
    { id: "overview", icon: "🏠", label: "Overview", badge: undefined },
    { id: "teachers", icon: "👳", label: "Teachers", badge: applications.length > 0 && teacherFilter === 'pending' ? applications.length : undefined },
    { id: "sessions", icon: "📅", label: "Sessions", badge: undefined },
    { id: "subscriptions", icon: "💳", label: "Subscriptions", badge: undefined },
    { id: "students", icon: "🎓", label: "Students", badge: undefined },
    { id: "settings", icon: "⚙️", label: "Settings", badge: undefined },
  ];

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#121212]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="dash-layout">
        <aside className="dash-sidebar">
          <div className="dash-user-info">
            <div className="dash-avatar">🛡️</div>
            <div className="dash-user-name">{userProfile?.firstName || 'Admin'}</div>
            <div className="dash-user-role">Administrator</div>
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
          {activeTab === "overview" && (
            <OverviewTab 
              applications={applications} 
              loading={loading}
              setActiveTab={setActiveTab}
              setTeacherFilter={setTeacherFilter}
            />
          )}
          {activeTab === "teachers" && (
            <TeachersTab 
              applications={applications} 
              loading={loading} 
              handleStatusUpdate={handleStatusUpdate}
              filter={teacherFilter}
              setFilter={setTeacherFilter}
            />
          )}
          {activeTab === "sessions" && (
            <SessionsTab
              sessions={sessions}
              loading={sessionsLoading}
              filter={sessionFilter}
              setFilter={setSessionFilter}
              addToast={addToast}
              onRefresh={async () => {
                setSessionsLoading(true)
                try {
                  const studentService = new StudentService()
                  const filters = sessionFilter !== 'all' ? { status: sessionFilter } : undefined
                  const allSessions = await studentService.getAllSessions(filters)
                  setSessions(allSessions)
                } catch (error) {
                  console.error('Error fetching sessions:', error)
                  if (addToast) {
                    addToast('Error fetching sessions', 'error')
                  }
                } finally {
                  setSessionsLoading(false)
                }
              }}
            />
          )}
          {activeTab === "subscriptions" && (
            <SubscriptionsTab
              subscriptions={subscriptions}
              loading={subscriptionsLoading}
              filter={subscriptionFilter}
              setFilter={setSubscriptionFilter}
              addToast={addToast}
              onRefresh={fetchSubscriptions}
            />
          )}
          {activeTab === "students" && (
            <div className="p-8 text-center text-gray-500">
              <h2>Student Management</h2>
              <p>Coming soon...</p>
            </div>
          )}
          {activeTab === "settings" && (
            <div className="p-8 text-center text-gray-500">
              <h2>System Settings</h2>
              <p>Coming soon...</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

function OverviewTab({ applications, loading, setActiveTab, setTeacherFilter }: { applications: TeacherApplication[], loading: boolean, setActiveTab: (tab: string) => void, setTeacherFilter: (filter: 'all' | 'pending' | 'approved' | 'rejected') => void }) {
  const handlePendingClick = () => {
    setActiveTab('teachers')
    setTeacherFilter('pending')
  }

  return (
    <div>
      <div className="dash-welcome">
        <h2 className="dash-welcome-title">Welcome back, Admin 👋</h2>
        <p className="dash-welcome-sub">
          Here is what's happening in your platform today.
        </p>
      </div>

      <div className="kpi-grid">
        {[
          { icon: "⏳", value: applications.length, label: "Pending Applications", change: "Needs review", up: null, action: handlePendingClick },
          { icon: "👳", value: "124", label: "Active Teachers", change: "+12 this month", up: true },
          { icon: "🎓", value: "1,205", label: "Active Students", change: "+45 this week", up: true },
          { icon: "💰", value: "$45.2k", label: "Revenue", change: "+8% vs last month", up: true },
        ].map((k) => (
          <div key={k.label} className="kpi-card" onClick={k.action} style={{ cursor: k.action ? 'pointer' : 'default' }}>
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
          <h3 className="card-title">Recent Pending Applications</h3>
          <button className="card-action" onClick={handlePendingClick}>View All</button>
        </div>
        {loading ? (
          <div className="p-8 text-center">Loading...</div>
        ) : applications.length === 0 ? (
           <div className="p-8 text-center text-gray-500">No pending applications</div>
        ) : (
          <table className="sessions-table">
            <thead>
              <tr>
                <th>Teacher Name</th>
                <th>Email</th>
                <th>Subjects</th>
                <th>Applied Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {applications.slice(0, 5).map((app) => (
                <tr key={app.id}>
                  <td style={{ fontWeight: 600, color: "var(--forest)" }}>{app.fullName || 'Unknown'}</td>
                  <td>{app.email}</td>
                  <td>
                    {app.subjects?.slice(0, 2).join(', ')}
                    {app.subjects && app.subjects.length > 2 ? '...' : ''}
                  </td>
                  <td>
                    {app.createdAt?.toDate ? app.createdAt.toDate().toLocaleDateString() : 'Recently'}
                  </td>
                  <td>
                    <StatusBadge status="pending" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function TeachersTab({ 
  applications, 
  loading, 
  handleStatusUpdate,
  filter,
  setFilter
}: { 
  applications: TeacherApplication[], 
  loading: boolean, 
  handleStatusUpdate: (id: string, status: 'approved' | 'rejected') => void,
  filter: 'all' | 'pending' | 'approved' | 'rejected',
  setFilter: (filter: 'all' | 'pending' | 'approved' | 'rejected') => void
}) {
  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'pending', label: 'Pending' },
    { id: 'approved', label: 'Approved' },
    { id: 'rejected', label: 'Rejected' },
  ] as const

  return (
    <div className="card">
      <div className="card-header flex flex-col gap-4">
        <div className="flex items-center justify-between w-full">
          <h3 className="card-title">Teacher Management</h3>
        </div>
        
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 w-full overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                filter === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      
      {loading ? (
        <div className="p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading applications...</p>
        </div>
      ) : applications.length === 0 ? (
        <div className="p-12 text-center">
          <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4">inbox</span>
          <p className="text-gray-500 dark:text-gray-400 font-arabic text-lg">No {filter === 'all' ? '' : filter} applications found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="sessions-table">
            <thead>
              <tr>
                <th>Teacher</th>
                <th>Contact Info</th>
                <th>Subjects</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-bold text-lg">
                        {app.fullName ? app.fullName.charAt(0).toUpperCase() : 'T'}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 dark:text-white">{app.fullName || 'Unknown'}</div>
                        <div className="text-xs text-gray-500">ID: {app.id.substring(0, 8)}...</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="text-sm">{app.email}</div>
                    <div className="text-xs text-gray-500">{app.phone || 'No phone'}</div>
                  </td>
                  <td>
                    <div className="flex flex-col gap-1">
                      <div className="flex flex-wrap gap-1">
                        {app.subjects && app.subjects.length > 0 ? (
                          app.subjects.map((sub, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              {sub}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-gray-500">-</span>
                        )}
                      </div>
                      {app.isIncomplete && (
                        <span className="px-2 py-0.5 rounded text-xs bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 w-fit">
                          Incomplete Profile
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <StatusBadge status={app.status || 'pending'} />
                  </td>
                  <td>
                    <div className="flex gap-2">
                      {app.status !== 'approved' && (
                        <button
                          onClick={() => handleStatusUpdate(app.id, 'approved')}
                          className="flex items-center gap-1 bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium"
                          title="Approve"
                        >
                          <span className="material-symbols-outlined text-sm">check_circle</span>
                          Approve
                        </button>
                      )}
                      {app.status !== 'rejected' && (
                        <button
                          onClick={() => handleStatusUpdate(app.id, 'rejected')}
                          className="flex items-center gap-1 bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium"
                          title="Reject"
                        >
                          <span className="material-symbols-outlined text-sm">cancel</span>
                          Reject
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function SessionsTab({
  sessions,
  loading,
  filter,
  setFilter,
  addToast,
  onRefresh,
}: {
  sessions: StudentSession[]
  loading: boolean
  filter: 'all' | 'scheduled' | 'completed' | 'cancelled'
  setFilter: (filter: 'all' | 'scheduled' | 'completed' | 'cancelled') => void
  addToast: (message: string, type: 'success' | 'error' | 'info') => void
  onRefresh: () => void
}) {
  const studentService = new StudentService()

  const handleDelete = async (sessionId: string, sessionTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete the session "${sessionTitle}"? This action cannot be undone.`)) {
      return
    }

    try {
      await studentService.deleteSession(sessionId)
      if (addToast) {
        addToast('Session deleted successfully', 'success')
      }
      onRefresh()
    } catch (error) {
      console.error('Error deleting session:', error)
      if (addToast) {
        addToast('Error deleting session', 'error')
      }
    }
  }
  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'scheduled', label: 'Scheduled' },
    { id: 'completed', label: 'Completed' },
    { id: 'cancelled', label: 'Cancelled' },
  ] as const

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div>
      <div className="dash-welcome mb24">
        <h2 className="dash-welcome-title">Sessions Management</h2>
        <p className="dash-welcome-sub">View and manage all student sessions.</p>
      </div>

      <div className="card">
        <div className="card-header flex flex-col gap-4">
          <div className="flex items-center justify-between w-full">
            <h3 className="card-title">All Sessions</h3>
            <div className="text-sm text-gray-500">
              Total: {sessions.length}
            </div>
          </div>

          <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 w-full overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  filter === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading sessions...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="p-12 text-center">
            <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4">
              event_busy
            </span>
            <p className="text-gray-500 dark:text-gray-400 font-arabic text-lg">
              No {filter === 'all' ? '' : filter} sessions found
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="sessions-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Teacher</th>
                  <th>Title</th>
                  <th>Scheduled Date</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>Type</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session) => (
                  <tr key={session.id}>
                    <td>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {session.studentId.substring(0, 8)}...
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        {session.teacherPhoto && (
                          <img
                            src={session.teacherPhoto}
                            alt={session.teacherName}
                            className="w-8 h-8 rounded-full"
                          />
                        )}
                        <div className="font-medium text-gray-900 dark:text-white">
                          {session.teacherName}
                        </div>
                      </div>
                    </td>
                    <td>{session.title}</td>
                    <td>{formatDate(session.scheduledDate)}</td>
                    <td>{session.duration} min</td>
                    <td>
                      <StatusBadge status={session.status} />
                    </td>
                    <td>
                      <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {session.sessionType || 'N/A'}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleDelete(session.id, session.title)}
                        className="flex items-center gap-1 bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded text-xs font-medium transition-colors"
                        title="Delete Session"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function SubscriptionsTab({
  subscriptions,
  loading,
  filter,
  setFilter,
  addToast,
  onRefresh,
}: {
  subscriptions: StudentSubscription[]
  loading: boolean
  filter: 'all' | 'active' | 'pending' | 'cancelled'
  setFilter: (filter: 'all' | 'active' | 'pending' | 'cancelled') => void
  addToast: (message: string, type: 'success' | 'error' | 'info') => void
  onRefresh: () => void
}) {
  const subscriptionService = new SubscriptionService()

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'active', label: 'Active' },
    { id: 'pending', label: 'Pending' },
    { id: 'cancelled', label: 'Cancelled' },
  ] as const

  const formatDate = (date?: Date) => {
    if (!date) return 'N/A'
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const handleStatusUpdate = async (subscriptionId: string, newStatus: 'active' | 'pending' | 'cancelled') => {
    try {
      await subscriptionService.updateSubscriptionStatus(subscriptionId, newStatus)
      if (addToast) {
        addToast(`Subscription ${newStatus} successfully`, 'success')
      }
      // Refresh subscriptions
      onRefresh()
    } catch (error) {
      console.error('Error updating subscription status:', error)
      if (addToast) {
        addToast('Error updating subscription status', 'error')
      }
    }
  }

  const handleDelete = async (subscriptionId: string, studentName: string, planLabel: string) => {
    if (!window.confirm(`Are you sure you want to delete the subscription for "${studentName}" (${planLabel})? This will also delete all related sessions. This action cannot be undone.`)) {
      return
    }

    try {
      await subscriptionService.deleteSubscription(subscriptionId)
      if (addToast) {
        addToast('Subscription deleted successfully', 'success')
      }
      onRefresh()
    } catch (error) {
      console.error('Error deleting subscription:', error)
      if (addToast) {
        addToast('Error deleting subscription', 'error')
      }
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'tag-green'
      case 'pending':
        return 'tag-amber'
      case 'cancelled':
        return 'tag-red'
      default:
        return 'tag-gray'
    }
  }

  return (
    <div>
      <div className="dash-welcome mb24">
        <h2 className="dash-welcome-title">Subscriptions Management</h2>
        <p className="dash-welcome-sub">View and manage all student subscriptions.</p>
      </div>

      <div className="card">
        <div className="card-header flex flex-col gap-4">
          <div className="flex items-center justify-between w-full">
            <h3 className="card-title">All Subscriptions</h3>
            <div className="text-sm text-gray-500">
              Total: {subscriptions.length}
            </div>
          </div>

          <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 w-full overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  filter === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading subscriptions...</p>
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="p-12 text-center">
            <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4">
              subscription
            </span>
            <p className="text-gray-500 dark:text-gray-400 font-arabic text-lg">
              No {filter === 'all' ? '' : filter} subscriptions found
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="sessions-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Teacher</th>
                  <th>Plan</th>
                  <th>Frequency</th>
                  <th>Price</th>
                  <th>Start Date</th>
                  <th>Next Renewal</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((subscription) => (
                  <tr key={subscription.id}>
                    <td>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {subscription.studentName}
                        </div>
                        <div className="text-xs text-gray-500">{subscription.studentEmail}</div>
                      </div>
                    </td>
                    <td>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {subscription.teacherName}
                      </div>
                    </td>
                    <td>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {subscription.planLabel}
                      </div>
                      <div className="text-xs text-gray-500">
                        {subscription.sessionsPerMonth} sessions/month
                      </div>
                    </td>
                    <td>{subscription.weeklyFrequency}</td>
                    <td>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {subscription.monthlyPrice} {subscription.currency}
                      </div>
                    </td>
                    <td>{formatDate(subscription.startDate)}</td>
                    <td>{formatDate(subscription.nextRenewalDate)}</td>
                    <td>
                      <span className={`tag ${getStatusBadgeColor(subscription.status)}`}>
                        {subscription.status}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2 flex-wrap">
                        {subscription.status !== 'active' && (
                          <button
                            onClick={() => handleStatusUpdate(subscription.id, 'active')}
                            className="flex items-center gap-1 bg-green-100 hover:bg-green-200 text-green-700 px-2 py-1 rounded text-xs font-medium transition-colors"
                            title="Activate"
                          >
                            <span className="material-symbols-outlined text-sm">check</span>
                            Activate
                          </button>
                        )}
                        {subscription.status !== 'cancelled' && (
                          <button
                            onClick={() => handleStatusUpdate(subscription.id, 'cancelled')}
                            className="flex items-center gap-1 bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded text-xs font-medium transition-colors"
                            title="Cancel"
                          >
                            <span className="material-symbols-outlined text-sm">cancel</span>
                            Cancel
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(subscription.id, subscription.studentName, subscription.planLabel)}
                          className="flex items-center gap-1 bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded text-xs font-medium transition-colors"
                          title="Delete Subscription"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

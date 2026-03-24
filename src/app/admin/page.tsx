'use client'
import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { StatusBadge } from '../../components/common/StatusBadge'
import { AdminService } from '../../services/adminService'
import { TEACHER_APPLICATION_STATUS } from '../../constants/status'
import type { StudentSubscription } from '../../services/subscriptionService'
import type { StudentSession } from '../../shared/types/student.types'
import type { UserData } from '../../services/adminApi'
import type { TeacherApplication } from '../../shared/types/teacher.types'

interface AdminDashboardProps {
  addToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export default function AdminDashboard({ addToast }: AdminDashboardProps) {
  const { user, userProfile, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("overview")
  const [applications, setApplications] = useState<TeacherApplication[]>([])
  const [allApplications, setAllApplications] = useState<TeacherApplication[]>([]) // Store all applications for client-side filtering
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
  
  // Students state
  const [students, setStudents] = useState<UserData[]>([])
  const [studentsLoading, setStudentsLoading] = useState(false)
  const [studentFilter, setStudentFilter] = useState<'all' | 'completed' | 'incomplete'>('all')
  
  // Users state
  const [users, setUsers] = useState<UserData[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [userFilter, setUserFilter] = useState<'all' | 'student' | 'teacher' | 'admin' | 'pending'>('all')
  
  // KPI state
  const [kpiData, setKpiData] = useState<{
    pendingApplications: number;
    activeTeachers: number;
    activeStudents: number;
    revenue: number;
    revenueChange?: string;
    teachersChange?: string;
    studentsChange?: string;
  } | null>(null)
  const [kpiLoading, setKpiLoading] = useState(false)

  // Refs to avoid effect loops when parent passes new callback references
  const addToastRef = useRef(addToast)
  addToastRef.current = addToast

  // Check admin role - verify both user.role (backend source) and userProfile.accountType
  useEffect(() => {
    if (!authLoading) {
      // Check user.role directly from backend (most reliable) and also userProfile.accountType as fallback
      const isAdmin = user?.role === 'admin' || userProfile?.accountType === 'admin'
      
      // Debug logging to help diagnose permission issues
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((import.meta as any).env?.DEV || (import.meta as any).env?.MODE === 'development') {
        console.log('Admin check:', {
          user: user ? { id: user.id, role: user.role } : null,
          userProfile: userProfile ? { uid: userProfile.uid, accountType: userProfile.accountType } : null,
          isAdmin,
          token: localStorage.getItem('auth_token') ? 'exists' : 'missing'
        })
      }
      
      if (!user || !isAdmin) {
        // Redirect non-admin users to home page
        navigate('/', { replace: true })
      }
    }
  }, [user, userProfile, authLoading, navigate])

  // Fetch all applications once when component mounts or tab changes to teachers/overview
  useEffect(() => {
    const fetchAllApplications = async () => {
      // Don't fetch if user is not admin - check both user and userProfile
      const isAdmin = user?.role === 'admin' || userProfile?.accountType === 'admin'
      
      if (!user || !isAdmin) {
        // User is not admin, don't make API calls
        setLoading(false)
        setAllApplications([])
        setApplications([])
        return
      }

      // Only fetch when switching to teachers or overview tab
      if (activeTab !== 'teachers' && activeTab !== 'overview') {
        return
      }

      setLoading(true)
      try {
        const adminService = new AdminService()
        
        // Fetch all applications (no filter) to store in state
        const allApps = await adminService.getTeacherApplications({
          status: 'all', // Get all applications
          includeIncomplete: true,
        })
        
        setAllApplications(allApps)
      } catch (error) {
        console.error('Error fetching applications:', error)
        // Show user-friendly error message
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch applications'
        if (errorMessage.includes('permissions') || errorMessage.includes('Forbidden') || errorMessage.includes('Insufficient')) {
          // Clear applications and show error
          setAllApplications([])
          setApplications([])
          addToastRef.current?.('ليس لديك صلاحيات المشرف. يرجى تسجيل الخروج وإعادة تسجيل الدخول، أو الاتصال بالدعم إذا كنت تعتقد أن هذا خطأ.', 'error')
        } else {
          addToastRef.current?.(errorMessage, 'error')
        }
      } finally {
        setLoading(false)
      }
    }

    // Only fetch if auth is loaded and user is admin
    if (!authLoading && user && (user.role === 'admin' || userProfile?.accountType === 'admin')) {
      fetchAllApplications()
    } else if (!authLoading) {
      // Auth loaded but user is not admin, stop loading
      setLoading(false)
      setAllApplications([])
      setApplications([])
    }
    // addToast omitted intentionally – use ref to avoid effect loop when parent re-renders
  }, [authLoading, activeTab, user, userProfile])

  // Filter applications client-side based on teacherFilter
  useEffect(() => {
    if (teacherFilter === 'all') {
      setApplications(allApplications)
    } else {
      const filtered = allApplications.filter(app => {
        const status = app.status || 'pending'
        return status === teacherFilter
      })
      setApplications(filtered)
    }
  }, [teacherFilter, allApplications])

  // Fetch sessions
  useEffect(() => {
    const fetchSessions = async () => {
      if (activeTab !== 'sessions') return
      
      // Don't fetch if user is not admin
      const isAdmin = user?.role === 'admin' || userProfile?.accountType === 'admin'
      if (!user || !isAdmin) {
        setSessionsLoading(false)
        setSessions([])
        return
      }
      
      setSessionsLoading(true)
      try {
        const adminService = new AdminService()
        const filters = sessionFilter !== 'all' ? { status: sessionFilter } : undefined
        const allSessions = await adminService.getAllSessions(filters)
        setSessions(allSessions)
      } catch (error) {
        console.error('Error fetching sessions:', error)
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch sessions'
        if (errorMessage.includes('permissions') || errorMessage.includes('Forbidden') || errorMessage.includes('Insufficient')) {
          setSessions([])
          addToastRef.current?.('ليس لديك صلاحيات المشرف. يرجى تسجيل الخروج وإعادة تسجيل الدخول.', 'error')
        } else {
          addToastRef.current?.(errorMessage, 'error')
        }
      } finally {
        setSessionsLoading(false)
      }
    }

    if (!authLoading && user && (user.role === 'admin' || userProfile?.accountType === 'admin') && activeTab === 'sessions') {
      fetchSessions()
    } else if (!authLoading && activeTab === 'sessions') {
      setSessionsLoading(false)
      setSessions([])
    }
  }, [authLoading, activeTab, sessionFilter, user, userProfile])

  // Fetch subscriptions
  const fetchSubscriptions = useCallback(async () => {
    if (activeTab !== 'subscriptions') return
    
    // Don't fetch if user is not admin
    const isAdmin = user?.role === 'admin' || userProfile?.accountType === 'admin'
    if (!user || !isAdmin) {
      setSubscriptionsLoading(false)
      setSubscriptions([])
      return
    }
    
    setSubscriptionsLoading(true)
    try {
      const adminService = new AdminService()
      const filters = subscriptionFilter !== 'all' ? { status: subscriptionFilter } : undefined
      const allSubscriptions = await adminService.getAllSubscriptions(filters)
      setSubscriptions(allSubscriptions)
    } catch (error) {
      console.error('Error fetching subscriptions:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch subscriptions'
      if (errorMessage.includes('permissions') || errorMessage.includes('Forbidden') || errorMessage.includes('Insufficient')) {
        setSubscriptions([])
        addToastRef.current?.('ليس لديك صلاحيات المشرف. يرجى تسجيل الخروج وإعادة تسجيل الدخول.', 'error')
      } else {
        addToastRef.current?.(errorMessage, 'error')
      }
    } finally {
      setSubscriptionsLoading(false)
    }
  }, [activeTab, subscriptionFilter, user, userProfile])

  useEffect(() => {
    if (!authLoading && activeTab === 'subscriptions') {
      fetchSubscriptions()
    }
  }, [authLoading, activeTab, fetchSubscriptions])

  // Fetch students
  useEffect(() => {
    const fetchStudents = async () => {
      if (activeTab !== 'students') return
      
      // Don't fetch if user is not admin
      const isAdmin = user?.role === 'admin' || userProfile?.accountType === 'admin'
      if (!user || !isAdmin) {
        setStudentsLoading(false)
        setStudents([])
        return
      }
      
      setStudentsLoading(true)
      try {
        const adminService = new AdminService()
        const allStudents = await adminService.getAllStudents()
        setStudents(allStudents)
      } catch (error) {
        console.error('Error fetching students:', error)
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch students'
        if (errorMessage.includes('permissions') || errorMessage.includes('Forbidden') || errorMessage.includes('Insufficient')) {
          setStudents([])
          addToastRef.current?.('ليس لديك صلاحيات المشرف. يرجى تسجيل الخروج وإعادة تسجيل الدخول.', 'error')
        } else {
          addToastRef.current?.(errorMessage, 'error')
        }
      } finally {
        setStudentsLoading(false)
      }
    }

    // Only fetch if auth is loaded and user is admin
    if (!authLoading && user && (user.role === 'admin' || userProfile?.accountType === 'admin') && activeTab === 'students') {
      fetchStudents()
    } else if (!authLoading && activeTab === 'students') {
      setStudentsLoading(false)
      setStudents([])
    }
  }, [authLoading, activeTab, user, userProfile])

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      if (activeTab !== 'users') return
      
      // Don't fetch if user is not admin
      const isAdmin = user?.role === 'admin' || userProfile?.accountType === 'admin'
      if (!user || !isAdmin) {
        setUsersLoading(false)
        setUsers([])
        return
      }
      
      setUsersLoading(true)
      try {
        const adminService = new AdminService()
        const allUsers = await adminService.getAllUsers()
        setUsers(allUsers)
      } catch (error) {
        console.error('Error fetching users:', error)
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch users'
        if (errorMessage.includes('permissions') || errorMessage.includes('Forbidden') || errorMessage.includes('Insufficient')) {
          setUsers([])
          addToastRef.current?.('ليس لديك صلاحيات المشرف. يرجى تسجيل الخروج وإعادة تسجيل الدخول.', 'error')
        } else {
          addToastRef.current?.(errorMessage, 'error')
        }
      } finally {
        setUsersLoading(false)
      }
    }

    // Only fetch if auth is loaded and user is admin
    if (!authLoading && user && (user.role === 'admin' || userProfile?.accountType === 'admin') && activeTab === 'users') {
      fetchUsers()
    } else if (!authLoading && activeTab === 'users') {
      setUsersLoading(false)
      setUsers([])
    }
  }, [authLoading, activeTab, user, userProfile])

  // Fetch KPI data
  useEffect(() => {
    const fetchKPIData = async () => {
      if (activeTab !== 'overview') return
      
      // Don't fetch if user is not admin
      const isAdmin = user?.role === 'admin' || userProfile?.accountType === 'admin'
      if (!user || !isAdmin) {
        setKpiLoading(false)
        setKpiData(null)
        return
      }
      
      setKpiLoading(true)
      try {
        const adminService = new AdminService()
        const kpi = await adminService.getKPIData()
        setKpiData(kpi)
      } catch (error) {
        console.error('Error fetching KPI data:', error)
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch KPI data'
        if (!errorMessage.includes('permissions') && !errorMessage.includes('Forbidden') && !errorMessage.includes('Insufficient')) {
          addToastRef.current?.(errorMessage, 'error')
        }
        // Set default values on error
        setKpiData({
          pendingApplications: 0,
          activeTeachers: 0,
          activeStudents: 0,
          revenue: 0,
        })
      } finally {
        setKpiLoading(false)
      }
    }

    // Only fetch if auth is loaded and user is admin
    if (!authLoading && user && (user.role === 'admin' || userProfile?.accountType === 'admin') && activeTab === 'overview') {
      fetchKPIData()
    } else if (!authLoading && activeTab === 'overview') {
      setKpiLoading(false)
      setKpiData(null)
    }
  }, [authLoading, activeTab, user, userProfile])

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
    { id: "users", icon: "👥", label: "Users", badge: undefined },
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
              kpiData={kpiData}
              kpiLoading={kpiLoading}
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
                  const adminService = new AdminService()
                  const filters = sessionFilter !== 'all' ? { status: sessionFilter } : undefined
                  const allSessions = await adminService.getAllSessions(filters)
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
            <StudentsTab
              students={students}
              loading={studentsLoading}
              filter={studentFilter}
              setFilter={setStudentFilter}
              addToast={addToast}
              onRefresh={async () => {
                setStudentsLoading(true)
                try {
                  const adminService = new AdminService()
                  const allStudents = await adminService.getAllStudents()
                  setStudents(allStudents)
                } catch (error) {
                  console.error('Error fetching students:', error)
                  if (addToast) {
                    addToast('Error fetching students', 'error')
                  }
                } finally {
                  setStudentsLoading(false)
                }
              }}
            />
          )}
          {activeTab === "users" && (
            <UsersTab
              users={users}
              loading={usersLoading}
              filter={userFilter}
              setFilter={setUserFilter}
              addToast={addToast}
              onRefresh={async () => {
                setUsersLoading(true)
                try {
                  const adminService = new AdminService()
                  const allUsers = await adminService.getAllUsers()
                  setUsers(allUsers)
                } catch (error) {
                  console.error('Error fetching users:', error)
                  if (addToast) {
                    addToast('Error fetching users', 'error')
                  }
                } finally {
                  setUsersLoading(false)
                }
              }}
            />
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

function OverviewTab({ 
  applications, 
  loading, 
  setActiveTab, 
  setTeacherFilter,
  kpiData,
  kpiLoading
}: { 
  applications: TeacherApplication[], 
  loading: boolean, 
  setActiveTab: (tab: string) => void, 
  setTeacherFilter: (filter: 'all' | 'pending' | 'approved' | 'rejected') => void,
  kpiData: {
    pendingApplications: number;
    activeTeachers: number;
    activeStudents: number;
    revenue: number;
    revenueChange?: string;
    teachersChange?: string;
    studentsChange?: string;
  } | null,
  kpiLoading: boolean
}) {
  const handlePendingClick = () => {
    setActiveTab('teachers')
    setTeacherFilter('pending')
  }

  // Format revenue value
  const formatRevenue = (revenue: number): string => {
    if (revenue >= 1000000) {
      return `$${(revenue / 1000000).toFixed(1)}M`
    } else if (revenue >= 1000) {
      return `$${(revenue / 1000).toFixed(1)}k`
    } else {
      return `$${revenue.toFixed(0)}`
    }
  }

  // Format number with commas
  const formatNumber = (num: number): string => {
    return num.toLocaleString('en-US')
  }

  // Get KPI values or defaults
  const pendingCount = kpiData?.pendingApplications ?? applications.length
  const activeTeachers = kpiData?.activeTeachers ?? 0
  const activeStudents = kpiData?.activeStudents ?? 0
  const revenue = kpiData?.revenue ?? 0

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
          { 
            icon: "⏳", 
            value: kpiLoading ? "..." : formatNumber(pendingCount), 
            label: "Pending Applications", 
            change: kpiLoading ? "Loading..." : "Needs review", 
            up: null, 
            action: handlePendingClick 
          },
          { 
            icon: "👳", 
            value: kpiLoading ? "..." : formatNumber(activeTeachers), 
            label: "Active Teachers", 
            change: kpiData?.teachersChange || (kpiLoading ? "Loading..." : "Active now"), 
            up: kpiData?.teachersChange ? true : null 
          },
          { 
            icon: "🎓", 
            value: kpiLoading ? "..." : formatNumber(activeStudents), 
            label: "Active Students", 
            change: kpiData?.studentsChange || (kpiLoading ? "Loading..." : "Active now"), 
            up: kpiData?.studentsChange ? true : null 
          },
          { 
            icon: "💰", 
            value: kpiLoading ? "..." : formatRevenue(revenue), 
            label: "Revenue", 
            change: kpiData?.revenueChange || (kpiLoading ? "Loading..." : "Monthly revenue"), 
            up: kpiData?.revenueChange ? true : null 
          },
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
                <th className="text-right">Teacher</th>
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
                      <div className="w-10 h-10 bg-gray-100 rounded-full overflow-hidden flex items-center justify-center text-gray-500 font-bold text-lg shrink-0">
                        {app.avatar ? (
                          <img
                            src={app.avatar}
                            alt={app.fullName || 'Teacher'}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback to initial if image fails to load
                              (e.currentTarget as HTMLImageElement).style.display = 'none'
                            }}
                          />
                        ) : (
                          <span>{app.fullName ? app.fullName.charAt(0).toUpperCase() : 'T'}</span>
                        )}
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
                      {app.status === 'pending' && (
                        <button
                          onClick={() => handleStatusUpdate(app.id, 'approved')}
                          className="flex items-center gap-1 bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium"
                          title="Approve"
                        >
                          <span className="material-symbols-outlined text-sm">check_circle</span>
                          Approve
                        </button>
                      )}
                      {app.status === 'pending' && (
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
  const adminService = new AdminService()

  const handleDelete = async (sessionId: string, sessionTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete the session "${sessionTitle}"? This action cannot be undone.`)) {
      return
    }

    try {
      await adminService.deleteSession(sessionId)
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
  const adminService = new AdminService()

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
      await adminService.updateSubscriptionStatus(subscriptionId, newStatus)
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
      await adminService.deleteSubscription(subscriptionId)
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

function UsersTab({
  users,
  loading,
  filter,
  setFilter,
  addToast,
  onRefresh,
}: {
  users: UserData[]
  loading: boolean
  filter: 'all' | 'student' | 'teacher' | 'admin' | 'pending'
  setFilter: (filter: 'all' | 'student' | 'teacher' | 'admin' | 'pending') => void
  addToast: (message: string, type: 'success' | 'error' | 'info') => void
  onRefresh: () => void
}) {
  const adminService = new AdminService()

  const handleDeleteUser = async (userId: string) => {
    try {
      await adminService.deleteUser(userId)
      if (addToast) {
        addToast('User and all related data deleted successfully', 'success')
      }
      // Refresh users list
      onRefresh()
    } catch (error) {
      console.error('Error deleting user:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete user'
      if (addToast) {
        addToast(errorMessage, 'error')
      }
    }
  }
  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'student', label: 'Students' },
    { id: 'teacher', label: 'Teachers' },
    { id: 'admin', label: 'Admins' },
    { id: 'pending', label: 'Pending' },
  ] as const

  const formatDate = (date?: any) => {
    if (!date) return 'N/A'
    try {
      const d = date?.toDate ? date.toDate() : new Date(date)
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    } catch {
      return 'N/A'
    }
  }

  const getDisplayName = (user: UserData) => {
    if (user.displayName) return user.displayName
    if (user.firstName || user.lastName) {
      return `${user.firstName || ''} ${user.lastName || ''}`.trim()
    }
    return 'Unknown'
  }

  const getUserRole = (user: UserData): 'student' | 'teacher' | 'admin' | 'pending' => {
    // Use role field from backend (most reliable), fallback to accountType
    if (user.role === 'admin' || user.accountType === 'admin') return 'admin'
    if (user.role === 'teacher' || user.accountType === 'teacher') return 'teacher'
    if (user.role === 'pending' || user.accountType === 'pending') return 'pending'
    if (user.role === 'student' || user.accountType === 'student') return 'student'
    // If no role specified, check if it's pending
    return 'pending'
  }

  const getProfileCompletion = (user: UserData): number => {
    // Use profileCompletion from backend if available, otherwise calculate
    if (user.profileCompletion !== undefined) {
      return user.profileCompletion
    }
    
    // Fallback calculation if backend doesn't provide it
    let completedFields = 0
    const totalFields = 8

    if (user.firstName) completedFields++
    if (user.lastName) completedFields++
    if (user.email) completedFields++
    if (user.phone) completedFields++
    if (user.displayName) completedFields++
    if (user.photoURL || user.avatar) completedFields++
    if (user.tasks && Array.isArray(user.tasks) && user.tasks.length > 0) completedFields++
    if (user.timezone) completedFields++

    return Math.round((completedFields / totalFields) * 100)
  }

  const filteredUsers = users.filter((user) => {
    if (filter === 'all') return true
    const role = getUserRole(user)
    return role === filter
  })

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'teacher':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'student':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'pending':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getCompletionColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    if (percentage >= 50) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  }

  return (
    <div>
      <div className="dash-welcome mb24">
        <h2 className="dash-welcome-title">Users Management</h2>
        <p className="dash-welcome-sub">View and manage all user accounts with their roles and profile completion.</p>
      </div>

      <div className="card">
        <div className="card-header flex flex-col gap-4">
          <div className="flex items-center justify-between w-full">
            <h3 className="card-title">All Users</h3>
            <div className="text-sm text-gray-500">
              Total: {filteredUsers.length}
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
            <p>Loading users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center">
            <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4">
              people
            </span>
            <p className="text-gray-500 dark:text-gray-400 font-arabic text-lg">
              No {filter === 'all' ? '' : filter} users found
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="sessions-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Profile Completion</th>
                  <th>Joined Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => {
                  const role = getUserRole(user)
                  const completion = getProfileCompletion(user)
                  return (
                    <tr key={user.uid}>
                      <td>
                        <div className="flex items-center gap-3">
                          {(user as any).photoURL || (user as any).avatar ? (
                            <img
                              src={(user as any).photoURL || (user as any).avatar}
                              alt={getDisplayName(user)}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-500 font-bold text-lg">
                              {getDisplayName(user).charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-gray-900 dark:text-white">
                              {getDisplayName(user)}
                            </div>
                            <div className="text-xs text-gray-500">ID: {user.uid.substring(0, 8)}...</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="text-sm">{user.email || 'N/A'}</div>
                      </td>
                      <td>
                        <div className="text-sm">{user.phone || 'N/A'}</div>
                      </td>
                      <td>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getRoleBadgeColor(role)}`}>
                          {role.charAt(0).toUpperCase() + role.slice(1)}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 min-w-[60px]">
                            <div
                              className={`h-2 rounded-full ${
                                completion >= 80 ? 'bg-green-500' : completion >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${completion}%` }}
                            ></div>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getCompletionColor(completion)}`}>
                            {completion}%
                          </span>
                        </div>
                      </td>
                      <td>{formatDate(user.createdAt)}</td>
                      <td>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              window.open(`/profile/${user.uid}`, '_blank')
                            }}
                            className="flex items-center gap-1 bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded text-xs font-medium transition-colors"
                            title="View Profile"
                          >
                            <span className="material-symbols-outlined text-sm">visibility</span>
                            View
                          </button>
                          {role !== 'admin' && (
                            <button
                              onClick={() => {
                                const displayName = getDisplayName(user)
                                if (window.confirm(`Are you sure you want to delete user "${displayName}" (${user.email})? This will permanently delete:\n\n- User account\n- Profile data\n- All sessions\n- All subscriptions\n- All applications\n- All payments\n\nThis action cannot be undone!`)) {
                                  handleDeleteUser(user.uid)
                                }
                              }}
                              className="flex items-center gap-1 bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded text-xs font-medium transition-colors"
                              title="Delete User"
                            >
                              <span className="material-symbols-outlined text-sm">delete</span>
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function StudentsTab({
  students,
  loading,
  filter,
  setFilter,
  addToast,
  onRefresh,
}: {
  students: UserData[]
  loading: boolean
  filter: 'all' | 'completed' | 'incomplete'
  setFilter: (filter: 'all' | 'completed' | 'incomplete') => void
  addToast: (message: string, type: 'success' | 'error' | 'info') => void
  onRefresh: () => void
}) {
  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'completed', label: 'Completed Profile' },
    { id: 'incomplete', label: 'Incomplete Profile' },
  ] as const

  const formatDate = (date?: any) => {
    if (!date) return 'N/A'
    try {
      const d = date?.toDate ? date.toDate() : new Date(date)
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    } catch {
      return 'N/A'
    }
  }

  const getDisplayName = (student: UserData) => {
    if (student.displayName) return student.displayName
    if (student.firstName || student.lastName) {
      return `${student.firstName || ''} ${student.lastName || ''}`.trim()
    }
    return 'Unknown'
  }

  const isProfileComplete = (student: UserData) => {
    return !!(
      student.firstName &&
      student.lastName &&
      student.email &&
      (student as any).goals &&
      Array.isArray((student as any).goals) &&
      (student as any).goals.length > 0 &&
      (student as any).ageGroup &&
      (student as any).level
    )
  }

  const filteredStudents = students.filter((student) => {
    if (filter === 'all') return true
    const complete = isProfileComplete(student)
    return filter === 'completed' ? complete : !complete
  })

  return (
    <div>
      <div className="dash-welcome mb24">
        <h2 className="dash-welcome-title">Students Management</h2>
        <p className="dash-welcome-sub">View and manage all student accounts.</p>
      </div>

      <div className="card">
        <div className="card-header flex flex-col gap-4">
          <div className="flex items-center justify-between w-full">
            <h3 className="card-title">All Students</h3>
            <div className="text-sm text-gray-500">
              Total: {filteredStudents.length}
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
            <p>Loading students...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-12 text-center">
            <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4">
              school
            </span>
            <p className="text-gray-500 dark:text-gray-400 font-arabic text-lg">
              No {filter === 'all' ? '' : filter} students found
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="sessions-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Level</th>
                  <th>Age Group</th>
                  <th>Profile Status</th>
                  <th>Joined Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => {
                  const complete = isProfileComplete(student)
                  return (
                    <tr key={student.uid}>
                      <td>
                        <div className="flex items-center gap-3">
                          {(student as any).photoURL ? (
                            <img
                              src={(student as any).photoURL}
                              alt={getDisplayName(student)}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-500 font-bold text-lg">
                              {getDisplayName(student).charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-gray-900 dark:text-white">
                              {getDisplayName(student)}
                            </div>
                            <div className="text-xs text-gray-500">ID: {student.uid.substring(0, 8)}...</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="text-sm">{student.email || 'N/A'}</div>
                      </td>
                      <td>
                        <div className="text-sm">{student.phone || 'N/A'}</div>
                      </td>
                      <td>
                        <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {(student as any).level || 'N/A'}
                        </span>
                      </td>
                      <td>
                        <span className="px-2 py-1 rounded text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                          {(student as any).ageGroup || 'N/A'}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            complete
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                          }`}
                        >
                          {complete ? 'Complete' : 'Incomplete'}
                        </span>
                      </td>
                      <td>{formatDate(student.createdAt)}</td>
                      <td>
                        <button
                          onClick={() => {
                            window.open(`/profile/${student.uid}`, '_blank')
                          }}
                          className="flex items-center gap-1 bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded text-xs font-medium transition-colors"
                          title="View Profile"
                        >
                          <span className="material-symbols-outlined text-sm">visibility</span>
                          View
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

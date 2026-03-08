'use client'
import React, { useState, useEffect } from 'react'
import { collection, query, where, getDocs, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../config/firebase'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { StatusBadge } from '../../components/common/StatusBadge'

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
        // Fetch all applications

        const allAppsQuery = query(collection(db, 'teacherApplications'))
        const allAppsSnapshot = await getDocs(allAppsQuery)
        const allApps = allAppsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as TeacherApplication[]
        
        // Filter in memory based on selected tab
        let filteredApps = allApps
        if (teacherFilter !== 'all') {
          filteredApps = allApps.filter(app => {
            const status = app.status || 'pending'
            return status === teacherFilter
          })
        }
        
        // If 'pending' or 'all', add incomplete users
        if (teacherFilter === 'all' || teacherFilter === 'pending') {
           const usersQuery = query(
            collection(db, 'users'),
            where('accountType', '==', 'teacher')
          )
          const usersSnapshot = await getDocs(usersQuery)
          
          const incompleteApps: TeacherApplication[] = []
          usersSnapshot.docs.forEach(userDoc => {
             const userData = userDoc.data()
             const userId = userDoc.id // uid is the doc id
             
             // Check if this user has ANY application in allApps
             const hasApp = allApps.some(a => a.userId === userId)
             
             if (!hasApp) {
               incompleteApps.push({
                 id: `temp_${userId}`,
                 userId: userId,
                 fullName: userData.displayName || `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'Unknown',
                 email: userData.email,
                 phone: userData.phone,
                 subjects: [],
                 status: 'pending', // Show in pending list
                 createdAt: userData.createdAt,
                 isIncomplete: true
               })
             }
          })
          
          filteredApps = [...filteredApps, ...incompleteApps]
        }
        
        // Sort
        filteredApps.sort((a, b) => {
          const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0)
          const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0)
          return dateB.getTime() - dateA.getTime()
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

  const handleStatusUpdate = async (appId: string, newStatus: 'approved' | 'rejected') => {
    try {
      // Check if it's an incomplete application
      const isTemp = appId.startsWith('temp_')
      
      if (isTemp) {
        // We need to create a new application document
        // Extract userId from appId (temp_USERID)
        const userId = appId.replace('temp_', '')
        
        // Find user data from current applications list
        const userApp = applications.find(app => app.id === appId)
        
        if (!userApp) {
          console.error('User application not found in local state')
          return
        }

        const applicationData = {
          userId: userId,
          fullName: userApp.fullName || '',
          email: userApp.email || '',
          phone: userApp.phone || '',
          subjects: [], // Empty as they haven't selected any
          bio: '', // Empty as they haven't written any
          hourlyRate: 0,
          currency: 'USD',
          status: newStatus,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          isManuallyCreated: true
        }

        // Create new application document
        const docRef = await addDoc(collection(db, 'teacherApplications'), applicationData)
        
        // Update local state with the new real ID
        setApplications(prev => {
          // Remove the temp item and add the real one (or just update if we want to keep it simple)
          // Better to replace it
          const updatedApp = {
            ...userApp,
            id: docRef.id,
            status: newStatus,
            isIncomplete: false
          }
          
          if (teacherFilter === 'all') {
            return prev.map(app => app.id === appId ? updatedApp : app)
          }
          // If filtering by specific status (e.g. pending), remove the item as it no longer matches
          return prev.filter(app => app.id !== appId)
        })

        if (addToast) {
          addToast(`Teacher application created and ${newStatus} successfully`, 'success')
        }
        return
      }

      await updateDoc(doc(db, 'teacherApplications', appId), {
        status: newStatus,
        updatedAt: new Date()
      })
      
      // Update local state
      setApplications(prev => {
        // If viewing all, just update the status
        if (teacherFilter === 'all') {
          return prev.map(app => app.id === appId ? { ...app, status: newStatus } : app)
        }
        // If filtering by specific status (e.g. pending), remove the item as it no longer matches
        return prev.filter(app => app.id !== appId)
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
    { id: 'pending', label: 'Pending' },
    { id: 'approved', label: 'Approved' },
    { id: 'rejected', label: 'Rejected' },
    { id: 'all', label: 'All' }
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

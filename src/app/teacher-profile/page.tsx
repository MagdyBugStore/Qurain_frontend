'use client'

import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../../config/firebase'
import { useAuth } from '../../contexts/AuthContext'
import Header from '../../components/layout/Header'

type TabType = 'personal' | 'qualifications' | 'availability' | 'reviews'

interface TeacherApplication {
  id: string
  fullName?: string
  email?: string
  phone?: string
  countryCode?: string
  gender?: string
  nationality?: string
  yearsOfExperience?: number
  educationLevel?: string
  bio?: string
  subjects?: string[]
  hourlyRate?: number
  currency?: string
  status?: 'pending' | 'approved' | 'rejected'
  createdAt?: any
  updatedAt?: any
}

export default function TeacherProfilePage() {
  const [activeTab, setActiveTab] = useState<TabType>('personal')
  const { user, userProfile } = useAuth()
  const [teacherApplication, setTeacherApplication] = useState<TeacherApplication | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch teacher application data
  useEffect(() => {
    const fetchTeacherApplication = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        const applicationsQuery = query(
          collection(db, 'teacherApplications'),
          where('userId', '==', user.uid)
        )
        const querySnapshot = await getDocs(applicationsQuery)
        
        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0]
          setTeacherApplication({
            id: doc.id,
            ...doc.data()
          } as TeacherApplication)
        }
      } catch (error) {
        console.error('Error fetching teacher application:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTeacherApplication()
  }, [user])

  // Get teacher data from userProfile and teacherApplication
  const teacherName = userProfile?.displayName || 
    `${userProfile?.firstName || ''} ${userProfile?.lastName || ''}`.trim() ||
    teacherApplication?.fullName ||
    user?.displayName ||
    'المعلم'
  
  const teacherTitle = teacherApplication?.status === 'approved' 
    ? 'مدرس معتمد' 
    : teacherApplication?.status === 'pending'
    ? 'في انتظار الموافقة'
    : 'مدرس'
  
  const specialization = teacherApplication?.subjects?.join(' و ') || 'التجويد والقراءات'
  const sessionPrice = teacherApplication?.hourlyRate || 0
  const currency = teacherApplication?.currency === 'SAR' ? 'ر.س' : 
                   teacherApplication?.currency === 'USD' ? '$' :
                   teacherApplication?.currency === 'EGP' ? 'ج.م' : 'ر.س'
  
  const profileImage = userProfile?.photoURL || user?.photoURL || ''
  
  const isPending = teacherApplication?.status === 'pending'
  const isApproved = teacherApplication?.status === 'approved'

  // Qualifications from educationLevel (simplified - in production, this would be a separate collection)
  const qualifications = teacherApplication?.educationLevel ? [
    {
      title: teacherApplication.educationLevel,
      institution: teacherApplication.nationality || '',
      year: '',
    },
  ] : []

  // Ijazahs - TODO: Fetch from separate collection or storage
  const ijazahs: Array<{ title: string; description: string; image: string }> = []

  // Mock Reviews Data - بيانات وهمية للتقييمات
  const reviews: Array<{ name: string; time: string; rating: number; comment: string; avatar: string }> = [
    {
      name: 'محمد علي',
      time: 'قبل يومين',
      rating: 5,
      comment: 'ما شاء الله تبارك الله، أسلوب الدكتور متميز جداً في تصحيح التلاوة. يهتم بدقائق التجويد ويربطها بمعاني الآيات. جزاكم الله خيراً.',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAqR32u1hY7LX4IdVqqSVCzRsckr5Tpd-ubbFOEahgGBpXlGZIiBBWdnToWsAS4Nj3xlGt3-0CIVInGch9IcZjnbHxwGPFw8mk1dAUjEX0tLEj_Yr3PT0kfhZV983nFSwVhpYjeSpNac94V0R0jXzPekFstM5xAE7hXW2qYSKT0bj-6ddD-xLqVvMC9K9CqhaoFOkGD0K6ziJ7oUWHpRcwO42GqjtoVVK6OdXzQaIcuPJq3AkygWhbBlEw7qSXlo5oxvM3lqU17YOCo',
    },
    {
      name: 'عبد الله عمر',
      time: 'قبل أسبوع',
      rating: 5,
      comment: 'استفدت كثيراً من دورة مخارج الحروف. الشرح وافي والتطبيق العملي مفيد جداً. أنصح بالدراسة معه لكل طالب علم.',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAEimIImSLgw0XsDxrT1crt0NFg8Fs_vVPLV__RobSTEk8F9Vic0Vwokcx5p9d6e9n01WqncOetVqniX6pz5Ul97-Whs_0FlxHE_OwPFiWN7vZFQ_OsoBVgMCyJsLY_D52YxA1ZvmOLxge_AqBLu_eQ8IXrnj-G6jDUVOm9kRt8u5z4PzFeROve6MdrLRAtikMKP5Z6WfAgC4ISOMM12jPOjhJBwAYqFP11cKL-xYeoi_2ysCJjOFJSb5Ee8kUpuYYvIYiobfsLlwic',
    },
    {
      name: 'فاطمة أحمد',
      time: 'قبل أسبوعين',
      rating: 5,
      comment: 'معلمة ممتازة، صبورة جداً وتشرح بطريقة واضحة. ساعدتني في تحسين تلاوتي بشكل كبير. الله يبارك في جهودها.',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDaHCQpQDIhRCTg8znqGbspw1A1F6Zar1Syu1aLwWIQat1CNApShCs6EKLwGnERa9BLy_zwlwOAPw7sLW8qgsiPJIiXGWL4B0KMcMnHdJcvbOIrtiSKYYlhWoiyKFRz7ol7BumuHGknAqEeSUXxfrzxk6sHDfrepKu8GiXJcm8IJpTCYIlEKrMDSvQP_eE-ePAzmoROe-xBU2UtjrP8j93LQuthyn4pLtWeWolZnyevkFcf-cE_8Ugxc-6zr4dclaScsP8KvndSVtUa',
    },
    {
      name: 'خالد سعيد',
      time: 'قبل شهر',
      rating: 4,
      comment: 'تجربة جيدة جداً. المعلم محترف ويقدم محتوى تعليمي قيم. أنصح به.',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuATkUyF19AckE7-EAcEpTWbRp5BQ0QDZNDQTcP5IXl3SwoL-89c4tiTdoUn-9IGSenrFQScQT4lWpcUyRRnAkDF-6_Fx2S982e836ZjDcJGeTjNYQkXPgIfjL6-zeFPuUtEaWELB7cXJgFspyWWdg7i8WfUM8r0xiGqv1KCpwEOW4QF4dwXP5KzcJVYDwH_jRvtKe7zqBGMv5SH8aDAo1dk4ioSVPjNYTeeoJZeuboSlu-jQmO9SY2C560OiDtk4rRxVyYWuqXfIL3H',
    },
  ]

  // Availability schedule data - بيانات وهمية لجدول التوفر
  const timeSlots = [
    '٠٨:٠٠ ص', '٠٩:٠٠ ص', '١٠:٠٠ ص', '١١:٠٠ ص', 
    '١٢:٠٠ م', '٠١:٠٠ م', '٠٢:٠٠ م', '٠٣:٠٠ م',
    '٠٤:٠٠ م', '٠٥:٠٠ م', '٠٦:٠٠ م', '٠٧:٠٠ م'
  ]
  const days = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة']
  
  // Mock availability data: [dayIndex][timeIndex] = 'available' | 'booked' | 'unavailable'
  const availability: (string | null)[][] = [
    ['available', 'available', 'booked', 'booked', 'available', 'available', null, null, 'available', 'available', 'booked', null], // Saturday
    ['booked', 'booked', 'available', 'available', 'booked', 'available', 'available', null, 'booked', 'available', 'available', 'available'], // Sunday
    [null, 'available', 'available', 'booked', 'available', 'available', 'available', 'available', null, 'booked', 'available', null], // Monday
    ['available', 'available', 'booked', 'available', 'available', 'booked', 'available', null, 'available', 'available', 'booked', 'available'], // Tuesday
    [null, null, 'available', 'available', 'booked', 'available', 'available', 'available', 'available', null, 'available', 'available'], // Wednesday
    ['available', 'booked', 'available', 'available', 'available', 'booked', 'booked', 'available', 'available', 'available', null, null], // Thursday
    [null, null, null, null, null, null, null, null, null, null, null, null], // Friday
  ]

  const tabs = [
    { id: 'personal' as TabType, label: 'البيانات الشخصية' },
    { id: 'qualifications' as TabType, label: 'المؤهلات والإجازات' },
    { id: 'availability' as TabType, label: 'جدول التوفر' },
    { id: 'reviews' as TabType, label: 'التقييمات' },
  ]

  if (loading) {
    return (
      <>
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-slate-600 dark:text-slate-400">جاري التحميل...</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display">
        <main className="flex-1 px-6 py-8 lg:px-20">
          {/* Pending Status Banner */}
          {isPending && (
            <div className="mb-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-center gap-3">
              <span className="material-symbols-outlined text-amber-600 dark:text-amber-400">schedule</span>
              <div className="flex-1">
                <p className="font-bold text-amber-900 dark:text-amber-200">طلبك قيد المراجعة</p>
                <p className="text-sm text-amber-700 dark:text-amber-300">سيتم مراجعة طلبك خلال 48 ساعة. سيتم إشعارك عند الموافقة على طلبك.</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Sidebar Column */}
            <aside className="lg:col-span-4 xl:col-span-3">
              <div className="sticky top-24 space-y-6">
                {/* Profile Card */}
                <div className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl p-8 flex flex-col items-center text-center shadow-xl border border-primary/10">
                  <div className="relative group">
                    <div className="h-32 w-32 rounded-full border-4 border-primary/30 p-1 mb-4 overflow-hidden bg-slate-100 dark:bg-slate-700">
                      {profileImage ? (
                        <div
                          className="h-full w-full rounded-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                          style={{ backgroundImage: `url('${profileImage}')` }}
                        />
                      ) : (
                        <div className="h-full w-full rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center">
                          <span className="material-symbols-outlined text-4xl text-slate-400 dark:text-slate-300">person</span>
                        </div>
                      )}
                    </div>
                    {isApproved && (
                      <span className="absolute bottom-6 right-2 bg-primary text-white dark:text-slate-900 p-1 rounded-full border-2 border-white dark:border-slate-800">
                        <span className="material-symbols-outlined text-xs filled">verified</span>
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold mb-1">{teacherName}</h3>
                  <p className="text-primary text-sm font-medium mb-4">{teacherTitle}</p>
                  {isApproved && (
                    <div className="flex items-center gap-1 mb-6">
                      <span className="material-symbols-outlined text-primary text-lg filled">star</span>
                      <span className="text-lg font-bold text-slate-900 dark:text-white">-</span>
                      <span className="text-slate-500 dark:text-slate-400 text-xs mr-1">(لا توجد تقييمات بعد)</span>
                    </div>
                  )}
                  <div className="w-full space-y-3 pt-6 border-t border-slate-200 dark:border-slate-700 text-right">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500 dark:text-slate-400">التخصص:</span>
                      <span className="font-medium text-slate-900 dark:text-white">{specialization || 'غير محدد'}</span>
                    </div>
                    {sessionPrice > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500 dark:text-slate-400">سعر الجلسة:</span>
                        <span className="text-primary font-bold">{sessionPrice} {currency}/ساعة</span>
                      </div>
                    )}
                    {isApproved && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500 dark:text-slate-400">إجمالي الساعات:</span>
                        <span className="font-medium text-slate-900 dark:text-white">٠ ساعة</span>
                      </div>
                    )}
                  </div>
                  {isApproved && (
                    <button className="w-full mt-8 bg-primary text-slate-900 font-bold py-3 rounded-lg hover:brightness-110 transition-all flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-sm">edit</span>
                      تعديل الملف العام
                    </button>
                  )}
                </div>

                {/* Quick Links */}
                <div className="bg-white dark:bg-background-dark border border-primary/10 rounded-xl p-6 space-y-4">
                  <h4 className="font-bold text-sm text-slate-500 uppercase tracking-wider">روابط سريعة</h4>
                  <nav className="space-y-1">
                    <a className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary" href="#">
                      <span className="material-symbols-outlined filled">account_circle</span>
                      <span className="text-sm font-medium">البيانات الشخصية</span>
                    </a>
                    <a className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all" href="#">
                      <span className="material-symbols-outlined">description</span>
                      <span className="text-sm font-medium">إدارة المحفظة</span>
                    </a>
                    <a className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all" href="#">
                      <span className="material-symbols-outlined">support_agent</span>
                      <span className="text-sm font-medium">الدعم الفني</span>
                    </a>
                  </nav>
                </div>
              </div>
            </aside>

            {/* Main Area */}
            <div className="lg:col-span-8 xl:col-span-9 space-y-6">
              {/* Navigation Tabs */}
              <div className="bg-white dark:bg-background-dark rounded-xl p-2 flex overflow-x-auto border border-primary/10 shadow-sm whitespace-nowrap scrollbar-hide">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-6 py-2.5 text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary text-slate-900 font-bold rounded-lg'
                        : 'text-slate-500 hover:text-primary'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Content Section */}
              <section className="space-y-8">
                {/* Personal Information Tab */}
                {activeTab === 'personal' && (
                  <div className="bg-white dark:bg-background-dark rounded-xl p-8 border border-primary/10 shadow-sm">
                    <h3 className="text-xl font-bold mb-6">البيانات الشخصية</h3>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">الاسم الكامل</label>
                          <input
                            type="text"
                            defaultValue={teacherName}
                            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-slate-900 dark:text-slate-100"
                            readOnly={isPending}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">البريد الإلكتروني</label>
                          <input
                            type="email"
                            defaultValue={userProfile?.email || teacherApplication?.email || user?.email || ''}
                            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-slate-900 dark:text-slate-100"
                            readOnly={isPending}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">رقم الهاتف</label>
                          <input
                            type="tel"
                            defaultValue={`${teacherApplication?.countryCode || '+966'} ${teacherApplication?.phone || ''}`}
                            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-slate-900 dark:text-slate-100"
                            readOnly={isPending}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">الجنسية</label>
                          <input
                            type="text"
                            defaultValue={teacherApplication?.nationality || ''}
                            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-slate-900 dark:text-slate-100"
                            readOnly={isPending}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">نبذة عني</label>
                        <textarea
                          rows={6}
                          defaultValue={teacherApplication?.bio || ''}
                          className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-slate-900 dark:text-slate-100"
                          readOnly={isPending}
                        />
                      </div>
                      {isPending && (
                        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                          <p className="text-sm text-amber-700 dark:text-amber-300">
                            لا يمكنك تعديل البيانات أثناء انتظار الموافقة على طلبك.
                          </p>
                        </div>
                      )}
                      <button className="bg-primary text-slate-900 font-bold py-3 px-6 rounded-lg hover:brightness-110 transition-all">
                        حفظ التغييرات
                      </button>
                    </div>
                  </div>
                )}

                {/* Qualifications Tab */}
                {activeTab === 'qualifications' && (
                  <>
                    {/* Education */}
                    <div className="bg-white dark:bg-background-dark rounded-xl p-8 border border-primary/10 shadow-sm">
                      <div className="flex items-center gap-3 mb-6">
                        <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">school</span>
                        <h3 className="text-xl font-bold">المؤهلات العلمية</h3>
                      </div>
                      <div className="space-y-6">
                        {qualifications.length > 0 ? (
                          qualifications.map((qual, index) => (
                            <div key={index} className="flex gap-4 items-start">
                              <div className="h-12 w-12 flex-shrink-0 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-primary">
                                <span className="material-symbols-outlined">history_edu</span>
                              </div>
                              <div>
                                <h4 className="font-bold text-lg">{qual.title}</h4>
                                {qual.institution && (
                                  <p className="text-slate-500 text-sm">{qual.institution} {qual.year && `- ${qual.year}`}</p>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-slate-500 text-sm">لا توجد مؤهلات مسجلة</p>
                        )}
                      </div>
                    </div>

                    {/* Ijazahs */}
                    <div className="bg-white dark:bg-background-dark rounded-xl p-8 border border-primary/10 shadow-sm">
                      <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">workspace_premium</span>
                          <h3 className="text-xl font-bold">الإجازات والسند</h3>
                        </div>
                        <button className="text-sm font-bold text-primary flex items-center gap-1 hover:underline">
                          <span className="material-symbols-outlined text-sm">add</span> إضافة إجازة
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {ijazahs.length > 0 ? (
                          ijazahs.map((ijazah, index) => (
                            <div
                              key={index}
                              className="group border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden hover:border-primary/40 transition-all"
                            >
                              <div
                                className="h-40 bg-cover bg-center"
                                style={{ backgroundImage: `url('${ijazah.image}')` }}
                              />
                              <div className="p-4">
                                <h4 className="font-bold">{ijazah.title}</h4>
                                <p className="text-sm text-slate-500">{ijazah.description}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-slate-500 text-sm">لا توجد إجازات مسجلة</p>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* Availability Tab */}
                {activeTab === 'availability' && (
                  <div className="bg-white dark:bg-background-dark rounded-xl p-8 border border-primary/10 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">event_available</span>
                        <h3 className="text-xl font-bold">جدول التوفر الأسبوعي</h3>
                      </div>
                      <div className="flex gap-2">
                        <button className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs font-bold">الأسبوع الحالي</button>
                        <button className="px-3 py-1 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">التالي</button>
                      </div>
                    </div>
                    <div className="mb-4 flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-primary/20 rounded border border-primary/30"></div>
                        <span className="text-slate-600 dark:text-slate-400">متاح</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-slate-900/10 dark:bg-slate-900/30 rounded border border-slate-900/20"></div>
                        <span className="text-slate-600 dark:text-slate-400">محجوز</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-transparent rounded border border-slate-200 dark:border-slate-700"></div>
                        <span className="text-slate-600 dark:text-slate-400">غير متاح</span>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <div className="min-w-[800px] grid grid-cols-8 border-t border-slate-100 dark:border-slate-800">
                        {/* Header Row */}
                        <div className="p-3 border-l border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50">الوقت</div>
                        {days.map((day) => (
                          <div
                            key={day}
                            className="p-3 border-l border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-center bg-slate-50 dark:bg-slate-800/50"
                          >
                            {day}
                          </div>
                        ))}
                        {/* Time Rows */}
                        {timeSlots.map((time, timeIndex) => (
                          <React.Fragment key={timeIndex}>
                            <div className="p-2 border-l border-b border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 font-medium">
                              {time}
                            </div>
                            {days.map((day, dayIndex) => {
                              const status = availability[dayIndex]?.[timeIndex]
                              return (
                                <div key={`${dayIndex}-${timeIndex}`} className="p-1 border-l border-b border-slate-100 dark:border-slate-800">
                                  {status === 'available' && (
                                    <div className="h-full w-full bg-primary/20 rounded border border-primary/30 min-h-[35px] flex items-center justify-center cursor-pointer hover:bg-primary/30 transition-colors">
                                      <span className="text-[10px] font-bold text-primary">متاح</span>
                                    </div>
                                  )}
                                  {status === 'booked' && (
                                    <div className="h-full w-full bg-slate-900/10 dark:bg-slate-900/30 rounded border border-slate-900/20 min-h-[35px] flex items-center justify-center">
                                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">محجوز</span>
                                    </div>
                                  )}
                                  {!status && (
                                    <div className="h-full w-full min-h-[35px]"></div>
                                  )}
                                </div>
                              )
                            })}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                    <div className="mt-6 flex justify-end">
                      <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors">
                        حفظ التغييرات
                      </button>
                    </div>
                  </div>
                )}

                {/* Reviews Tab */}
                {activeTab === 'reviews' && (
                  <div className="bg-white dark:bg-background-dark rounded-xl p-8 border border-primary/10 shadow-sm">
                    <div className="flex items-center gap-3 mb-8">
                      <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">reviews</span>
                      <h3 className="text-xl font-bold">آخر التقييمات</h3>
                    </div>
                    <div className="space-y-6">
                      {reviews.length > 0 ? (
                        <>
                          {reviews.map((review, index) => (
                            <div key={index} className="p-6 border border-slate-100 dark:border-slate-800 rounded-xl space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div
                                    className="h-10 w-10 rounded-full bg-slate-200 bg-cover bg-center"
                                    style={{ backgroundImage: `url('${review.avatar}')` }}
                                  />
                                  <div>
                                    <h5 className="text-sm font-bold">{review.name}</h5>
                                    <p className="text-xs text-slate-400">{review.time}</p>
                                  </div>
                                </div>
                                <div className="flex text-primary">
                                  {Array.from({ length: review.rating }).map((_, i) => (
                                    <span key={i} className="material-symbols-outlined text-sm filled">star</span>
                                  ))}
                                </div>
                              </div>
                              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{review.comment}</p>
                            </div>
                          ))}
                          <button className="w-full text-center py-2 text-primary font-bold text-sm hover:underline">
                            مشاهدة جميع التقييمات
                          </button>
                        </>
                      ) : (
                        <p className="text-slate-500 text-sm text-center py-8">لا توجد تقييمات بعد</p>
                      )}
                    </div>
                  </div>
                )}
              </section>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}

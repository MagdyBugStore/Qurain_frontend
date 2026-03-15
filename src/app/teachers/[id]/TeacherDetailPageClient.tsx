'use client'

import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'
import Header from '../../../components/layout/Header'
import BookingModal from '../../../components/modals/BookingModal'
import LoginModal from '../../../components/modals/LoginModal'
import { useAppStore } from '../../../store/useAppStore'
import { TeacherService } from '../../../features/teachers/services/teacherService'
import { getTeacherDisplayName, getTeacherTitle, getTeacherImageUrl } from '../../../shared/utils/teacher'
import type { TeacherApplication, TeacherProfile, Qualification, Review } from '../../../shared/types/teacher.types'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../../../config/firebase'
import { COLLECTIONS } from '../../../constants/firebaseCollections'

type TabType = 'personal' | 'availability' | 'reviews'

export default function TeacherDetailPageClient() {
  const { id } = useParams<{ id: string }>()
  const { user: currentUser, userProfile } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<TabType>('personal')
  const [teacherApplication, setTeacherApplication] = useState<TeacherApplication | null>(null)
  const [teacherProfile, setTeacherProfile] = useState<TeacherProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [rating, setRating] = useState(0)
  const [reviewsCount, setReviewsCount] = useState(0)
  const [reviews, setReviews] = useState<Review[]>([])
  const [qualifications, setQualifications] = useState<Qualification[]>([])
  const [availability, setAvailability] = useState<(string | null)[][]>([])
  const [bookedSlotsSet, setBookedSlotsSet] = useState<Set<string>>(new Set())

  // Fetch booked slots from subscriptions
  useEffect(() => {
    const fetchBookedSlots = async () => {
      if (!id) return

      try {
        const subscriptionsQuery = query(
          collection(db, COLLECTIONS.SUBSCRIPTIONS),
          where('teacherId', '==', id),
          where('status', '==', 'active')
        )
        
        let subscriptionsSnapshot
        try {
          subscriptionsSnapshot = await getDocs(subscriptionsQuery)
        } catch (queryError: any) {
          if (queryError?.code === 'failed-precondition' || queryError?.message?.includes('index')) {
            const fallbackQuery = query(
              collection(db, COLLECTIONS.SUBSCRIPTIONS),
              where('teacherId', '==', id)
            )
            subscriptionsSnapshot = await getDocs(fallbackQuery)
            
            const filteredDocs = subscriptionsSnapshot.docs.filter(doc => {
              const data = doc.data()
              return data.status === 'active'
            })
            
            subscriptionsSnapshot = {
              docs: filteredDocs,
              size: filteredDocs.length,
            } as any
          } else {
            return
          }
        }
        
        const booked = new Set<string>()
        subscriptionsSnapshot.docs.forEach((doc) => {
          const subscriptionData = doc.data()
          const weeklySlots = subscriptionData.weeklySlots || []
          
          weeklySlots.forEach((slot: { dayIndex: number; time: string }) => {
            const key = `${slot.dayIndex}_${slot.time}`
            booked.add(key)
          })
        })
        
        setBookedSlotsSet(booked)
      } catch (error) {
        console.error('Error fetching booked slots:', error)
      }
    }

    if (id) {
      fetchBookedSlots()
    }
  }, [id])

  // Fetch teacher data by ID using service layer
  useEffect(() => {
    const fetchTeacherData = async () => {
      if (!id) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const teacherService = new TeacherService()
        const teacherData = await teacherService.getTeacherDetailById(id)
        
        if (teacherData) {
          setTeacherApplication(teacherData.application)
          setTeacherProfile(teacherData.profile)
          setRating(teacherData.rating)
          setReviewsCount(teacherData.reviewsCount)
          setReviews(teacherData.reviews)
          setQualifications(teacherData.qualifications)
          setAvailability(teacherData.availability)
        }
      } catch (error) {
        console.error('Error fetching teacher data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTeacherData()
  }, [id])

  // Get teacher data using utility functions
  const teacherName = getTeacherDisplayName(teacherProfile, teacherApplication)
  const teacherTitle = getTeacherTitle(teacherApplication)
  const profileImage = getTeacherImageUrl(teacherProfile)
  const isApproved = teacherApplication?.status === 'approved'
  
  const sessionPrice = teacherApplication?.hourlyRate || 0
  const currency = teacherApplication?.currency === 'SAR' ? 'ر.س' : 
                   teacherApplication?.currency === 'USD' ? '$' :
                   teacherApplication?.currency === 'EGP' ? 'ج.م' : 'ر.س'

  // Availability schedule data
  const timeSlots = [
    '٠٨:٠٠ ص', '٠٩:٠٠ ص', '١٠:٠٠ ص', '١١:٠٠ ص', 
    '١٢:٠٠ م', '٠١:٠٠ م', '٠٢:٠٠ م', '٠٣:٠٠ م',
    '٠٤:٠٠ م', '٠٥:٠٠ م', '٠٦:٠٠ م', '٠٧:٠٠ م'
  ]
  const days = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة']

  const tabs = [
    { id: 'personal' as TabType, label: 'نبذة عني', icon: 'person' },
    { id: 'availability' as TabType, label: 'الأوقات المتاحة', icon: 'calendar_month' },
    { id: 'reviews' as TabType, label: 'التقييمات', icon: 'reviews' },
  ]

  const openBookingModal = useAppStore((state) => state.openBookingModal)
  
  const handleBookSession = () => {
    // Check if user is a teacher - teachers cannot book other teachers
    if (userProfile?.accountType === 'teacher') {
      alert('المعلمون لا يمكنهم حجز حصص مع معلمين آخرين')
      return
    }
    
    // Open booking modal
    if (id) {
      openBookingModal(id)
    }
  }
  
  const isTeacher = userProfile?.accountType === 'teacher'

  // Calculate total available slots for the teacher
  const calculateAvailableSlots = (): number => {
    if (!availability || availability.length === 0) {
      return 0
    }

    let availableCount = 0
    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
      const daySchedule = availability[dayIndex] || []
      for (let timeIndex = 0; timeIndex < 12; timeIndex++) {
        const slotStatus = daySchedule[timeIndex]
        // Check if slot is available and not booked
        if (slotStatus === 'available') {
          const slotTime = timeSlots[timeIndex]
          const key = `${dayIndex}_${slotTime}`
          // Only count if not booked by subscriptions
          if (!bookedSlotsSet.has(key)) {
            availableCount++
          }
        }
      }
    }
    return availableCount
  }

  const totalAvailableSlots = calculateAvailableSlots()
  const hasAvailableSlots = totalAvailableSlots > 0

  const handleSendMessage = () => {
    if (!currentUser) {
      navigate('/login')
      return
    }
    // TODO: Implement messaging
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-slate-600 dark:text-slate-400">جاري التحميل...</p>
          </div>
        </div>
      </>
    )
  }

  if (!teacherApplication || !isApproved) {
    return (
      <>
        <Header />
        <div className="flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark">
          <div className="text-center">
            <p className="text-slate-600 dark:text-slate-400 mb-4">المعلم غير موجود أو غير معتمد</p>
            <Link to="/teachers" className="text-primary hover:underline">
              العودة إلى قائمة المعلمين
            </Link>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="flex-grow container mx-auto px-4 lg:px-8 max-w-[1200px] py-6 bg-bg-main">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="text-sm text-text-light mb-6 flex items-center gap-2 font-arabic">
          <Link to="/" className="hover:text-primary transition-colors">
            الرئيسية
          </Link>
          <span className="text-gray-300">/</span>
          <Link to="/teachers" className="hover:text-primary transition-colors">
            المعلمين
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-text-dark font-medium">{teacherName}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Main Content Column */}
          <div className="space-y-6 flex-1 w-full order-1">
            {/* Profile Header */}
            <div className="bg-bg-card rounded-2xl shadow-soft p-6 relative overflow-hidden">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="flex-shrink-0 relative mx-auto md:mx-0">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-md">
                    <img
                      alt={`صورة ${teacherName}`}
                      className="w-full h-full object-cover"
                      src={profileImage}
                    />
                  </div>
                  <div className="absolute bottom-2 right-2 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                <div className="flex-grow text-center md:text-right">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                    <h1 className="text-2xl font-bold text-text-dark font-arabic">{teacherName}</h1>
                    {isApproved && (
                      <div className="flex items-center justify-center md:justify-start gap-2">
                        <span className="bg-blue-50 text-blue-600 text-xs font-semibold px-2.5 py-1 rounded-full border border-blue-100 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">verified</span>
                          تم التحقق
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-text-light text-base mb-3 leading-relaxed font-arabic">{teacherTitle}</p>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-text-muted">
                    {rating > 0 && (
                      <div className="flex items-center gap-1 text-primary">
                        <span className="material-symbols-outlined text-[18px] filled">star</span>
                        <span className="font-bold text-text-dark text-base pt-1">{rating.toFixed(1)}</span>
                        <span className="text-text-light text-xs pt-1">({reviewsCount} تقييم)</span>
                      </div>
                    )}
                    {teacherApplication.nationality && (
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[18px]">location_on</span>
                        <span>{teacherApplication.nationality}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[18px]">translate</span>
                      <span>يتحدث العربية والإنجليزية</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Video Intro */}
            <div className="rounded-2xl overflow-hidden shadow-soft relative group cursor-pointer aspect-video bg-black">
              <img
                alt="Video Thumbnail"
                className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity duration-300"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBhqaLFUgcVDuNJCHh-z1GVIdE4ak-tKUGKDWgKwgfDYLKnRPbg493jiA6nC1Q5lWG56VlQdCA8DqixPqhqwUhhw97b9SR7TFEanLVVKZsoeon4JoAnyttwIkVkpOQahnQF5ARsYL5tMY1bqMah-XplMfWVRLCzzNA2pNWIqdKfwhEij8AHF0zeEHmh4K2YyW3NtflVieWkLsaIGbWqOS2eGGrDCugWc5Z2DxLaBm46CIkSAtGtqYjZYDg1ou9nv8IQ0L_TmTZApInE"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <button className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-text-dark shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 4l12 6-12 6V4z"></path>
                  </svg>
                </button>
              </div>
            </div>

            {/* Tabs Navigation */}
            <div className="bg-bg-card rounded-t-2xl shadow-sm border-b border-gray-100">
              <div className="flex items-center px-6 overflow-x-auto no-scrollbar">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-6 py-4 whitespace-nowrap flex items-center gap-2 transition-colors ${
                      activeTab === tab.id
                        ? 'text-text-dark font-bold border-b-2 border-primary'
                        : 'text-text-light font-medium hover:text-primary'
                    }`}
                  >
                    <span className="material-symbols-outlined">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content: About */}
            {activeTab === 'personal' && (
              <div className="bg-bg-card rounded-b-2xl shadow-soft p-6 md:p-8 space-y-10">
                {/* Bio Section */}
                <section>
                  <h2 className="text-xl font-bold text-text-dark mb-4 border-r-4 border-primary pr-3 font-arabic">
                    مرحباً بكم
                  </h2>
                  <div className="text-text-light leading-8 space-y-4 font-arabic">
                    <p className="mb-4">
                      {teacherApplication.bio || 'لا توجد نبذة متاحة'}
                    </p>
                  </div>
                </section>

                {/* Student Benefits */}
                <section>
                  <h2 className="text-xl font-bold text-text-dark mb-6 border-r-4 border-primary pr-3 font-arabic">
                    ما الثمار التي سيجنيها الطالب؟
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* إتقان التلاوة */}
                    <div className="relative p-6 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                      <div className="absolute top-4 right-4">
                        <span className="material-symbols-outlined text-primary text-5xl">auto_stories</span>
                      </div>
                      <div className="mt-16 text-right">
                        <h3 className="font-bold text-text-dark text-lg mb-2 font-arabic">إتقان التلاوة</h3>
                        <p className="text-sm text-text-light leading-relaxed font-arabic">تلاوة القرآن الكريم بشكل صحيح مع تطبيق أحكام التجويد بدقة</p>
                      </div>
                    </div>
                    {/* فهم المعاني */}
                    <div className="relative p-6 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                      <div className="absolute top-4 right-4">
                        <span className="material-symbols-outlined text-primary text-5xl">lightbulb</span>
                      </div>
                      <div className="mt-16 text-right">
                        <h3 className="font-bold text-text-dark text-lg mb-2 font-arabic">فهم المعاني</h3>
                        <p className="text-sm text-text-light leading-relaxed font-arabic">فهم معاني الآيات وربطها بأحكام التجويد لتحقيق الفهم الشامل</p>
                      </div>
                    </div>
                    {/* الثقة بالنفس */}
                    <div className="relative p-6 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                      <div className="absolute top-4 right-4">
                        <span className="material-symbols-outlined text-primary text-5xl">psychology</span>
                      </div>
                      <div className="mt-16 text-right">
                        <h3 className="font-bold text-text-dark text-lg mb-2 font-arabic">الثقة بالنفس</h3>
                        <p className="text-sm text-text-light leading-relaxed font-arabic">بناء الثقة في التلاوة والقراءة الصحيحة أمام الآخرين</p>
                      </div>
                    </div>
                    {/* الحصول على الإجازة */}
                    <div className="relative p-6 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                      <div className="absolute top-4 right-4">
                        <span className="material-symbols-outlined text-primary text-5xl">workspace_premium</span>
                      </div>
                      <div className="mt-16 text-right">
                        <h3 className="font-bold text-text-dark text-lg mb-2 font-arabic">الحصول على الإجازة</h3>
                        <p className="text-sm text-text-light leading-relaxed font-arabic">نيل الإجازة بالسند المتصل إلى النبي صلى الله عليه وسلم</p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Resume / Certifications */}
                <section>
                  <h2 className="text-xl font-bold text-text-dark mb-6 border-r-4 border-primary pr-3 font-arabic">
                    المؤهلات والشهادات
                  </h2>
                  <div className="border-r-2 border-primary mr-4 pr-8 space-y-8 relative">
                    {qualifications.map((qual, index) => (
                      <div key={index} className="relative">
                        <div className="absolute -right-[39px] top-1 w-3 h-3 bg-primary rounded-full ring-4 ring-white"></div>
                        <span className="text-sm font-semibold text-primary block mb-1">{qual.year}</span>
                        <h4 className="text-base font-bold text-text-dark font-arabic">{qual.title}</h4>
                        <p className="text-sm text-text-light mt-1 font-arabic">{qual.institution}</p>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}

            {/* Availability Tab */}
            {activeTab === 'availability' && (
              <div className="bg-bg-card rounded-b-2xl shadow-soft p-6 md:p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">event_available</span>
                    <h2 className="text-xl font-bold text-text-dark border-r-4 border-primary pr-3 font-arabic">جدول التوفر الأسبوعي</h2>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 bg-gray-100 rounded text-xs font-bold text-text-dark">الأسبوع الحالي</button>
                    <button className="px-3 py-1 text-xs font-bold text-text-light hover:text-primary transition-colors">التالي</button>
                  </div>
                </div>
                <div className="mb-4 flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-primary/20 rounded border border-primary/30"></div>
                    <span className="text-text-light">متاح</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-200 rounded border border-gray-300"></div>
                    <span className="text-text-light">محجوز</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-transparent rounded border border-gray-300"></div>
                    <span className="text-text-light">غير متاح</span>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <div className="min-w-[800px] grid grid-cols-8 border-t border-gray-200">
                    <div className="p-3 border-l border-b border-gray-200 text-xs font-bold text-text-light bg-gray-50">الوقت</div>
                    {days.map((day) => (
                      <div key={day} className="p-3 border-l border-b border-gray-200 text-xs font-bold text-center bg-gray-50 text-text-dark">
                        {day}
                      </div>
                    ))}
                    {timeSlots.map((time, timeIndex) => (
                      <React.Fragment key={timeIndex}>
                        <div className="p-2 border-l border-b border-gray-200 text-xs text-text-light font-medium">
                          {time}
                        </div>
                        {days.map((day, dayIndex) => {
                          const status = availability[dayIndex]?.[timeIndex]
                          return (
                            <div key={`${dayIndex}-${timeIndex}`} className="p-1 border-l border-b border-gray-200">
                              {status === 'available' && (
                                <div className="h-full w-full bg-primary/20 rounded border border-primary/30 min-h-[35px] flex items-center justify-center">
                                  <span className="text-[10px] font-bold text-primary">متاح</span>
                                </div>
                              )}
                              {status === 'booked' && (
                                <div className="h-full w-full bg-gray-200 rounded border border-gray-300 min-h-[35px] flex items-center justify-center cursor-not-allowed opacity-60 pointer-events-none">
                                  <span className="text-[10px] font-bold text-text-light">محجوز</span>
                                </div>
                              )}
                              {!status && <div className="h-full w-full min-h-[35px]"></div>}
                            </div>
                          )
                        })}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div className="bg-bg-card rounded-2xl shadow-soft p-8">
                <div className="flex items-center gap-3 mb-8">
                  <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">reviews</span>
                  <h3 className="text-xl font-bold text-text-dark font-arabic">التقييمات</h3>
                  <div className="flex items-center gap-2 mr-auto">
                    <span className="material-symbols-outlined text-primary text-lg filled">star</span>
                    <span className="text-lg font-bold text-text-dark">{rating > 0 ? rating.toFixed(1) : '0.0'}</span>
                    <span className="text-text-light text-sm">({reviewsCount} تقييم)</span>
                  </div>
                </div>
                <div className="space-y-6">
                  {reviews.length > 0 ? (
                    reviews.map((review, index) => (
                      <div key={index} className="p-6 border border-gray-200 rounded-xl space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className="h-10 w-10 rounded-full bg-gray-100 bg-cover bg-center border border-gray-200"
                              style={{ backgroundImage: `url('${review.avatar}')` }}
                            />
                            <div>
                              <h5 className="text-sm font-bold text-text-dark">{review.name}</h5>
                              <p className="text-xs text-text-light">{review.time}</p>
                            </div>
                          </div>
                          <div className="flex text-primary">
                            {Array.from({ length: review.rating }).map((_, i) => (
                              <span key={i} className="material-symbols-outlined text-sm filled">star</span>
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-text-light leading-relaxed font-arabic">{review.comment}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-text-light text-sm text-center py-8 font-arabic">لا توجد تقييمات بعد</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Column (Sticky) */}
          <aside className="space-y-6 lg:w-80 lg:flex-shrink-0 order-2">
            {/* Pricing Card */}
            <div className="bg-bg-card rounded-2xl shadow-soft p-6 sticky top-24">
              <div className="flex items-end justify-between mb-6 border-b border-gray-100 pb-4">
                <div className="flex flex-col">
                  <span className="text-3xl font-bold text-text-dark">{sessionPrice}</span>
                  <span className="text-text-light text-sm font-arabic">{currency} / ساعة</span>
                </div>
                <div className="flex items-center gap-1 text-green-600 font-bold">
                  <span className="material-symbols-outlined text-[18px]">bolt</span>
                  <span className="text-sm font-arabic">رد سريع</span>
                </div>
              </div>
              <div className="space-y-3 mb-6">
                {hasAvailableSlots ? (
                  <>
                    <button
                      onClick={handleBookSession}
                      disabled={isTeacher}
                      className="w-full bg-primary hover:bg-primary-hover text-text-dark font-bold py-3 px-4 rounded-xl shadow-sm transition-all transform hover:-translate-y-0.5 active:translate-y-0 font-arabic disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isTeacher ? 'غير متاح للمعلمين' : 'اشترك الآن'}
                    </button>
                    {isTeacher && (
                      <p className="text-center text-xs text-text-light mt-2 font-arabic">
                        المعلمون لا يمكنهم حجز حصص مع معلمين آخرين
                      </p>
                    )}
                  </>
                ) : (
                  <div className="w-full bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <span className="material-symbols-outlined text-yellow-500 text-2xl">schedule</span>
                      <p className="text-sm font-bold text-text-dark font-arabic">لا يوجد وقت متاح</p>
                      <p className="text-xs text-text-light font-arabic">المعلم لا يمتلك أي أوقات متاحة للحجز حالياً</p>
                    </div>
                  </div>
                )}
                <button
                  onClick={handleSendMessage}
                  className="w-full bg-white border border-gray-300 hover:border-text-dark text-text-dark font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 font-arabic"
                >
                  <span className="material-symbols-outlined text-[20px]">chat</span>
                  أرسل رسالة
                </button>
              </div>
              <ul className="space-y-3 text-sm text-text-light">
                <h4 className="font-bold text-text-dark mb-3 font-arabic">ماذا تتضمن الحصة؟</h4>
                <li className="flex items-center gap-3 font-arabic">
                  <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                  <span>خطة دراسية مخصصة</span>
                </li>
                <li className="flex items-center gap-3 font-arabic">
                  <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                  <span>مواد تعليمية مجانية</span>
                </li>
                <li className="flex items-center gap-3 font-arabic">
                  <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                  <span>تسجيل صوتي للحصة للمراجعة</span>
                </li>
                <li className="flex items-center gap-3 font-arabic">
                  <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                  <span>شهادة إتمام المستوى</span>
                </li>
              </ul>
            </div>

            
          </aside>
        </div>
      </main>
      <BookingModal />
      <LoginModal />
    </>
  )
}

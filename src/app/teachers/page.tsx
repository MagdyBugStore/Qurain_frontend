'use client'
import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom'
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore'
import { db } from '../../config/firebase'
import Header from '../../components/layout/Header'
import LoginModal from '../../components/modals/LoginModal'
import Popup from '../../components/modals/Popup'
import { useAuthGuard } from '../../hooks/useRequireAuth'
import { useAuth } from '../../contexts/AuthContext'

interface Teacher {
  id: string
  name: string
  specialty: string
  description: string
  rating: number
  reviews: number
  price: number
  currency?: string
  image: string
  tags: string[]
  hours: number
  students: number
  qualification: string
  languages: string
  completedSessions: number
  gender?: string
}

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
  userId?: string
}

interface UserProfile {
  uid?: string
  firstName?: string
  lastName?: string
  displayName?: string
  photoURL?: string
  email?: string
}

// Helper function to get currency symbol
const getCurrencySymbol = (currency?: string): string => {
  if (!currency) return '$'
  switch (currency.toUpperCase()) {
    case 'SAR':
      return 'ر.س'
    case 'USD':
      return '$'
    case 'EGP':
      return 'ج.م'
    default:
      return '$'
  }
}

export default function TeachersPage() {
  const { requireAuth } = useAuthGuard()
  const { userProfile } = useAuth()
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const isTeacher = userProfile?.accountType === 'teacher'
  
  // Filter states
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])
  const [selectedGenders, setSelectedGenders] = useState<string[]>([])
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 9
  
  // Sort state
  const [sortBy, setSortBy] = useState<string>('rating')

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const q = query(
          collection(db, 'teacherApplications'), 
          where('status', '==', 'approved')
        )
        const querySnapshot = await getDocs(q)
        
        const teachersData: Teacher[] = []
        
        for (const docSnapshot of querySnapshot.docs) {
          const appData = { id: docSnapshot.id, ...docSnapshot.data() } as TeacherApplication
          
          let profileData: UserProfile | null = null
          if (appData.userId) {
            try {
              const userDoc = await getDoc(doc(db, 'users', appData.userId))
              if (userDoc.exists()) {
                profileData = userDoc.data() as UserProfile
              }
            } catch (err) {
              console.error(`Error fetching user profile for ${appData.userId}:`, err)
            }
          }

          // Fetch reviews and calculate rating if reviews collection exists
          let rating = 0
          let reviewsCount = 0
          try {
            const teacherId = appData.userId || appData.id
            const reviewsQuery = query(
              collection(db, 'reviews'),
              where('teacherId', '==', teacherId)
            )
            const reviewsSnapshot = await getDocs(reviewsQuery)
            reviewsCount = reviewsSnapshot.size
            if (reviewsCount > 0) {
              const ratings = reviewsSnapshot.docs.map(doc => doc.data().rating || 0).filter(r => r > 0)
              if (ratings.length > 0) {
                rating = ratings.reduce((sum, r) => sum + r, 0) / ratings.length
              }
            }
          } catch (err) {
            // Reviews collection might not exist or use different field names
            // Silently fail - this is expected if reviews haven't been implemented yet
            rating = 0
            reviewsCount = 0
          }

          // Fetch completed sessions count if sessions collection exists
          let completedSessionsCount = 0
          try {
            // Try different possible field names for teacher reference
            const teacherId = appData.userId || appData.id
            const sessionsQuery = query(
              collection(db, 'sessions'),
              where('teacherId', '==', teacherId),
              where('status', '==', 'completed')
            )
            const sessionsSnapshot = await getDocs(sessionsQuery)
            completedSessionsCount = sessionsSnapshot.size
          } catch (err) {
            // Sessions collection might not exist or use different field names
            // Silently fail - this is expected if sessions haven't been implemented yet
            completedSessionsCount = 0
          }

          // Handle photo URL - use profile photo if available, otherwise use default
          const teacherPhoto = profileData?.photoURL && profileData.photoURL.trim() !== '' 
            ? profileData.photoURL 
            : '/no-image.png'

          teachersData.push({
            id: appData.userId || appData.id,
            name: profileData?.displayName || appData.fullName || 'المعلم',
            specialty: appData.subjects?.join('، ') || 'معلم قرآن',
            description: appData.bio || '',
            rating: rating || 0,
            reviews: reviewsCount,
            price: appData.hourlyRate || 0,
            currency: appData.currency || 'USD',
            image: teacherPhoto,
            tags: appData.subjects || [],
            hours: appData.yearsOfExperience || 0,
            students: 0, // Can be calculated from unique student IDs in sessions if needed
            qualification: appData.educationLevel || '',
            languages: 'العربية', // Default language
            completedSessions: completedSessionsCount,
            gender: appData.gender
          })
        }
        
        setTeachers(teachersData)
      } catch (error) {
        console.error('Error fetching teachers:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTeachers()
  }, [])

  const handleBookTrial = () => {
    requireAuth(() => {
      // Proceed with booking logic after authentication
      console.log('Booking trial session...')
    })
  }

  // Filter and sort teachers
  const filteredTeachers = React.useMemo(() => {
    let filtered = [...teachers]

    // Filter by subjects
    if (selectedSubjects.length > 0) {
      filtered = filtered.filter(teacher => 
        teacher.tags.some(tag => selectedSubjects.includes(tag))
      )
    }

    // Filter by gender
    if (selectedGenders.length > 0) {
      filtered = filtered.filter(teacher => {
        if (!teacher.gender) return false
        const genderLower = teacher.gender.toLowerCase()
        const genderMap: { [key: string]: string } = {
          'male': 'معلم',
          'female': 'معلمة',
          'ذكر': 'معلم',
          'أنثى': 'معلمة',
          'معلم': 'معلم',
          'معلمة': 'معلمة'
        }
        // Try lowercase first, then original value, then direct match
        const normalizedGender = genderMap[genderLower] || genderMap[teacher.gender] || teacher.gender
        return selectedGenders.includes(normalizedGender)
      })
    }

    // Sort teachers
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price
        case 'price-high':
          return b.price - a.price
        case 'rating':
          return b.rating - a.rating
        case 'experience':
          return b.completedSessions - a.completedSessions
        default:
          return b.rating - a.rating
      }
    })

    return filtered
  }, [teachers, selectedSubjects, selectedGenders, sortBy])

  // Pagination
  const totalPages = Math.ceil(filteredTeachers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedTeachers = filteredTeachers.slice(startIndex, endIndex)

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1)
  }, [selectedSubjects, selectedGenders, sortBy])

  // Handle subject filter
  const handleSubjectToggle = (subject: string) => {
    if (subject === 'الكل') {
      setSelectedSubjects([])
    } else {
      setSelectedSubjects(prev => 
        prev.includes(subject) 
          ? prev.filter(s => s !== subject)
          : [...prev, subject]
      )
    }
  }

  // Handle gender filter
  const handleGenderToggle = (gender: string) => {
    setSelectedGenders(prev => 
      prev.includes(gender)
        ? prev.filter(g => g !== gender)
        : [...prev, gender]
    )
  }

  // Clear all filters
  const handleClearFilters = () => {
    setSelectedSubjects([])
    setSelectedGenders([])
  }

  // Get all unique subjects from teachers
  const allSubjects = React.useMemo(() => {
    const subjectsSet = new Set<string>()
    teachers.forEach(teacher => {
      teacher.tags.forEach(tag => subjectsSet.add(tag))
    })
    return Array.from(subjectsSet)
  }, [teachers])

  return (
    <>
      <Header />
      <main className="flex-grow layout-container px-4 sm:px-10 py-6 max-w-[1400px] mx-auto w-full">
        {/* Breadcrumbs */}
        <div className="flex flex-wrap gap-2 mb-6 font-arabic">
          <Link to="/" className="text-[#8a8060] text-sm font-medium leading-normal hover:text-primary">
            الرئيسية
          </Link>
          <span className="text-[#8a8060] text-sm font-medium leading-normal">/</span>
          <span className="text-[#181611] dark:text-white text-sm font-medium leading-normal">المعلمون</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Mobile Filter Overlay */}
          {isFilterOpen && (
            <button
              type="button"
              aria-label="Close filter"
              className="lg:hidden fixed inset-0 bg-black/30 z-40"
              onClick={() => setIsFilterOpen(false)}
            />
          )}
          {/* Filters Sidebar */}
          <aside className={`w-full lg:w-72 flex-shrink-0 space-y-6 transition-transform duration-300 ${isFilterOpen ? 'fixed lg:relative top-0 right-0 h-full lg:h-auto overflow-y-auto lg:overflow-visible bg-white dark:bg-[#1a170d] z-50 lg:z-auto p-4 lg:p-0 block max-w-sm lg:max-w-none' : 'hidden lg:block'}`}>
            <div className="bg-white dark:bg-[#1a170d] rounded-xl p-5 shadow-sm border border-[#e6e2de] dark:border-[#3a3528]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg font-arabic text-[#181611] dark:text-white">
                  تصفية النتائج
                </h3>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleClearFilters}
                    className="text-primary text-sm font-medium hover:underline font-arabic"
                  >
                    مسح الكل
                  </button>
                  <button
                    onClick={() => setIsFilterOpen(false)}
                    className="lg:hidden text-text-main hover:text-primary p-1"
                    aria-label="Close filter"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
              </div>
              {/* Subjects Filter */}
              <div className="mb-6">
                <h4 className="font-medium mb-3 text-sm text-[#8a8060] font-arabic">المادة التعليمية</h4>
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => handleSubjectToggle('الكل')}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium font-arabic border transition-colors ${
                      selectedSubjects.length === 0
                        ? 'bg-primary text-[#181611] border-primary'
                        : 'bg-white dark:bg-[#2d2a24] text-[#181611] dark:text-[#dadada] border-[#e6e2de] dark:border-[#4d4738] hover:border-primary'
                    }`}
                  >
                    الكل
                  </button>
                  {allSubjects.length > 0 ? (
                    allSubjects.map((subject) => (
                      <button
                        key={subject}
                        onClick={() => handleSubjectToggle(subject)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium font-arabic border transition-colors ${
                          selectedSubjects.includes(subject)
                            ? 'bg-primary text-[#181611] border-primary'
                            : 'bg-white dark:bg-[#2d2a24] text-[#181611] dark:text-[#dadada] border-[#e6e2de] dark:border-[#4d4738] hover:border-primary'
                        }`}
                      >
                        {subject}
                      </button>
                    ))
                  ) : (
                    <>
                      <button 
                        onClick={() => handleSubjectToggle('تجويد')}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium font-arabic border transition-colors ${
                          selectedSubjects.includes('تجويد')
                            ? 'bg-primary text-[#181611] border-primary'
                            : 'bg-white dark:bg-[#2d2a24] text-[#181611] dark:text-[#dadada] border-[#e6e2de] dark:border-[#4d4738] hover:border-primary'
                        }`}
                      >
                        تجويد
                      </button>
                      <button 
                        onClick={() => handleSubjectToggle('حفظ')}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium font-arabic border transition-colors ${
                          selectedSubjects.includes('حفظ')
                            ? 'bg-primary text-[#181611] border-primary'
                            : 'bg-white dark:bg-[#2d2a24] text-[#181611] dark:text-[#dadada] border-[#e6e2de] dark:border-[#4d4738] hover:border-primary'
                        }`}
                      >
                        حفظ
                      </button>
                      <button 
                        onClick={() => handleSubjectToggle('لغة عربية')}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium font-arabic border transition-colors ${
                          selectedSubjects.includes('لغة عربية')
                            ? 'bg-primary text-[#181611] border-primary'
                            : 'bg-white dark:bg-[#2d2a24] text-[#181611] dark:text-[#dadada] border-[#e6e2de] dark:border-[#4d4738] hover:border-primary'
                        }`}
                      >
                        لغة عربية
                      </button>
                      <button 
                        onClick={() => handleSubjectToggle('قراءات')}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium font-arabic border transition-colors ${
                          selectedSubjects.includes('قراءات')
                            ? 'bg-primary text-[#181611] border-primary'
                            : 'bg-white dark:bg-[#2d2a24] text-[#181611] dark:text-[#dadada] border-[#e6e2de] dark:border-[#4d4738] hover:border-primary'
                        }`}
                      >
                        قراءات
                      </button>
                    </>
                  )}
                </div>
              </div>
              {/* Gender Filter */}
              <div className="mb-6">
                <h4 className="font-medium mb-3 text-sm text-[#8a8060] font-arabic">جنس المعلم</h4>
                <div className="space-y-2 font-arabic">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center">
                      <input
                        className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-[#8a8060] checked:bg-primary checked:border-primary transition-all"
                        type="checkbox"
                        checked={selectedGenders.includes('معلم')}
                        onChange={() => handleGenderToggle('معلم')}
                      />
                      <span className="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <svg
                          className="h-3.5 w-3.5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            clipRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            fillRule="evenodd"
                          />
                        </svg>
                      </span>
                    </div>
                    <span className="text-[#181611] dark:text-[#dadada] group-hover:text-primary transition-colors">
                      معلم
                    </span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center">
                      <input
                        className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-[#8a8060] checked:bg-primary checked:border-primary transition-all"
                        type="checkbox"
                        checked={selectedGenders.includes('معلمة')}
                        onChange={() => handleGenderToggle('معلمة')}
                      />
                      <span className="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <svg
                          className="h-3.5 w-3.5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            clipRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            fillRule="evenodd"
                          />
                        </svg>
                      </span>
                    </div>
                    <span className="text-[#181611] dark:text-[#dadada] group-hover:text-primary transition-colors">
                      معلمة
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </aside>

          {/* Grid Content */}
          <div className="flex-grow">
            {/* Sorting Bar */}
            <div className="flex flex-wrap items-center justify-between mb-6 pb-4 border-b border-[#e6e2de] dark:border-[#3a3528]">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="lg:hidden flex items-center gap-2 px-3 py-2 rounded-lg border border-[#e6e2de] dark:border-[#3a3528] bg-white dark:bg-[#1a170d] text-[#181611] dark:text-white hover:bg-[#f5f3f0] dark:hover:bg-[#2d2a24] transition-colors font-arabic"
                  aria-label="Toggle filter"
                >
                  <span className="material-symbols-outlined text-lg">tune</span>
                  <span className="text-sm font-medium">تصفية</span>
                </button>
                <p className="text-[#8a8060] font-arabic text-sm">
                  <span className="font-bold text-[#181611] dark:text-white">{filteredTeachers.length}</span> معلم متاح
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#8a8060] font-arabic">ترتيب حسب:</span>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent border-none text-[#181611] dark:text-white font-medium text-sm focus:ring-0 cursor-pointer font-arabic pr-0 pl-8"
                >
                  <option value="rating">الأعلى تقييماً</option>
                  <option value="price-low">السعر: الأقل للأعلى</option>
                  <option value="price-high">السعر: الأعلى للأقل</option>
                  <option value="experience">الأكثر خبرة</option>
                </select>
              </div>
            </div>
            {/* Cards Grid */}
            {loading ? (
              <div className="flex justify-center items-center h-64 w-full">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : paginatedTeachers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center w-full">
                <span className="material-symbols-outlined text-4xl text-[#8a8060] mb-4">search_off</span>
                <p className="text-lg text-[#181611] dark:text-white font-arabic">لا يوجد معلمين متاحين حالياً</p>
                <p className="text-sm text-[#8a8060] mt-2 font-arabic">يرجى المحاولة لاحقاً أو تغيير خيارات البحث</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 justify-items-center items-center">
                {paginatedTeachers.map((teacher) => (
                  <Link
                    key={teacher.id}
                    to={`/teachers/${teacher.id}`}
                    className="bg-white dark:bg-[#1a170d] rounded-xl border border-[#e6e2de] dark:border-[#3a3528] overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full cursor-pointer max-w-sm w-full"
                  >
                    <div className="p-5 flex flex-col h-full">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-14 h-14 rounded-full bg-gray-200 overflow-hidden flex-shrink-0"
                            style={{
                              backgroundImage: `url(${teacher.image})`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                            }}
                          />
                          <div>
                            <h3 className="font-bold text-[#181611] dark:text-white font-arabic text-lg leading-tight">
                              {teacher.name}
                            </h3>
                            <div className="flex items-center gap-1 mt-1">
                              <span className="material-symbols-outlined text-primary text-sm filled">star</span>
                              <span className="text-sm font-bold text-[#181611] dark:text-white">
                                {teacher.rating}
                              </span>
                              <span className="text-xs text-[#8a8060]">({teacher.reviews})</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-lg font-bold text-primary font-arabic">
                            {teacher.price} {getCurrencySymbol(teacher.currency)}
                          </span>
                          <span className="text-[10px] text-[#8a8060] font-arabic">/ساعة</span>
                        </div>
                      </div>
                      <div className="space-y-2 mb-4 flex-grow">
                        <div className="flex items-center gap-2 text-sm text-[#4d4738] dark:text-[#a09a8a] font-arabic">
                          <span className="material-symbols-outlined text-base">school</span>
                          <span>{teacher.qualification}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-[#4d4738] dark:text-[#a09a8a] font-arabic">
                          <span className="material-symbols-outlined text-base">translate</span>
                          <span>يتحدث: {teacher.languages}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-[#4d4738] dark:text-[#a09a8a] font-arabic">
                          <span className="material-symbols-outlined text-base">schedule</span>
                          <span>{teacher.completedSessions}+ حصة مكتملة</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {teacher.tags.map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="px-2 py-1 bg-[#f5f3f0] dark:bg-[#2d2a24] text-[#8a8060] text-xs rounded font-arabic"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      {!isTeacher && (
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleBookTrial()
                          }}
                          className="w-full py-2.5 rounded-lg border-2 border-primary text-[#181611] dark:text-white font-bold text-sm hover:bg-primary hover:text-white transition-all font-arabic mt-auto text-center"
                        >
                          احجز الان
                        </button>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-12 mb-6">
                <div className="flex items-center gap-2 font-arabic">
                  <button 
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#e6e2de] dark:border-[#3a3528] bg-white dark:bg-[#1a170d] text-[#8a8060] hover:bg-[#f5f3f0] dark:hover:bg-[#2d2a24] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    // Show first page, last page, current page, and pages around current
                    const showPage = 
                      page === 1 || 
                      page === totalPages || 
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    
                    if (!showPage) {
                      // Show ellipsis
                      if (page === currentPage - 2 || page === currentPage + 2) {
                        return (
                          <span key={page} className="text-[#8a8060] px-2">
                            ...
                          </span>
                        )
                      }
                      return null
                    }
                    
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 flex items-center justify-center rounded-lg border border-[#e6e2de] dark:border-[#3a3528] font-bold transition-colors ${
                          currentPage === page
                            ? 'bg-primary text-[#181611]'
                            : 'bg-white dark:bg-[#1a170d] text-[#181611] dark:text-white hover:bg-[#f5f3f0] dark:hover:bg-[#2d2a24]'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  })}
                  <button 
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#e6e2de] dark:border-[#3a3528] bg-white dark:bg-[#1a170d] text-[#8a8060] hover:bg-[#f5f3f0] dark:hover:bg-[#2d2a24] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined">chevron_left</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <LoginModal />
      <Popup />
    </>
  )
}

'use client'

import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom'
import { collection, query, where, getDocs, doc as firestoreDoc, updateDoc, addDoc, deleteDoc, getDoc, setDoc, serverTimestamp, orderBy, limit } from 'firebase/firestore'
import { db } from '../../config/firebase'
import { useAuth } from '../../contexts/AuthContext'
import Header from '../../components/layout/Header'
import type { TeacherApplication, TeacherProfile, Qualification } from '../../shared/types/teacher.types'
import { getTeacherDisplayName, getTeacherTitle, getTeacherImageUrl, getTeacherSpecialization, getTeacherQualifications } from '../../shared/utils/teacher'
import { TeacherRepository } from '../../infrastructure/firebase/repositories/TeacherRepository'

type TabType = 'personal' | 'qualifications' | 'availability' | 'reviews' | 'wallet' | 'support'

export default function TeacherProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [activeQuickTab, setActiveQuickTab] = useState<'wallet' | 'support' | null>(null)
  const { user, userProfile } = useAuth()
  const [teacherApplication, setTeacherApplication] = useState<TeacherApplication | null>(null)
  const [teacherProfile, setTeacherProfile] = useState<TeacherProfile | null>(null)
  const [rating, setRating] = useState(0)
  const [reviewsCount, setReviewsCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [editableQualifications, setEditableQualifications] = useState<Qualification[]>([])
  const [editableIjazahs, setEditableIjazahs] = useState<Array<{ id?: string; title: string; description: string; image: string }>>([])
  const [editableAvailability, setEditableAvailability] = useState<(string | null)[][]>([])
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [personalInfo, setPersonalInfo] = useState({
    teachingStyle: '',
    sessionContent: '',
    introVideo: ''
  })
  // Wallet state
  const [walletBalance, setWalletBalance] = useState(0)
  const [walletCurrency, setWalletCurrency] = useState('SAR')
  const [walletTransactions, setWalletTransactions] = useState<any[]>([])
  const [walletWithdrawals, setWalletWithdrawals] = useState<any[]>([])
  const [showWithdrawalForm, setShowWithdrawalForm] = useState(false)
  const [withdrawalForm, setWithdrawalForm] = useState({
    amount: '',
    bankName: '',
    accountNumber: '',
    iban: ''
  })
  // Support state
  const [supportTickets, setSupportTickets] = useState<any[]>([])
  const [selectedTicket, setSelectedTicket] = useState<any>(null)
  const [showNewTicketForm, setShowNewTicketForm] = useState(false)
  const [newTicket, setNewTicket] = useState({
    subject: '',
    message: '',
    category: 'technical',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent'
  })
  const [replyMessage, setReplyMessage] = useState('')

  // Fetch teacher application data, profile, and ratings
  useEffect(() => {
    const fetchTeacherData = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        const repository = new TeacherRepository()
        
        // Fetch teacher application
        const applicationsQuery = query(
          collection(db, 'teacherApplications'),
          where('userId', '==', user.uid)
        )
        const querySnapshot = await getDocs(applicationsQuery)
        
        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0]
          const appData = {
            id: doc.id,
            ...doc.data()
          } as TeacherApplication
          
          setTeacherApplication(appData)

          // Fetch user profile
          if (appData.userId) {
            try {
              const profile = await repository.getUserProfile(appData.userId)
              setTeacherProfile(profile)
            } catch (error) {
              console.error('Error fetching user profile:', error)
            }
          }

          // Fetch rating and reviews count
          const teacherId = appData.userId || appData.id
          try {
            const { rating: avgRating, count: count } = await repository.getTeacherRating(teacherId)
            setRating(avgRating)
            setReviewsCount(count)
          } catch (error) {
            console.error('Error fetching rating:', error)
          }

          // Fetch qualifications
          const quals = getTeacherQualifications(appData)
          setEditableQualifications(quals)

          // Set personal info fields
          setPersonalInfo({
            teachingStyle: appData.teachingStyle || '',
            sessionContent: appData.sessionContent || '',
            introVideo: appData.introVideo || ''
          })

          // Fetch ijazahs from separate collection
          try {
            const ijazahsQuery = query(
              collection(db, 'teacherIjazahs'),
              where('teacherId', '==', teacherId)
            )
            const ijazahsSnapshot = await getDocs(ijazahsQuery)
            const ijazahsData = ijazahsSnapshot.docs.map(docSnapshot => ({
              id: docSnapshot.id,
              ...docSnapshot.data()
            })) as Array<{ id: string; title: string; description: string; image: string }>
            setEditableIjazahs(ijazahsData)
          } catch (error) {
            console.error('Error fetching ijazahs:', error)
          }

          // Fetch availability from separate collection
          try {
            const availabilityDocRef = firestoreDoc(db, 'teacherAvailability', teacherId)
            const availabilityDoc = await getDoc(availabilityDocRef)
            if (availabilityDoc.exists()) {
              const data = availabilityDoc.data() as { schedule?: (string | null)[][] }
              setEditableAvailability(data.schedule || [])
            } else {
              // Initialize with empty schedule if not exists
              const initialAvailability: (string | null)[][] = Array(7).fill(null).map(() => Array(12).fill(null))
              setEditableAvailability(initialAvailability)
            }
          } catch (error) {
            console.error('Error fetching availability:', error)
            // Initialize with empty schedule on error
            const initialAvailability: (string | null)[][] = Array(7).fill(null).map(() => Array(12).fill(null))
            setEditableAvailability(initialAvailability)
          }

          // Fetch wallet data
          try {
            const walletQuery = query(
              collection(db, 'teacherWallets'),
              where('teacherId', '==', teacherId)
            )
            const walletSnapshot = await getDocs(walletQuery)
            if (!walletSnapshot.empty) {
              const walletData = walletSnapshot.docs[0].data()
              setWalletBalance(walletData.balance || 0)
              setWalletCurrency(walletData.currency || 'SAR')
            }

            // Fetch transactions
            const transactionsQuery = query(
              collection(db, 'teacherTransactions'),
              where('teacherId', '==', teacherId),
              orderBy('createdAt', 'desc'),
              limit(10)
            )
            const transactionsSnapshot = await getDocs(transactionsQuery)
            setWalletTransactions(transactionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))

            // Fetch withdrawal requests
            const withdrawalsQuery = query(
              collection(db, 'withdrawalRequests'),
              where('teacherId', '==', teacherId),
              orderBy('createdAt', 'desc'),
              limit(10)
            )
            const withdrawalsSnapshot = await getDocs(withdrawalsQuery)
            setWalletWithdrawals(withdrawalsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
          } catch (error) {
            console.error('Error fetching wallet data:', error)
          }

          // Fetch support tickets
          try {
            const ticketsQuery = query(
              collection(db, 'supportTickets'),
              where('userId', '==', user.uid),
              orderBy('createdAt', 'desc'),
              limit(10)
            )
            const ticketsSnapshot = await getDocs(ticketsQuery)
            const ticketsData = await Promise.all(
              ticketsSnapshot.docs.map(async (docSnapshot) => {
                const ticketData: any = { id: docSnapshot.id, ...docSnapshot.data() }
                // Fetch replies
                const repliesQuery = query(
                  collection(db, 'supportTickets', docSnapshot.id, 'replies'),
                  orderBy('createdAt', 'asc')
                )
                const repliesSnapshot = await getDocs(repliesQuery)
                ticketData.replies = repliesSnapshot.docs.map(replyDoc => ({
                  id: replyDoc.id,
                  ...replyDoc.data()
                }))
                return ticketData
              })
            )
            setSupportTickets(ticketsData)
          } catch (error) {
            console.error('Error fetching support tickets:', error)
          }
        } else {
          // If no application found, still try to get profile
          if (user.uid) {
            try {
              const profile = await repository.getUserProfile(user.uid)
              setTeacherProfile(profile)
            } catch (error) {
              console.error('Error fetching user profile:', error)
            }
          }
        }
      } catch (error) {
        console.error('Error fetching teacher data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTeacherData()
  }, [user])

  // Use utility functions to get teacher data (matching TeacherDetailHeader)
  const teacherName = getTeacherDisplayName(teacherProfile || userProfile, teacherApplication)
  const teacherTitle = getTeacherTitle(teacherApplication)
  const profileImage = getTeacherImageUrl(teacherProfile || userProfile)
  const specialization = getTeacherSpecialization(teacherApplication)
  const qualifications = getTeacherQualifications(teacherApplication)
  
  const sessionPrice = teacherApplication?.hourlyRate || 0
  const currency = teacherApplication?.currency === 'SAR' ? 'ر.س' : 
                   teacherApplication?.currency === 'USD' ? '$' :
                   teacherApplication?.currency === 'EGP' ? 'ج.م' : 'ر.س'
  
  const isPending = teacherApplication?.status === 'pending'
  const isApproved = teacherApplication?.status === 'approved'

  // Helper function to show save message
  const showSaveMessage = (type: 'success' | 'error', text: string) => {
    setSaveMessage({ type, text })
    setTimeout(() => setSaveMessage(null), 3000)
  }

  // Save qualifications
  const handleSaveQualifications = async () => {
    if (!teacherApplication?.id || !user) return

    setSaving(true)
    try {
      const teacherId = teacherApplication.userId || teacherApplication.id
      await updateDoc(firestoreDoc(db, 'teacherApplications', teacherApplication.id), {
        qualifications: editableQualifications,
        updatedAt: serverTimestamp()
      })
      showSaveMessage('success', 'تم حفظ المؤهلات بنجاح')
    } catch (error) {
      console.error('Error saving qualifications:', error)
      showSaveMessage('error', 'حدث خطأ أثناء حفظ المؤهلات')
    } finally {
      setSaving(false)
    }
  }

  // Add new qualification
  const handleAddQualification = () => {
    setEditableQualifications([...editableQualifications, { title: '', institution: '', year: '' }])
  }

  // Update qualification
  const handleUpdateQualification = (index: number, field: keyof Qualification, value: string) => {
    const updated = [...editableQualifications]
    updated[index] = { ...updated[index], [field]: value }
    setEditableQualifications(updated)
  }

  // Delete qualification
  const handleDeleteQualification = (index: number) => {
    setEditableQualifications(editableQualifications.filter((_, i) => i !== index))
  }

  // Save ijazahs
  const handleSaveIjazahs = async () => {
    if (!teacherApplication?.id || !user) return

    setSaving(true)
    try {
      const teacherId = teacherApplication.userId || teacherApplication.id
      
      // Delete removed ijazahs
      const currentIjazahs = await getDocs(query(collection(db, 'teacherIjazahs'), where('teacherId', '==', teacherId)))
      const currentIds = currentIjazahs.docs.map(d => d.id)
      const newIds = editableIjazahs.filter(i => i.id).map(i => i.id!)
      const toDelete = currentIds.filter(id => !newIds.includes(id))
      
      for (const id of toDelete) {
        await deleteDoc(firestoreDoc(db, 'teacherIjazahs', id))
      }

      // Add/update ijazahs
      for (const ijazah of editableIjazahs) {
        if (ijazah.id) {
          // Update existing
          await updateDoc(firestoreDoc(db, 'teacherIjazahs', ijazah.id), {
            title: ijazah.title,
            description: ijazah.description,
            image: ijazah.image,
            updatedAt: serverTimestamp()
          })
        } else {
          // Add new
          await addDoc(collection(db, 'teacherIjazahs'), {
            teacherId,
            title: ijazah.title,
            description: ijazah.description,
            image: ijazah.image,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          })
        }
      }

      showSaveMessage('success', 'تم حفظ الإجازات بنجاح')
      
      // Refresh ijazahs list
      const ijazahsQuery = query(collection(db, 'teacherIjazahs'), where('teacherId', '==', teacherId))
      const ijazahsSnapshot = await getDocs(ijazahsQuery)
      const ijazahsData = ijazahsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Array<{ id: string; title: string; description: string; image: string }>
      setEditableIjazahs(ijazahsData)
    } catch (error) {
      console.error('Error saving ijazahs:', error)
      showSaveMessage('error', 'حدث خطأ أثناء حفظ الإجازات')
    } finally {
      setSaving(false)
    }
  }

  // Add new ijazah
  const handleAddIjazah = () => {
    setEditableIjazahs([...editableIjazahs, { title: '', description: '', image: '' }])
  }

  // Update ijazah
  const handleUpdateIjazah = (index: number, field: string, value: string) => {
    const updated = [...editableIjazahs]
    updated[index] = { ...updated[index], [field]: value }
    setEditableIjazahs(updated)
  }

  // Delete ijazah
  const handleDeleteIjazah = (index: number) => {
    setEditableIjazahs(editableIjazahs.filter((_, i) => i !== index))
  }

  // Save personal info
  const handleSavePersonalInfo = async () => {
    if (!teacherApplication?.id || !user) return

    setSaving(true)
    try {
      await updateDoc(firestoreDoc(db, 'teacherApplications', teacherApplication.id), {
        teachingStyle: personalInfo.teachingStyle,
        sessionContent: personalInfo.sessionContent,
        introVideo: personalInfo.introVideo,
        updatedAt: serverTimestamp()
      })
      showSaveMessage('success', 'تم حفظ البيانات بنجاح')
    } catch (error) {
      console.error('Error saving personal info:', error)
      showSaveMessage('error', 'حدث خطأ أثناء حفظ البيانات')
    } finally {
      setSaving(false)
    }
  }

  // Handle withdrawal submission
  const handleWithdrawalSubmit = async () => {
    if (!user || !teacherApplication?.id) return

    const amount = parseFloat(withdrawalForm.amount)
    if (amount <= 0 || amount > walletBalance) {
      showSaveMessage('error', 'المبلغ غير صحيح')
      return
    }

    if (!withdrawalForm.bankName || !withdrawalForm.accountNumber) {
      showSaveMessage('error', 'يرجى إدخال جميع البيانات المطلوبة')
      return
    }

    setSaving(true)
    try {
      const teacherId = teacherApplication.userId || teacherApplication.id
      await addDoc(collection(db, 'withdrawalRequests'), {
        teacherId,
        amount,
        currency: walletCurrency,
        bankName: withdrawalForm.bankName,
        accountNumber: withdrawalForm.accountNumber,
        iban: withdrawalForm.iban || '',
        status: 'pending',
        createdAt: serverTimestamp()
      })

      // Update wallet balance
      const walletQuery = query(
        collection(db, 'teacherWallets'),
        where('teacherId', '==', teacherId)
      )
      const walletSnapshot = await getDocs(walletQuery)
      if (!walletSnapshot.empty) {
        await updateDoc(firestoreDoc(db, 'teacherWallets', walletSnapshot.docs[0].id), {
          balance: walletBalance - amount,
          updatedAt: serverTimestamp()
        })
        setWalletBalance(walletBalance - amount)
      }

      setShowWithdrawalForm(false)
      setWithdrawalForm({ amount: '', bankName: '', accountNumber: '', iban: '' })
      showSaveMessage('success', 'تم إرسال طلب السحب بنجاح')
    } catch (error) {
      console.error('Error submitting withdrawal request:', error)
      showSaveMessage('error', 'حدث خطأ أثناء إرسال طلب السحب')
    } finally {
      setSaving(false)
    }
  }

  // Handle create ticket
  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    if (!newTicket.subject || !newTicket.message) {
      showSaveMessage('error', 'يرجى إدخال جميع البيانات المطلوبة')
      return
    }

    setSaving(true)
    try {
      const ticketData = {
        userId: user.uid,
        userName: userProfile?.displayName || user.email || 'مستخدم',
        subject: newTicket.subject,
        message: newTicket.message,
        category: newTicket.category,
        priority: newTicket.priority,
        status: 'open',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }

      const docRef = await addDoc(collection(db, 'supportTickets'), ticketData)
      
      setShowNewTicketForm(false)
      setNewTicket({ subject: '', message: '', category: 'technical', priority: 'medium' })
      showSaveMessage('success', 'تم إنشاء التذكرة بنجاح')
      
      // Refresh tickets
      const ticketsQuery = query(
        collection(db, 'supportTickets'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(10)
      )
      const ticketsSnapshot = await getDocs(ticketsQuery)
      const ticketsData = await Promise.all(
        ticketsSnapshot.docs.map(async (docSnapshot) => {
          const ticketData: any = { id: docSnapshot.id, ...docSnapshot.data() }
          const repliesQuery = query(
            collection(db, 'supportTickets', docSnapshot.id, 'replies'),
            orderBy('createdAt', 'asc')
          )
          const repliesSnapshot = await getDocs(repliesQuery)
          ticketData.replies = repliesSnapshot.docs.map(replyDoc => ({
            id: replyDoc.id,
            ...replyDoc.data()
          }))
          return ticketData
        })
      )
      setSupportTickets(ticketsData)
    } catch (error) {
      console.error('Error creating ticket:', error)
      showSaveMessage('error', 'حدث خطأ أثناء إنشاء التذكرة')
    } finally {
      setSaving(false)
    }
  }

  // Handle send reply
  const handleSendReply = async () => {
    if (!user || !selectedTicket || !replyMessage.trim()) return

    setSaving(true)
    try {
      const replyData = {
        message: replyMessage,
        sender: 'user',
        senderName: userProfile?.displayName || user.email || 'مستخدم',
        createdAt: serverTimestamp()
      }

      await addDoc(
        collection(db, 'supportTickets', selectedTicket.id, 'replies'),
        replyData
      )

      await updateDoc(firestoreDoc(db, 'supportTickets', selectedTicket.id), {
        status: 'in_progress',
        updatedAt: serverTimestamp()
      })

      setReplyMessage('')
      showSaveMessage('success', 'تم إرسال الرد بنجاح')
      
      // Refresh selected ticket
      const ticketDoc = await getDoc(firestoreDoc(db, 'supportTickets', selectedTicket.id))
      if (ticketDoc.exists()) {
        const ticketData: any = { id: ticketDoc.id, ...ticketDoc.data() }
        const repliesQuery = query(
          collection(db, 'supportTickets', selectedTicket.id, 'replies'),
          orderBy('createdAt', 'asc')
        )
        const repliesSnapshot = await getDocs(repliesQuery)
        ticketData.replies = repliesSnapshot.docs.map(replyDoc => ({
          id: replyDoc.id,
          ...replyDoc.data()
        }))
        setSelectedTicket(ticketData)
      }
    } catch (error) {
      console.error('Error sending reply:', error)
      showSaveMessage('error', 'حدث خطأ أثناء إرسال الرد')
    } finally {
      setSaving(false)
    }
  }

  // Toggle availability slot
  const handleToggleAvailability = (dayIndex: number, timeIndex: number) => {
    if (isPending) return
    
    const updated = editableAvailability.map((day, dIdx) => {
      if (dIdx === dayIndex) {
        return day.map((slot, tIdx) => {
          if (tIdx === timeIndex) {
            // Cycle through: null -> 'available' -> null (skip 'booked' as it's set by bookings)
            if (slot === null) return 'available'
            if (slot === 'available') return null
            return slot // Keep 'booked' as is
          }
          return slot
        })
      }
      return day
    })
    setEditableAvailability(updated)
  }

  // Save availability
  const handleSaveAvailability = async () => {
    if (!teacherApplication?.id || !user) return

    setSaving(true)
    try {
      const teacherId = teacherApplication.userId || teacherApplication.id
      const availabilityDocRef = firestoreDoc(db, 'teacherAvailability', teacherId)
      
      // Try to update first, if fails use setDoc with merge
      try {
        await updateDoc(availabilityDocRef, {
          schedule: editableAvailability,
          updatedAt: serverTimestamp()
        })
        showSaveMessage('success', 'تم حفظ جدول التوفر بنجاح')
      } catch (updateError: any) {
        // If document doesn't exist, create it using setDoc with merge
        await setDoc(availabilityDocRef, {
          teacherId,
          schedule: editableAvailability,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }, { merge: true })
        showSaveMessage('success', 'تم حفظ جدول التوفر بنجاح')
      }
    } catch (error) {
      console.error('Error saving availability:', error)
      showSaveMessage('error', 'حدث خطأ أثناء حفظ جدول التوفر')
    } finally {
      setSaving(false)
    }
  }

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

  // Availability schedule data
  const timeSlots = [
    '٠٨:٠٠ ص', '٠٩:٠٠ ص', '١٠:٠٠ ص', '١١:٠٠ ص', 
    '١٢:٠٠ م', '٠١:٠٠ م', '٠٢:٠٠ م', '٠٣:٠٠ م',
    '٠٤:٠٠ م', '٠٥:٠٠ م', '٠٦:٠٠ م', '٠٧:٠٠ م'
  ]
  const days = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة']
  
  // Use editable availability, fallback to empty if not loaded
  const availability = editableAvailability.length > 0 ? editableAvailability : Array(7).fill(null).map(() => Array(12).fill(null))

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
        <main className="flex-1 container py-8 ">
          {/* Save Message */}
          {saveMessage && (
            <div className={`mb-6 rounded-xl p-4 flex items-center gap-3 ${
              saveMessage.type === 'success' 
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
            }`}>
              <span className={`material-symbols-outlined ${
                saveMessage.type === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {saveMessage.type === 'success' ? 'check_circle' : 'error'}
              </span>
              <p className={`font-bold ${
                saveMessage.type === 'success' 
                  ? 'text-green-900 dark:text-green-200' 
                  : 'text-red-900 dark:text-red-200'
              }`}>
                {saveMessage.text}
              </p>
            </div>
          )}

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
                {/* Profile Card - Matching TeacherDetailHeader style */}
                <div className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl p-6 shadow-xl border border-gray-200 dark:border-slate-700">
                  <div className="flex flex-col sm:flex-row gap-6 items-start ">
                    <div className="relative shrink-0">
                      <img
                        alt={`صورة ${teacherName}`}
                        className="w-32 h-32 rounded-full object-cover border-4 border-primary/20"
                        src={profileImage}
                      />
                      {isApproved && (
                        <div className="absolute bottom-1 right-1 bg-green-500 rounded-full p-1 border-2 border-white dark:border-slate-800">
                          <span className="block w-3 h-3 bg-white rounded-full"></span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{teacherName}</h3>
                        {isApproved && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            <span className="material-symbols-outlined text-[14px]">verified</span>
                            تم التحقق
                          </span>
                        )}
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 text-lg">{teacherTitle}</p>
                      <div className="flex flex-wrap gap-2 pt-2">
                        {rating > 0 && (
                          <div className="flex items-center gap-1 text-primary text-sm font-bold bg-primary/10 px-3 py-1 rounded-lg">
                            <span className="material-symbols-outlined text-[18px] filled">star</span>
                            {rating.toFixed(1)} ({reviewsCount} تقييم)
                          </div>
                        )}
                        {!rating && isApproved && (
                          <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-sm bg-gray-100 dark:bg-slate-700 px-3 py-1 rounded-lg">
                            <span className="material-symbols-outlined text-[18px] filled">star</span>
                            <span>لا توجد تقييمات بعد</span>
                          </div>
                        )}
                        {teacherApplication?.nationality && (
                          <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400 text-sm bg-gray-100 dark:bg-slate-700 px-3 py-1 rounded-lg">
                            <span className="material-symbols-outlined text-[18px]">location_on</span>
                            {teacherApplication.nationality}
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400 text-sm bg-gray-100 dark:bg-slate-700 px-3 py-1 rounded-lg">
                          <span className="material-symbols-outlined text-[18px]">translate</span>
                          يتحدث العربية والإنجليزية
                        </div>
                      </div>
                      {specialization && (
                        <div className="pt-2 text-sm">
                          <span className="text-slate-500 dark:text-slate-400">التخصص: </span>
                          <span className="font-medium text-slate-900 dark:text-white">{specialization}</span>
                        </div>
                      )}
                      {sessionPrice > 0 && (
                        <div className="pt-2 text-sm">
                          <span className="text-slate-500 dark:text-slate-400">سعر الجلسة: </span>
                          <span className="text-primary font-bold">{sessionPrice} {currency}/ساعة</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {isApproved && (
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className={`w-full mt-6 font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 ${
                        isEditing
                          ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                          : 'bg-primary text-slate-900 hover:brightness-110'
                      }`}
                    >
                      <span className="material-symbols-outlined text-sm">{isEditing ? 'close' : 'edit'}</span>
                      {isEditing ? 'إلغاء التعديل' : 'تعديل الملف العام'}
                    </button>
                  )}
                </div>

                {/* Quick Links */}
                <div className="bg-white dark:bg-background-dark border border-primary/10 rounded-xl p-6 space-y-4">
                  <h4 className="font-bold text-sm text-slate-500 uppercase tracking-wider">روابط سريعة</h4>
                  <nav className="space-y-1">
                    <a href="#personal" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                      <span className="material-symbols-outlined filled">account_circle</span>
                      <span className="text-sm font-medium">البيانات الشخصية</span>
                    </a>
                    <button
                      onClick={() => setActiveQuickTab(activeQuickTab === 'wallet' ? null : 'wallet')}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                        activeQuickTab === 'wallet'
                          ? 'bg-primary/10 text-primary'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className="material-symbols-outlined">account_balance_wallet</span>
                      <span className="text-sm font-medium">إدارة المحفظة</span>
                    </button>
                    <button
                      onClick={() => setActiveQuickTab(activeQuickTab === 'support' ? null : 'support')}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                        activeQuickTab === 'support'
                          ? 'bg-primary/10 text-primary'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className="material-symbols-outlined">support_agent</span>
                      <span className="text-sm font-medium">الدعم الفني</span>
                    </button>
                  </nav>
                </div>
              </div>
            </aside>

            {/* Main Area */}
            <div className="lg:col-span-8 xl:col-span-9 space-y-6">
              {/* Content Section - All sections displayed without tabs */}
              <section className="space-y-8">
                {/* Personal Information Section */}
                <div id="personal" className="bg-white dark:bg-background-dark rounded-xl p-8 border border-primary/10 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold">البيانات الشخصية</h3>
                  </div>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">الاسم الكامل</label>
                        {isEditing && !isPending ? (
                          <input
                            type="text"
                            defaultValue={teacherName}
                            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-slate-900 dark:text-slate-100"
                          />
                        ) : (
                          <div className="w-full rounded-lg bg-slate-50 dark:bg-slate-800/50 px-4 py-3 text-slate-900 dark:text-slate-100 font-medium">
                            {teacherName}
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">البريد الإلكتروني</label>
                        {isEditing && !isPending ? (
                          <input
                            type="email"
                            defaultValue={userProfile?.email || teacherApplication?.email || user?.email || ''}
                            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-slate-900 dark:text-slate-100"
                          />
                        ) : (
                          <div className="w-full rounded-lg bg-slate-50 dark:bg-slate-800/50 px-4 py-3 text-slate-900 dark:text-slate-100 font-medium">
                            {userProfile?.email || teacherApplication?.email || user?.email || 'غير متوفر'}
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">رقم الهاتف</label>
                        {isEditing && !isPending ? (
                          <input
                            type="tel"
                            defaultValue={`${teacherApplication?.countryCode || '+966'} ${teacherApplication?.phone || ''}`}
                            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-slate-900 dark:text-slate-100"
                          />
                        ) : (
                          <div className="w-full rounded-lg bg-slate-50 dark:bg-slate-800/50 px-4 py-3 text-slate-900 dark:text-slate-100 font-medium">
                            {teacherApplication?.countryCode || '+966'} {teacherApplication?.phone || 'غير متوفر'}
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">الجنسية</label>
                        {isEditing && !isPending ? (
                          <input
                            type="text"
                            defaultValue={teacherApplication?.nationality || ''}
                            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-slate-900 dark:text-slate-100"
                          />
                        ) : (
                          <div className="w-full rounded-lg bg-slate-50 dark:bg-slate-800/50 px-4 py-3 text-slate-900 dark:text-slate-100 font-medium">
                            {teacherApplication?.nationality || 'غير متوفر'}
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">نبذة عني</label>
                      {isEditing && !isPending ? (
                        <textarea
                          rows={6}
                          defaultValue={teacherApplication?.bio || ''}
                          className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-slate-900 dark:text-slate-100"
                        />
                      ) : (
                        <div className="w-full rounded-lg bg-slate-50 dark:bg-slate-800/50 px-4 py-3 text-slate-900 dark:text-slate-100 leading-relaxed whitespace-pre-wrap min-h-[120px]">
                          {teacherApplication?.bio || 'لا توجد نبذة متاحة'}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">ما الثمار التي سيجنيها الطالب؟</label>
                      {isEditing && !isPending ? (
                        <>
                          <textarea
                            rows={5}
                            value={personalInfo.teachingStyle}
                            onChange={(e) => setPersonalInfo({ ...personalInfo, teachingStyle: e.target.value })}
                            placeholder="اكتب وصفاً للفوائد والنتائج التي سيحصل عليها الطالب من دراسته معك..."
                            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-slate-900 dark:text-slate-100"
                          />
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            اشرح الفوائد والنتائج التي سيحصل عليها الطالب مثل: إتقان التلاوة، فهم المعاني، بناء الثقة، الحصول على الإجازة، وغيرها
                          </p>
                        </>
                      ) : (
                        <div className="w-full rounded-lg bg-slate-50 dark:bg-slate-800/50 px-4 py-3 text-slate-900 dark:text-slate-100 leading-relaxed whitespace-pre-wrap min-h-[100px]">
                          {personalInfo.teachingStyle || 'لا يوجد وصف متاح'}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">ماذا تتضمن الحصة</label>
                      {isEditing && !isPending ? (
                        <>
                          <textarea
                            rows={5}
                            value={personalInfo.sessionContent}
                            onChange={(e) => setPersonalInfo({ ...personalInfo, sessionContent: e.target.value })}
                            placeholder="اكتب وصفاً لما تتضمنه الحصة..."
                            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-slate-900 dark:text-slate-100"
                          />
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            اشرح محتوى الحصة والأنشطة التي ستقوم بها مع الطالب
                          </p>
                        </>
                      ) : (
                        <div className="w-full rounded-lg bg-slate-50 dark:bg-slate-800/50 px-4 py-3 text-slate-900 dark:text-slate-100 leading-relaxed whitespace-pre-wrap min-h-[100px]">
                          {personalInfo.sessionContent || 'لا يوجد وصف متاح'}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">فيديو عني</label>
                      {isEditing && !isPending ? (
                        <>
                          <input
                            type="url"
                            value={personalInfo.introVideo}
                            onChange={(e) => setPersonalInfo({ ...personalInfo, introVideo: e.target.value })}
                            placeholder="رابط الفيديو (YouTube, Vimeo, إلخ)"
                            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-slate-900 dark:text-slate-100"
                          />
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            أدخل رابط فيديو تعريفي عنك (YouTube, Vimeo, أو أي منصة أخرى)
                          </p>
                        </>
                      ) : (
                        <div className="w-full rounded-lg bg-slate-50 dark:bg-slate-800/50 px-4 py-3">
                          {personalInfo.introVideo ? (
                            <a href={personalInfo.introVideo} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
                              {personalInfo.introVideo}
                            </a>
                          ) : (
                            <span className="text-slate-500 dark:text-slate-400">لا يوجد رابط فيديو</span>
                          )}
                        </div>
                      )}
                      {personalInfo.introVideo && (
                        <div className="mt-3 rounded-lg overflow-hidden">
                          {personalInfo.introVideo.includes('youtube.com') || personalInfo.introVideo.includes('youtu.be') ? (
                            <iframe
                              src={personalInfo.introVideo.includes('youtu.be') 
                                ? `https://www.youtube.com/embed/${personalInfo.introVideo.split('/').pop()}`
                                : `https://www.youtube.com/embed/${personalInfo.introVideo.split('v=')[1]?.split('&')[0]}`
                              }
                              className="w-full h-64 rounded-lg"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          ) : personalInfo.introVideo.includes('vimeo.com') ? (
                            <iframe
                              src={`https://player.vimeo.com/video/${personalInfo.introVideo.split('/').pop()}`}
                              className="w-full h-64 rounded-lg"
                              allow="autoplay; fullscreen; picture-in-picture"
                              allowFullScreen
                            />
                          ) : (
                            <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-4 text-center">
                              <span className="material-symbols-outlined text-4xl text-slate-400 mb-2">videocam</span>
                              <p className="text-sm text-slate-500">معاينة الفيديو غير متاحة لهذا الرابط</p>
                              <a href={personalInfo.introVideo} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm mt-2 inline-block">
                                فتح الرابط
                              </a>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    {isEditing && !isPending && (
                      <div className="flex gap-3">
                        <button
                          onClick={() => setIsEditing(false)}
                          className="px-6 py-3 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        >
                          إلغاء
                        </button>
                        <button
                          onClick={handleSavePersonalInfo}
                          disabled={saving}
                          className="bg-primary text-slate-900 font-bold py-3 px-6 rounded-lg hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Qualifications Section */}
                <>
                  {/* Education */}
                  <div id="qualifications" className="bg-white dark:bg-background-dark rounded-xl p-8 border border-primary/10 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">school</span>
                        <h3 className="text-xl font-bold">المؤهلات العلمية</h3>
                      </div>
                      {isEditing && !isPending && (
                        <button
                          onClick={handleAddQualification}
                          className="text-sm font-bold text-primary flex items-center gap-1 hover:underline"
                        >
                          <span className="material-symbols-outlined text-sm">add</span> إضافة مؤهل
                        </button>
                      )}
                    </div>
                    <div className="space-y-6">
                      {editableQualifications.length > 0 ? (
                        editableQualifications.map((qual, index) => (
                          <div key={index} className="flex gap-4 items-start p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                            <div className="h-12 w-12 flex-shrink-0 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-primary">
                              <span className="material-symbols-outlined">history_edu</span>
                            </div>
                            <div className="flex-1 space-y-3">
                              {isEditing && !isPending ? (
                                <>
                                  <input
                                    type="text"
                                    value={qual.title}
                                    onChange={(e) => handleUpdateQualification(index, 'title', e.target.value)}
                                    placeholder="اسم المؤهل"
                                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-slate-900 dark:text-slate-100"
                                  />
                                  <div className="grid grid-cols-2 gap-3">
                                    <input
                                      type="text"
                                      value={qual.institution || ''}
                                      onChange={(e) => handleUpdateQualification(index, 'institution', e.target.value)}
                                      placeholder="المؤسسة"
                                      className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-slate-900 dark:text-slate-100"
                                    />
                                    <input
                                      type="text"
                                      value={qual.year || ''}
                                      onChange={(e) => handleUpdateQualification(index, 'year', e.target.value)}
                                      placeholder="السنة"
                                      className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-slate-900 dark:text-slate-100"
                                    />
                                  </div>
                                  <button
                                    onClick={() => handleDeleteQualification(index)}
                                    className="text-red-500 text-sm hover:underline flex items-center gap-1"
                                  >
                                    <span className="material-symbols-outlined text-sm">delete</span>
                                    حذف
                                  </button>
                                </>
                              ) : (
                                <>
                                  <h4 className="font-bold text-lg text-slate-900 dark:text-white">{qual.title}</h4>
                                  {qual.institution && (
                                    <p className="text-slate-600 dark:text-slate-400 text-sm">{qual.institution} {qual.year && `- ${qual.year}`}</p>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-slate-500 text-sm">لا توجد مؤهلات مسجلة</p>
                      )}
                    </div>
                    {isEditing && !isPending && editableQualifications.length > 0 && (
                      <div className="mt-6 flex justify-end">
                        <button
                          onClick={handleSaveQualifications}
                          disabled={saving}
                          className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {saving ? 'جاري الحفظ...' : 'حفظ المؤهلات'}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Ijazahs */}
                  <div className="bg-white dark:bg-background-dark rounded-xl p-8 border border-primary/10 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">workspace_premium</span>
                        <h3 className="text-xl font-bold">الإجازات والسند</h3>
                      </div>
                      {isEditing && !isPending && (
                        <button
                          onClick={handleAddIjazah}
                          className="text-sm font-bold text-primary flex items-center gap-1 hover:underline"
                        >
                          <span className="material-symbols-outlined text-sm">add</span> إضافة إجازة
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {editableIjazahs.length > 0 ? (
                        editableIjazahs.map((ijazah, index) => (
                          <div
                            key={index}
                            className="group border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden hover:border-primary/40 transition-all"
                          >
                            <div
                              className="h-40 bg-cover bg-center"
                              style={{ backgroundImage: ijazah.image ? `url('${ijazah.image}')` : 'none', backgroundColor: '#f3f4f6' }}
                            />
                            <div className="p-4 space-y-3">
                              {isEditing && !isPending ? (
                                <>
                                  <input
                                    type="text"
                                    value={ijazah.title}
                                    onChange={(e) => handleUpdateIjazah(index, 'title', e.target.value)}
                                    placeholder="عنوان الإجازة"
                                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-slate-900 dark:text-slate-100 font-bold"
                                  />
                                  <textarea
                                    value={ijazah.description}
                                    onChange={(e) => handleUpdateIjazah(index, 'description', e.target.value)}
                                    placeholder="وصف الإجازة"
                                    rows={2}
                                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-slate-900 dark:text-slate-100 text-sm"
                                  />
                                  <input
                                    type="url"
                                    value={ijazah.image}
                                    onChange={(e) => handleUpdateIjazah(index, 'image', e.target.value)}
                                    placeholder="رابط الصورة"
                                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-slate-900 dark:text-slate-100 text-sm"
                                  />
                                  <button
                                    onClick={() => handleDeleteIjazah(index)}
                                    className="text-red-500 text-sm hover:underline flex items-center gap-1"
                                  >
                                    <span className="material-symbols-outlined text-sm">delete</span>
                                    حذف
                                  </button>
                                </>
                              ) : (
                                <>
                                  <h4 className="font-bold text-slate-900 dark:text-white">{ijazah.title || 'بدون عنوان'}</h4>
                                  <p className="text-sm text-slate-600 dark:text-slate-400">{ijazah.description || 'لا يوجد وصف'}</p>
                                </>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-slate-500 text-sm">لا توجد إجازات مسجلة</p>
                      )}
                    </div>
                    {isEditing && !isPending && editableIjazahs.length > 0 && (
                      <div className="mt-6 flex justify-end">
                        <button
                          onClick={handleSaveIjazahs}
                          disabled={saving}
                          className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {saving ? 'جاري الحفظ...' : 'حفظ الإجازات'}
                        </button>
                      </div>
                    )}
                  </div>
                </>

                {/* Availability Section */}
                <div id="availability" className="bg-white dark:bg-background-dark rounded-xl p-8 border border-primary/10 shadow-sm">
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
                                  <div
                                    onClick={() => isEditing && !isPending && handleToggleAvailability(dayIndex, timeIndex)}
                                    className={`h-full w-full bg-primary/20 rounded border border-primary/30 min-h-[35px] flex items-center justify-center transition-colors ${
                                      isEditing && !isPending ? 'cursor-pointer hover:bg-primary/30' : ''
                                    }`}
                                  >
                                    <span className="text-[10px] font-bold text-primary">متاح</span>
                                  </div>
                                )}
                                {status === 'booked' && (
                                  <div className="h-full w-full bg-slate-900/10 dark:bg-slate-900/30 rounded border border-slate-900/20 min-h-[35px] flex items-center justify-center">
                                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">محجوز</span>
                                  </div>
                                )}
                                {!status && (
                                  <div
                                    onClick={() => isEditing && !isPending && handleToggleAvailability(dayIndex, timeIndex)}
                                    className={`h-full w-full min-h-[35px] ${
                                      isEditing && !isPending ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded' : ''
                                    }`}
                                  />
                                )}
                              </div>
                            )
                          })}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                  {isEditing && !isPending && (
                    <div className="mt-6 flex justify-end">
                      <button
                        onClick={handleSaveAvailability}
                        disabled={saving}
                        className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                      </button>
                    </div>
                  )}
                  {isPending && (
                    <div className="mt-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        لا يمكنك تعديل جدول التوفر أثناء انتظار الموافقة على طلبك.
                      </p>
                    </div>
                  )}
                </div>

                {/* Reviews Section */}
                <div id="reviews" className="bg-white dark:bg-background-dark rounded-xl p-8 border border-primary/10 shadow-sm">
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

                {/* Wallet Section - Only show when activeQuickTab is 'wallet' */}
                {activeQuickTab === 'wallet' && (
                  <div id="wallet" className="space-y-6">
                    {/* Balance Card */}
                    <div className="relative overflow-hidden bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-primary/5">
                      <div className="absolute top-0 left-0 w-32 h-32 bg-primary/5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                      <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
                        <div className="flex flex-col items-center md:items-start">
                          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">إجمالي الأرباح</p>
                          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white flex items-baseline gap-2">
                            {walletBalance.toFixed(2)} <span className="text-xl font-bold text-primary">{walletCurrency === 'SAR' ? 'ر.س' : walletCurrency === 'USD' ? '$' : 'ج.م'}</span>
                          </h1>
                        </div>
                        <button
                          onClick={() => setShowWithdrawalForm(true)}
                          className="flex-1 md:flex-none min-w-[140px] px-6 py-3 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-all flex items-center justify-center gap-2"
                        >
                          <span className="material-symbols-outlined text-lg">account_balance</span>
                          سحب رصيدي
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Bank Accounts */}
                      <div className="flex flex-col gap-6 bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-primary/5">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary">account_balance</span>
                          <h3 className="text-lg font-bold">الحسابات البنكية لاستلام الأرباح</h3>
                        </div>
                        <div className="space-y-4">
                          <div className="p-4 border border-slate-100 dark:border-slate-700 rounded-2xl flex items-center justify-between bg-slate-50 dark:bg-slate-700/50">
                            <div className="flex items-center gap-3">
                              <div className="size-10 bg-white dark:bg-slate-800 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-600">
                                <span className="material-symbols-outlined text-slate-400">account_balance</span>
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">بنك الكويت الوطني</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">**** 4582</p>
                              </div>
                            </div>
                            <span className="material-symbols-outlined text-green-500">check_circle</span>
                          </div>
                          <button className="w-full py-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl text-slate-500 dark:text-slate-400 font-bold flex items-center justify-center gap-2 hover:border-primary hover:text-primary transition-all">
                            <span className="material-symbols-outlined">add_circle</span>
                            إضافة حساب بنكي جديد
                          </button>
                        </div>
                      </div>

                      {/* Withdrawal Form */}
                      <div className="flex flex-col gap-6 bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-primary/5">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary">payments</span>
                          <h3 className="text-lg font-bold">طلب سحب</h3>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-2xl flex justify-between items-center">
                          <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">متاح للسحب</p>
                            <p className="text-xl font-bold text-slate-900 dark:text-white">{walletBalance.toFixed(2)} {walletCurrency === 'SAR' ? 'ر.س' : walletCurrency === 'USD' ? '$' : 'ج.م'}</p>
                          </div>
                          <span className="material-symbols-outlined text-slate-400">info</span>
                        </div>
                        {showWithdrawalForm ? (
                          <div className="space-y-4">
                            <label className="block">
                              <span className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2 block">مبلغ السحب</span>
                              <input
                                type="number"
                                value={withdrawalForm.amount}
                                onChange={(e) => setWithdrawalForm({ ...withdrawalForm, amount: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary text-base"
                                placeholder="0.00"
                              />
                            </label>
                            <label className="block">
                              <span className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2 block">اسم البنك</span>
                              <input
                                type="text"
                                value={withdrawalForm.bankName}
                                onChange={(e) => setWithdrawalForm({ ...withdrawalForm, bankName: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary"
                                placeholder="اسم البنك"
                              />
                            </label>
                            <label className="block">
                              <span className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2 block">رقم الحساب</span>
                              <input
                                type="text"
                                value={withdrawalForm.accountNumber}
                                onChange={(e) => setWithdrawalForm({ ...withdrawalForm, accountNumber: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary"
                                placeholder="رقم الحساب"
                              />
                            </label>
                            <label className="block">
                              <span className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2 block">رقم الآيبان (IBAN)</span>
                              <div className="relative">
                                <input
                                  type="text"
                                  value={withdrawalForm.iban}
                                  onChange={(e) => setWithdrawalForm({ ...withdrawalForm, iban: e.target.value })}
                                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary text-left font-mono"
                                  dir="ltr"
                                  placeholder="KW00 0000 0000 0000 0000"
                                />
                                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">lock</span>
                              </div>
                            </label>
                            <div className="flex gap-3">
                              <button
                                onClick={() => setShowWithdrawalForm(false)}
                                className="flex-1 px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                              >
                                إلغاء
                              </button>
                              <button
                                onClick={handleWithdrawalSubmit}
                                disabled={saving}
                                className="flex-1 px-4 py-3 bg-primary text-slate-900 font-bold rounded-xl hover:brightness-110 transition-all disabled:opacity-50"
                              >
                                {saving ? 'جاري الإرسال...' : 'تأكيد طلب السحب'}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setShowWithdrawalForm(true)}
                            className="w-full py-3 bg-slate-900 dark:bg-slate-700 text-white font-bold rounded-xl hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors"
                          >
                            طلب سحب جديد
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Transactions Table */}
                    <div className="flex flex-col gap-4 bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-primary/5">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-bold">سجل الأرباح والمدفوعات</h3>
                        <button className="text-primary text-sm font-bold hover:underline">عرض الكل</button>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-right">
                          <thead>
                            <tr className="text-slate-400 dark:text-slate-500 text-sm border-b border-slate-100 dark:border-slate-700">
                              <th className="pb-4 font-medium">التاريخ</th>
                              <th className="pb-4 font-medium">النوع</th>
                              <th className="pb-4 font-medium">الحالة</th>
                              <th className="pb-4 font-medium">المبلغ</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                            {walletTransactions.length > 0 ? (
                              walletTransactions.map((transaction) => (
                                <tr key={transaction.id} className="group hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                  <td className="py-4 text-sm font-medium">{new Date(transaction.createdAt?.toDate?.() || transaction.createdAt).toLocaleDateString('ar-SA')}</td>
                                  <td className="py-4">
                                    <div className="flex items-center gap-2">
                                      <span className={`material-symbols-outlined text-base ${
                                        transaction.type === 'earning' ? 'text-green-500' : 'text-slate-400'
                                      }`}>
                                        {transaction.type === 'earning' ? 'add_circle' : 'remove_circle'}
                                      </span>
                                      <span className="text-sm font-bold">{transaction.description}</span>
                                    </div>
                                  </td>
                                  <td className="py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                      transaction.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                                      transaction.status === 'pending' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' :
                                      'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                    }`}>
                                      {transaction.status === 'completed' ? 'مكتمل' : transaction.status === 'pending' ? 'قيد المعالجة' : 'مرفوض'}
                                    </span>
                                  </td>
                                  <td className={`py-4 font-bold ${
                                    transaction.type === 'earning' ? 'text-green-600 dark:text-green-400' : 'text-slate-900 dark:text-white'
                                  }`}>
                                    {transaction.type === 'earning' ? '+' : '-'}{transaction.amount.toFixed(2)} {transaction.currency === 'SAR' ? 'ر.س' : transaction.currency === 'USD' ? '$' : 'ج.م'}
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={4} className="py-8 text-center text-slate-500 dark:text-slate-400">
                                  لا توجد معاملات بعد
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* Support Section - Only show when activeQuickTab is 'support' */}
                {activeQuickTab === 'support' && (
                  <div id="support" className="space-y-8">
                    {/* Search Section */}
                    <section className="relative rounded-3xl overflow-hidden bg-primary/10 p-8 md:p-12 text-center border border-primary/10">
                      <div className="relative z-10 max-w-xl mx-auto">
                        <h2 className="text-2xl md:text-3xl font-bold mb-4 text-slate-900 dark:text-slate-100">كيف يمكننا مساعدتك اليوم؟</h2>
                        <p className="text-slate-600 dark:text-slate-400 mb-8">ابحث في مقالات المساعدة أو تصفح المواضيع الشائعة</p>
                        <div className="relative group">
                          <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-primary group-focus-within:text-primary">search</span>
                          <input
                            className="w-full h-14 pr-12 pl-4 rounded-2xl border-none ring-1 ring-primary/20 focus:ring-2 focus:ring-primary bg-background-light dark:bg-background-dark shadow-sm"
                            placeholder="ابحث عن دروس، فواتير، أو مشاكل تقنية..."
                            type="text"
                          />
                        </div>
                      </div>
                    </section>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* New Ticket Form */}
                      <section className="space-y-6">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="material-symbols-outlined text-primary">confirmation_number</span>
                          <h2 className="text-xl font-bold">فتح تذكرة دعم جديدة</h2>
                        </div>
                        {showNewTicketForm ? (
                          <form onSubmit={handleCreateTicket} className="space-y-4 bg-background-light dark:bg-background-dark p-6 rounded-2xl border border-primary/10 shadow-sm">
                            <div className="space-y-2">
                              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">موضوع المشكلة</label>
                              <input
                                type="text"
                                value={newTicket.subject}
                                onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-primary/10 bg-primary/5 focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="مثال: مشكلة في تسجيل الدخول"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">القسم</label>
                              <select
                                value={newTicket.category}
                                onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-primary/10 bg-primary/5 focus:ring-2 focus:ring-primary"
                              >
                                <option value="technical">مشاكل تقنية</option>
                                <option value="billing">الاشتراكات والمدفوعات</option>
                                <option value="account">محتوى الدروس</option>
                                <option value="other">اقتراحات وتطوير</option>
                              </select>
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">الأولوية</label>
                              <select
                                value={newTicket.priority}
                                onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value as any })}
                                className="w-full px-4 py-3 rounded-xl border border-primary/10 bg-primary/5 focus:ring-2 focus:ring-primary"
                              >
                                <option value="low">منخفضة</option>
                                <option value="medium">متوسطة</option>
                                <option value="high">عالية</option>
                                <option value="urgent">عاجل</option>
                              </select>
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">تفاصيل المشكلة</label>
                              <textarea
                                value={newTicket.message}
                                onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-primary/10 bg-primary/5 focus:ring-2 focus:ring-primary resize-none"
                                placeholder="يرجى وصف المشكلة بالتفصيل..."
                                rows={4}
                              />
                            </div>
                            <div className="flex gap-3">
                              <button
                                type="button"
                                onClick={() => setShowNewTicketForm(false)}
                                className="flex-1 px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                              >
                                إلغاء
                              </button>
                              <button
                                type="submit"
                                disabled={saving}
                                className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl shadow-lg shadow-primary/20 disabled:opacity-50"
                              >
                                {saving ? 'جاري الإرسال...' : 'إرسال التذكرة'}
                              </button>
                            </div>
                          </form>
                        ) : (
                          <button
                            onClick={() => setShowNewTicketForm(true)}
                            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                          >
                            <span className="material-symbols-outlined">add</span>
                            فتح تذكرة جديدة
                          </button>
                        )}
                      </section>

                      {/* Recent Tickets */}
                      <section className="space-y-6">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">history</span>
                            <h2 className="text-xl font-bold">التذاكر الأخيرة</h2>
                          </div>
                          <a className="text-sm text-primary font-medium hover:underline" href="#">عرض الكل</a>
                        </div>
                        <div className="space-y-4">
                          {supportTickets.length > 0 ? (
                            supportTickets.map((ticket) => (
                              <div
                                key={ticket.id}
                                onClick={() => setSelectedTicket(ticket)}
                                className="p-4 bg-background-light dark:bg-background-dark border border-primary/10 rounded-2xl flex items-start gap-4 hover:shadow-md transition-shadow cursor-pointer"
                              >
                                <div className={`size-10 rounded-full flex items-center justify-center ${
                                  ticket.status === 'open' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600' :
                                  ticket.status === 'resolved' ? 'bg-green-100 dark:bg-green-900/30 text-green-600' :
                                  'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
                                }`}>
                                  <span className="material-symbols-outlined">
                                    {ticket.status === 'open' ? 'hourglass_empty' : ticket.status === 'resolved' ? 'check_circle' : 'schedule'}
                                  </span>
                                </div>
                                <div className="flex-1">
                                  <div className="flex justify-between items-start mb-1">
                                    <h3 className="font-bold text-slate-800 dark:text-slate-200">{ticket.subject}</h3>
                                    <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${
                                      ticket.status === 'open' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                                      ticket.status === 'resolved' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                                      'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                                    }`}>
                                      {ticket.status === 'open' ? 'قيد الانتظار' : ticket.status === 'resolved' ? 'تم الحل' : 'قيد المعالجة'}
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-500 mb-2">رقم التذكرة: #{ticket.id.slice(0, 8)}</p>
                                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-1">{ticket.message}</p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="p-8 border-2 border-dotted border-primary/10 rounded-2xl flex flex-col items-center justify-center text-center opacity-60">
                              <span className="material-symbols-outlined text-4xl text-primary/40 mb-2">contact_support</span>
                              <p className="text-sm">لا توجد تذاكر للعرض</p>
                            </div>
                          )}
                        </div>
                      </section>
                    </div>

                    {/* Ticket Details Modal */}
                    {selectedTicket && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                        <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col border border-slate-200 dark:border-slate-700">
                          <div className="px-8 pt-8 pb-4 flex justify-between items-start">
                            <div>
                              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">{selectedTicket.subject}</h2>
                              <p className="text-slate-500 dark:text-slate-400 text-sm">{selectedTicket.category}</p>
                            </div>
                            <button
                              onClick={() => setSelectedTicket(null)}
                              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                            >
                              <span className="material-symbols-outlined text-slate-500">close</span>
                            </button>
                          </div>
                          <div className="px-8 py-4 max-h-[400px] overflow-y-auto">
                            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 mb-4">
                              <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{selectedTicket.message}</p>
                            </div>
                            {selectedTicket.replies && selectedTicket.replies.length > 0 && (
                              <div className="space-y-4">
                                <h3 className="font-bold">الردود</h3>
                                {selectedTicket.replies.map((reply: any) => (
                                  <div
                                    key={reply.id}
                                    className={`p-4 rounded-lg ${
                                      reply.sender === 'user' ? 'bg-primary/10 ml-8' : 'bg-slate-100 dark:bg-slate-700 mr-8'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between mb-2">
                                      <p className="font-bold text-sm">{reply.senderName}</p>
                                      <p className="text-xs text-slate-500">{new Date(reply.createdAt?.toDate?.() || reply.createdAt).toLocaleDateString('ar-SA')}</p>
                                    </div>
                                    <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{reply.message}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                            {selectedTicket.status !== 'closed' && (
                              <div className="border-t border-slate-200 dark:border-slate-700 pt-4 mt-4">
                                <textarea
                                  value={replyMessage}
                                  onChange={(e) => setReplyMessage(e.target.value)}
                                  placeholder="اكتب ردك هنا..."
                                  rows={3}
                                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-slate-900 dark:text-slate-100 mb-3"
                                />
                                <button
                                  onClick={handleSendReply}
                                  disabled={!replyMessage.trim() || saving}
                                  className="bg-primary text-slate-900 font-bold py-2 px-6 rounded-lg hover:brightness-110 transition-all disabled:opacity-50"
                                >
                                  {saving ? 'جاري الإرسال...' : 'إرسال الرد'}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
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

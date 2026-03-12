'use client'

import React, { useState, useEffect } from "react";
import { useAuth } from '../../contexts/AuthContext'
import Header from '../../components/layout/Header'
import { useNavigate } from 'react-router-dom'
import { SupportService } from '../../services/supportService'

interface SupportTicket {
  id: string
  subject: string
  message: string
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: string
  createdAt: any
  updatedAt: any
  replies?: TicketReply[]
}

interface TicketReply {
  id: string
  message: string
  sender: 'user' | 'support'
  senderName: string
  createdAt: any
}

export default function SupportPage() {
  const { user, userProfile } = useAuth()
  const navigate = useNavigate()
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  const [showNewTicketForm, setShowNewTicketForm] = useState(false)
  const [newTicket, setNewTicket] = useState({
    subject: '',
    message: '',
    category: 'technical',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent'
  })
  const [replyMessage, setReplyMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!user) {
      navigate('/teacher-profile')
      return
    }

    fetchTickets()
  }, [user])

  const fetchTickets = () => {
    if (!user) return

    setLoading(true)
    try {
      const supportService = new SupportService()
      
      const unsubscribe = supportService.subscribeToSupportTickets(user.uid, (ticketsData) => {
        setTickets(ticketsData)
        setLoading(false)
      })

      return () => unsubscribe()
    } catch (error) {
      console.error('Error fetching tickets:', error)
      setLoading(false)
    }
  }

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    if (!newTicket.subject || !newTicket.message) {
      alert('يرجى إدخال جميع البيانات المطلوبة')
      return
    }

    setSubmitting(true)
    try {
      const supportService = new SupportService()
      
      const ticketId = await supportService.createTicket({
        userId: user.uid,
        userName: userProfile?.displayName || user.email || 'مستخدم',
        subject: newTicket.subject,
        message: newTicket.message,
        category: newTicket.category as 'technical' | 'billing' | 'account' | 'other',
        priority: newTicket.priority,
      })
      
      setShowNewTicketForm(false)
      setNewTicket({ subject: '', message: '', category: 'technical', priority: 'medium' })
      setSelectedTicket({ id: ticketId, userId: user.uid, userName: userProfile?.displayName || user.email || 'مستخدم', subject: newTicket.subject, message: newTicket.message, category: newTicket.category, priority: newTicket.priority, status: 'open', replies: [] } as SupportTicket)
      alert('تم إنشاء التذكرة بنجاح')
    } catch (error) {
      console.error('Error creating ticket:', error)
      alert('حدث خطأ أثناء إنشاء التذكرة')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSendReply = async () => {
    if (!user || !selectedTicket || !replyMessage.trim()) return

    setSubmitting(true)
    try {
      const supportService = new SupportService()
      
      await supportService.addReply(selectedTicket.id, {
        message: replyMessage,
        sender: 'user',
        senderName: userProfile?.displayName || user.email || 'مستخدم'
      })

      setReplyMessage('')
      fetchTickets()
    } catch (error) {
      console.error('Error sending reply:', error)
      alert('حدث خطأ أثناء إرسال الرد')
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'غير متاح'
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
      case 'in_progress':
        return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20'
      case 'resolved':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20'
      case 'closed':
        return 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800'
      default:
        return 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open':
        return 'مفتوحة'
      case 'in_progress':
        return 'قيد المعالجة'
      case 'resolved':
        return 'تم الحل'
      case 'closed':
        return 'مغلقة'
      default:
        return status
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
      case 'high':
        return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20'
      case 'medium':
        return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20'
      case 'low':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20'
      default:
        return 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800'
    }
  }

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'عاجل'
      case 'high':
        return 'عالية'
      case 'medium':
        return 'متوسطة'
      case 'low':
        return 'منخفضة'
      default:
        return priority
    }
  }

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'technical':
        return 'فني'
      case 'billing':
        return 'الدفع والفوترة'
      case 'account':
        return 'الحساب'
      case 'other':
        return 'أخرى'
      default:
        return category
    }
  }

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
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">الدعم الفني</h1>
                <p className="text-slate-600 dark:text-slate-400 mt-2">إدارة تذاكر الدعم والمساعدة</p>
              </div>
              <button
                onClick={() => navigate('/teacher-profile')}
                className="flex items-center gap-2 px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined">arrow_back</span>
                العودة
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Tickets List */}
              <div className="lg:col-span-1 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">التذاكر</h2>
                  <button
                    onClick={() => setShowNewTicketForm(true)}
                    className="bg-primary text-slate-900 font-bold px-4 py-2 rounded-lg hover:brightness-110 transition-all flex items-center gap-2 text-sm"
                  >
                    <span className="material-symbols-outlined text-sm">add</span>
                    تذكرة جديدة
                  </button>
                </div>

                {/* New Ticket Form */}
                {showNewTicketForm && (
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-primary/10 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold">تذكرة جديدة</h3>
                      <button
                        onClick={() => setShowNewTicketForm(false)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                      >
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    </div>
                    <form onSubmit={handleCreateTicket} className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                          الفئة
                        </label>
                        <select
                          value={newTicket.category}
                          onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                          className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
                        >
                          <option value="technical">فني</option>
                          <option value="billing">الدفع والفوترة</option>
                          <option value="account">الحساب</option>
                          <option value="other">أخرى</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                          الأولوية
                        </label>
                        <select
                          value={newTicket.priority}
                          onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value as any })}
                          className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
                        >
                          <option value="low">منخفضة</option>
                          <option value="medium">متوسطة</option>
                          <option value="high">عالية</option>
                          <option value="urgent">عاجل</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                          الموضوع
                        </label>
                        <input
                          type="text"
                          value={newTicket.subject}
                          onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                          className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                          الرسالة
                        </label>
                        <textarea
                          value={newTicket.message}
                          onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
                          rows={3}
                          className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-primary text-slate-900 font-bold py-2 rounded-lg hover:brightness-110 transition-all disabled:opacity-50 text-sm"
                      >
                        {submitting ? 'جاري الإرسال...' : 'إرسال'}
                      </button>
                    </form>
                  </div>
                )}

                {/* Tickets List */}
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {tickets.length > 0 ? (
                    tickets.map((ticket) => (
                      <button
                        key={ticket.id}
                        onClick={() => {
                          setSelectedTicket(ticket)
                          setShowNewTicketForm(false)
                        }}
                        className={`w-full text-right p-4 rounded-lg border transition-colors ${
                          selectedTicket?.id === ticket.id
                            ? 'bg-primary/10 border-primary'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex gap-2">
                            <span className={`inline-block px-2 py-0.5 rounded text-xs ${getStatusColor(ticket.status)}`}>
                              {getStatusText(ticket.status)}
                            </span>
                            <span className={`inline-block px-2 py-0.5 rounded text-xs ${getPriorityColor(ticket.priority)}`}>
                              {getPriorityText(ticket.priority)}
                            </span>
                          </div>
                          <span className="text-xs text-slate-400">{getCategoryText(ticket.category)}</span>
                        </div>
                        <h4 className="font-bold text-sm mb-1">{ticket.subject}</h4>
                        <p className="text-xs text-slate-500 line-clamp-2">{ticket.message}</p>
                        <p className="text-xs text-slate-400 mt-2">{formatDate(ticket.createdAt)}</p>
                      </button>
                    ))
                  ) : (
                    <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                      <span className="material-symbols-outlined text-4xl mb-2">support_agent</span>
                      <p>لا توجد تذاكر</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Ticket Details */}
              <div className="lg:col-span-2">
                {selectedTicket ? (
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-primary/10 shadow-sm space-y-6">
                    {/* Ticket Header */}
                    <div>
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h2 className="text-2xl font-bold mb-2">{selectedTicket.subject}</h2>
                          <div className="flex gap-2 flex-wrap">
                            <span className={`inline-block px-3 py-1 rounded text-sm ${getStatusColor(selectedTicket.status)}`}>
                              {getStatusText(selectedTicket.status)}
                            </span>
                            <span className={`inline-block px-3 py-1 rounded text-sm ${getPriorityColor(selectedTicket.priority)}`}>
                              {getPriorityText(selectedTicket.priority)}
                            </span>
                            <span className="inline-block px-3 py-1 rounded text-sm bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                              {getCategoryText(selectedTicket.category)}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-slate-500">{formatDate(selectedTicket.createdAt)}</p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                        <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{selectedTicket.message}</p>
                      </div>
                    </div>

                    {/* Replies */}
                    <div className="space-y-4">
                      <h3 className="font-bold">الردود</h3>
                      <div className="space-y-4 max-h-[400px] overflow-y-auto">
                        {selectedTicket.replies && selectedTicket.replies.length > 0 ? (
                          selectedTicket.replies.map((reply) => (
                            <div
                              key={reply.id}
                              className={`p-4 rounded-lg ${
                                reply.sender === 'user'
                                  ? 'bg-primary/10 ml-8'
                                  : 'bg-slate-100 dark:bg-slate-700 mr-8'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <p className="font-bold text-sm">{reply.senderName}</p>
                                <p className="text-xs text-slate-500">{formatDate(reply.createdAt)}</p>
                              </div>
                              <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{reply.message}</p>
                            </div>
                          ))
                        ) : (
                          <p className="text-center text-slate-500 py-8">لا توجد ردود بعد</p>
                        )}
                      </div>
                    </div>

                    {/* Reply Form */}
                    {selectedTicket.status !== 'closed' && (
                      <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                        <textarea
                          value={replyMessage}
                          onChange={(e) => setReplyMessage(e.target.value)}
                          placeholder="اكتب ردك هنا..."
                          rows={4}
                          className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-slate-900 dark:text-slate-100 mb-3"
                        />
                        <button
                          onClick={handleSendReply}
                          disabled={!replyMessage.trim() || submitting}
                          className="bg-primary text-slate-900 font-bold py-2 px-6 rounded-lg hover:brightness-110 transition-all disabled:opacity-50"
                        >
                          {submitting ? 'جاري الإرسال...' : 'إرسال الرد'}
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-12 border border-primary/10 shadow-sm text-center">
                    <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-600 mb-4">support_agent</span>
                    <p className="text-slate-500 dark:text-slate-400">اختر تذكرة لعرض التفاصيل</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}

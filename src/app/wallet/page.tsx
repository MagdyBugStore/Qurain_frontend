'use client'

import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs, addDoc, updateDoc, doc as firestoreDoc, serverTimestamp, orderBy, limit } from 'firebase/firestore'
import { db } from '../../config/firebase'
import { useAuth } from '../../contexts/AuthContext'
import Header from '../../components/layout/Header'
import { useNavigate } from 'react-router-dom'

interface Transaction {
  id: string
  type: 'earning' | 'withdrawal' | 'refund'
  amount: number
  currency: string
  description: string
  status: 'pending' | 'completed' | 'rejected'
  createdAt: any
  sessionId?: string
}

interface WithdrawalRequest {
  id: string
  amount: number
  currency: string
  bankName: string
  accountNumber: string
  iban?: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: any
  processedAt?: any
}

export default function WalletPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [balance, setBalance] = useState(0)
  const [currency, setCurrency] = useState('SAR')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'transactions' | 'withdrawals'>('transactions')
  const [showWithdrawalForm, setShowWithdrawalForm] = useState(false)
  const [withdrawalForm, setWithdrawalForm] = useState({
    amount: '',
    bankName: '',
    accountNumber: '',
    iban: ''
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!user) {
      navigate('/teacher-profile')
      return
    }

    fetchWalletData()
  }, [user])

  const fetchWalletData = async () => {
    if (!user) return

    setLoading(true)
    try {
      // Fetch wallet balance
      const walletQuery = query(
        collection(db, 'teacherWallets'),
        where('teacherId', '==', user.uid)
      )
      const walletSnapshot = await getDocs(walletQuery)
      
      if (!walletSnapshot.empty) {
        const walletData = walletSnapshot.docs[0].data()
        setBalance(walletData.balance || 0)
        setCurrency(walletData.currency || 'SAR')
      }

      // Fetch transactions
      const transactionsQuery = query(
        collection(db, 'teacherTransactions'),
        where('teacherId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(50)
      )
      const transactionsSnapshot = await getDocs(transactionsQuery)
      const transactionsData = transactionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Transaction[]
      setTransactions(transactionsData)

      // Fetch withdrawal requests
      const withdrawalsQuery = query(
        collection(db, 'withdrawalRequests'),
        where('teacherId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(20)
      )
      const withdrawalsSnapshot = await getDocs(withdrawalsQuery)
      const withdrawalsData = withdrawalsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as WithdrawalRequest[]
      setWithdrawalRequests(withdrawalsData)
    } catch (error) {
      console.error('Error fetching wallet data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleWithdrawalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    const amount = parseFloat(withdrawalForm.amount)
    if (amount <= 0 || amount > balance) {
      alert('المبلغ غير صحيح')
      return
    }

    if (!withdrawalForm.bankName || !withdrawalForm.accountNumber) {
      alert('يرجى إدخال جميع البيانات المطلوبة')
      return
    }

    setSubmitting(true)
    try {
      await addDoc(collection(db, 'withdrawalRequests'), {
        teacherId: user.uid,
        amount,
        currency,
        bankName: withdrawalForm.bankName,
        accountNumber: withdrawalForm.accountNumber,
        iban: withdrawalForm.iban || '',
        status: 'pending',
        createdAt: serverTimestamp()
      })

      // Update wallet balance
      const walletQuery = query(
        collection(db, 'teacherWallets'),
        where('teacherId', '==', user.uid)
      )
      const walletSnapshot = await getDocs(walletQuery)
      if (!walletSnapshot.empty) {
        await updateDoc(firestoreDoc(db, 'teacherWallets', walletSnapshot.docs[0].id), {
          balance: balance - amount,
          updatedAt: serverTimestamp()
        })
        setBalance(balance - amount)
      }

      setShowWithdrawalForm(false)
      setWithdrawalForm({ amount: '', bankName: '', accountNumber: '', iban: '' })
      fetchWalletData()
      alert('تم إرسال طلب السحب بنجاح')
    } catch (error) {
      console.error('Error submitting withdrawal request:', error)
      alert('حدث خطأ أثناء إرسال طلب السحب')
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
      case 'completed':
      case 'approved':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20'
      case 'pending':
        return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20'
      case 'rejected':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
      default:
        return 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'مكتمل'
      case 'approved':
        return 'موافق عليه'
      case 'pending':
        return 'قيد المراجعة'
      case 'rejected':
        return 'مرفوض'
      default:
        return status
    }
  }

  const getTransactionTypeText = (type: string) => {
    switch (type) {
      case 'earning':
        return 'أرباح'
      case 'withdrawal':
        return 'سحب'
      case 'refund':
        return 'استرداد'
      default:
        return type
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
                <h1 className="text-3xl font-bold">إدارة المحفظة</h1>
                <p className="text-slate-600 dark:text-slate-400 mt-2">عرض رصيدك والمعاملات المالية</p>
              </div>
              <button
                onClick={() => navigate('/teacher-profile')}
                className="flex items-center gap-2 px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined">arrow_back</span>
                العودة
              </button>
            </div>

            {/* Balance Card */}
            <div className="bg-gradient-to-br from-primary to-primary/80 rounded-xl p-8 text-white shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm mb-2">الرصيد الحالي</p>
                  <h2 className="text-4xl font-bold">
                    {balance.toFixed(2)} {currency === 'SAR' ? 'ر.س' : currency === 'USD' ? '$' : 'ج.م'}
                  </h2>
                </div>
                <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-4xl">account_balance_wallet</span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-2 flex gap-2 border border-primary/10 shadow-sm">
              <button
                onClick={() => setActiveTab('transactions')}
                className={`flex-1 px-6 py-3 text-sm font-medium transition-colors rounded-lg ${
                  activeTab === 'transactions'
                    ? 'bg-primary text-slate-900 font-bold'
                    : 'text-slate-500 hover:text-primary'
                }`}
              >
                المعاملات
              </button>
              <button
                onClick={() => setActiveTab('withdrawals')}
                className={`flex-1 px-6 py-3 text-sm font-medium transition-colors rounded-lg ${
                  activeTab === 'withdrawals'
                    ? 'bg-primary text-slate-900 font-bold'
                    : 'text-slate-500 hover:text-primary'
                }`}
              >
                طلبات السحب
              </button>
            </div>

            {/* Transactions Tab */}
            {activeTab === 'transactions' && (
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-primary/10 shadow-sm">
                <div className="space-y-4">
                  {transactions.length > 0 ? (
                    transactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                            transaction.type === 'earning' ? 'bg-green-100 dark:bg-green-900/20' :
                            transaction.type === 'withdrawal' ? 'bg-red-100 dark:bg-red-900/20' :
                            'bg-blue-100 dark:bg-blue-900/20'
                          }`}>
                            <span className={`material-symbols-outlined ${
                              transaction.type === 'earning' ? 'text-green-600 dark:text-green-400' :
                              transaction.type === 'withdrawal' ? 'text-red-600 dark:text-red-400' :
                              'text-blue-600 dark:text-blue-400'
                            }`}>
                              {transaction.type === 'earning' ? 'trending_up' :
                               transaction.type === 'withdrawal' ? 'trending_down' :
                               'refresh'}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-bold">{getTransactionTypeText(transaction.type)}</h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{transaction.description}</p>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{formatDate(transaction.createdAt)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold text-lg ${
                            transaction.type === 'earning' ? 'text-green-600 dark:text-green-400' :
                            transaction.type === 'withdrawal' ? 'text-red-600 dark:text-red-400' :
                            'text-blue-600 dark:text-blue-400'
                          }`}>
                            {transaction.type === 'earning' ? '+' : '-'}
                            {transaction.amount.toFixed(2)} {transaction.currency === 'SAR' ? 'ر.س' : transaction.currency === 'USD' ? '$' : 'ج.م'}
                          </p>
                          <span className={`inline-block px-2 py-1 rounded text-xs mt-1 ${getStatusColor(transaction.status)}`}>
                            {getStatusText(transaction.status)}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-600 mb-4">receipt_long</span>
                      <p className="text-slate-500 dark:text-slate-400">لا توجد معاملات بعد</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Withdrawals Tab */}
            {activeTab === 'withdrawals' && (
              <div className="space-y-6">
                {/* Withdrawal Form */}
                {showWithdrawalForm ? (
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-primary/10 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold">طلب سحب جديد</h3>
                      <button
                        onClick={() => setShowWithdrawalForm(false)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                      >
                        <span className="material-symbols-outlined">close</span>
                      </button>
                    </div>
                    <form onSubmit={handleWithdrawalSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                          المبلغ ({currency === 'SAR' ? 'ر.س' : currency === 'USD' ? '$' : 'ج.م'})
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max={balance}
                          value={withdrawalForm.amount}
                          onChange={(e) => setWithdrawalForm({ ...withdrawalForm, amount: e.target.value })}
                          className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-slate-900 dark:text-slate-100"
                          required
                        />
                        <p className="text-xs text-slate-500 mt-1">الحد الأقصى: {balance.toFixed(2)}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                          اسم البنك
                        </label>
                        <input
                          type="text"
                          value={withdrawalForm.bankName}
                          onChange={(e) => setWithdrawalForm({ ...withdrawalForm, bankName: e.target.value })}
                          className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-slate-900 dark:text-slate-100"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                          رقم الحساب
                        </label>
                        <input
                          type="text"
                          value={withdrawalForm.accountNumber}
                          onChange={(e) => setWithdrawalForm({ ...withdrawalForm, accountNumber: e.target.value })}
                          className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-slate-900 dark:text-slate-100"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                          IBAN (اختياري)
                        </label>
                        <input
                          type="text"
                          value={withdrawalForm.iban}
                          onChange={(e) => setWithdrawalForm({ ...withdrawalForm, iban: e.target.value })}
                          className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-slate-900 dark:text-slate-100"
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          type="submit"
                          disabled={submitting}
                          className="flex-1 bg-primary text-slate-900 font-bold py-3 rounded-lg hover:brightness-110 transition-all disabled:opacity-50"
                        >
                          {submitting ? 'جاري الإرسال...' : 'إرسال الطلب'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowWithdrawalForm(false)}
                          className="px-6 py-3 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        >
                          إلغاء
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowWithdrawalForm(true)}
                    className="w-full bg-primary text-slate-900 font-bold py-4 rounded-lg hover:brightness-110 transition-all flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined">add</span>
                    طلب سحب جديد
                  </button>
                )}

                {/* Withdrawal Requests List */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-primary/10 shadow-sm">
                  <h3 className="text-xl font-bold mb-6">طلبات السحب السابقة</h3>
                  <div className="space-y-4">
                    {withdrawalRequests.length > 0 ? (
                      withdrawalRequests.map((request) => (
                        <div
                          key={request.id}
                          className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg"
                        >
                          <div>
                            <h4 className="font-bold">
                              {request.amount.toFixed(2)} {request.currency === 'SAR' ? 'ر.س' : request.currency === 'USD' ? '$' : 'ج.م'}
                            </h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                              {request.bankName} - {request.accountNumber}
                            </p>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                              {formatDate(request.createdAt)}
                            </p>
                          </div>
                          <span className={`inline-block px-3 py-1 rounded text-sm font-medium ${getStatusColor(request.status)}`}>
                            {getStatusText(request.status)}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-600 mb-4">account_balance</span>
                        <p className="text-slate-500 dark:text-slate-400">لا توجد طلبات سحب</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  )
}

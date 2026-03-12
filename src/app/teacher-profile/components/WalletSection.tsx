/**
 * WalletSection Component
 * Displays wallet balance, transactions, and withdrawal requests
 */

import React from 'react';
import { getCurrencySymbol } from '../../../shared/utils/currency';
import { useWallet } from '../hooks/useWallet';

interface WalletSectionProps {
  teacherId: string | null;
  onSave: (message: { type: 'success' | 'error'; text: string }) => void;
}

export function WalletSection({ teacherId, onSave }: WalletSectionProps) {
  const {
    balance,
    currency,
    transactions,
    withdrawals,
    loading,
    saving,
    showWithdrawalForm,
    setShowWithdrawalForm,
    withdrawalForm,
    setWithdrawalForm,
    submitWithdrawal,
  } = useWallet(teacherId);

  const handleWithdrawalSubmit = async () => {
    const result = await submitWithdrawal();
    if (result.success) {
      onSave({ type: 'success', text: 'تم إرسال طلب السحب بنجاح' });
    } else {
      onSave({ type: 'error', text: result.error || 'حدث خطأ أثناء إرسال طلب السحب' });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-slate-600 dark:text-slate-400">جاري التحميل...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="wallet" className="space-y-6">
      {/* Balance Card */}
      <div className="relative overflow-hidden bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-sm border border-primary/5">
        <div className="absolute top-0 left-0 w-24 sm:w-32 h-24 sm:h-32 bg-primary/5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6 relative z-10">
          <div className="flex flex-col items-center md:items-start">
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium mb-1">إجمالي الأرباح</p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white flex flex-wrap items-baseline gap-2 justify-center md:justify-start">
              <span className="break-all">{balance.toFixed(2)}</span>
              <span className="text-lg sm:text-xl font-bold text-primary">{getCurrencySymbol(currency)}</span>
            </h1>
          </div>
          <button
            onClick={() => setShowWithdrawalForm(true)}
            className="w-full md:w-auto flex-1 md:flex-none min-w-[140px] px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <span className="material-symbols-outlined text-base sm:text-lg">account_balance</span>
            سحب رصيدي
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Bank Accounts */}
        <div className="flex flex-col gap-4 sm:gap-6 bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-primary/5">
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
        <div className="flex flex-col gap-4 sm:gap-6 bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-primary/5">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">payments</span>
            <h3 className="text-lg font-bold text-center">طلب سحب</h3>
          </div>
          <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-2xl flex justify-between items-center">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">متاح للسحب</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">
                {balance.toFixed(2)} {getCurrencySymbol(currency)}
              </p>
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
              className="w-full py-3 bg-slate-900 dark:bg-slate-700 text-white font-bold rounded-xl hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors text-center"
            >
              طلب سحب جديد
            </button>
          )}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="flex flex-col gap-4 bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-primary/5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
          <h3 className="text-base sm:text-lg font-bold">سجل الأرباح والمدفوعات</h3>
          <button className="text-primary text-xs sm:text-sm font-bold hover:underline">عرض الكل</button>
        </div>
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="inline-block min-w-full align-middle px-4 sm:px-0">
            <table className="w-full text-right min-w-[600px]">
              <thead>
                <tr className="text-slate-400 dark:text-slate-500 text-xs sm:text-sm border-b border-slate-100 dark:border-slate-700">
                  <th className="py-3 sm:py-4 px-2 sm:px-4 font-semibold">التاريخ</th>
                  <th className="py-3 sm:py-4 px-2 sm:px-4 font-semibold">الوصف</th>
                  <th className="py-3 sm:py-4 px-2 sm:px-4 font-semibold">المبلغ</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length > 0 ? (
                  transactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b border-slate-100 dark:border-slate-700">
                      <td className={`py-3 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm whitespace-nowrap`}>
                        {transaction.createdAt?.toDate ? new Date(transaction.createdAt.toDate()).toLocaleDateString('ar-SA') : 'غير متاح'}
                      </td>
                      <td className={`py-3 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm`}>
                        {transaction.description || 'معاملة'}
                      </td>
                      <td className={`py-3 sm:py-4 px-2 sm:px-4 font-bold text-xs sm:text-sm whitespace-nowrap ${
                        transaction.type === 'earning' ? 'text-green-600 dark:text-green-400' : 'text-slate-900 dark:text-white'
                      }`}>
                        {transaction.type === 'earning' ? '+' : '-'}{transaction.amount.toFixed(2)} {getCurrencySymbol(transaction.currency)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                      لا توجد معاملات
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

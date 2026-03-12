/**
 * Hook for managing wallet business logic
 */

import { useState, useEffect } from 'react';
import { WalletService } from '../../../services/walletService';
import type { Currency } from '../../../shared/types/teacher.types';

export interface WithdrawalFormData {
  amount: string;
  bankName: string;
  accountNumber: string;
  iban: string;
}

export function useWallet(teacherId: string | null) {
  const [balance, setBalance] = useState(0);
  const [currency, setCurrency] = useState<Currency>('SAR');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showWithdrawalForm, setShowWithdrawalForm] = useState(false);
  const [withdrawalForm, setWithdrawalForm] = useState<WithdrawalFormData>({
    amount: '',
    bankName: '',
    accountNumber: '',
    iban: '',
  });

  useEffect(() => {
    if (!teacherId) {
      setLoading(false);
      return;
    }

    const fetchWalletData = async () => {
      setLoading(true);
      try {
        const walletService = new WalletService();
        const walletData = await walletService.getWalletData(teacherId);
        setBalance(walletData.balance);
        setCurrency(walletData.currency);
        setTransactions(walletData.transactions);
        setWithdrawals(walletData.withdrawalRequests);
      } catch (error) {
        console.error('Error fetching wallet data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWalletData();
  }, [teacherId]);

  const submitWithdrawal = async () => {
    if (!teacherId) return { success: false, error: 'Teacher ID is required' };

    const amount = parseFloat(withdrawalForm.amount);
    if (amount <= 0 || amount > balance) {
      return { success: false, error: 'المبلغ غير صحيح' };
    }

    if (!withdrawalForm.bankName || !withdrawalForm.accountNumber) {
      return { success: false, error: 'يرجى إدخال جميع البيانات المطلوبة' };
    }

    setSaving(true);
    try {
      const walletService = new WalletService();
      await walletService.submitWithdrawalRequest({
        teacherId,
        amount,
        currency,
        bankName: withdrawalForm.bankName,
        accountNumber: withdrawalForm.accountNumber,
        iban: withdrawalForm.iban || '',
      });

      await walletService.updateBalanceAfterWithdrawal(teacherId, balance, amount);
      const newBalance = balance - amount;
      setBalance(newBalance);

      setShowWithdrawalForm(false);
      setWithdrawalForm({ amount: '', bankName: '', accountNumber: '', iban: '' });

      return { success: true };
    } catch (error) {
      console.error('Error submitting withdrawal:', error);
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ أثناء إرسال طلب السحب';
      return { success: false, error: errorMessage };
    } finally {
      setSaving(false);
    }
  };

  return {
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
  };
}

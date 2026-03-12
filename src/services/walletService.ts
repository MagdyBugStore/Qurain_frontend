/**
 * Wallet Service
 * Business logic layer for wallet operations
 */

import { TeacherRepository } from '../infrastructure/firebase/repositories/TeacherRepository';
import { WITHDRAWAL_STATUS } from '../constants/status';
import type { Wallet, WithdrawalRequest } from '../features/teachers/domain/entities/Wallet';
import type { Currency } from '../shared/types/teacher.types';

export interface WalletData {
  balance: number;
  currency: Currency;
  transactions: any[];
  withdrawalRequests: WithdrawalRequest[];
}

export interface WithdrawalRequestData {
  teacherId: string;
  amount: number;
  currency: Currency;
  bankName: string;
  accountNumber: string;
  iban?: string;
}

export class WalletService {
  private repository: TeacherRepository;

  constructor() {
    this.repository = new TeacherRepository();
  }

  /**
   * Get complete wallet data for a teacher
   */
  async getWalletData(teacherId: string): Promise<WalletData> {
    try {
      const [wallet, transactions, withdrawalRequests] = await Promise.all([
        this.repository.getWallet(teacherId),
        this.repository.getTransactions(teacherId, 50),
        this.repository.getWithdrawalRequests(teacherId, 20),
      ]);

      return {
        balance: wallet?.balance || 0,
        currency: (wallet?.currency as Currency) || 'SAR',
        transactions: transactions as any[],
        withdrawalRequests: withdrawalRequests,
      };
    } catch (error) {
      console.error('Error getting wallet data:', error);
      throw error;
    }
  }

  /**
   * Submit a withdrawal request
   */
  async submitWithdrawalRequest(data: WithdrawalRequestData): Promise<string> {
    try {
      // Validate amount
      if (data.amount <= 0) {
        throw new Error('المبلغ يجب أن يكون أكبر من الصفر');
      }

      if (!data.bankName || !data.accountNumber) {
        throw new Error('يرجى إدخال جميع البيانات المطلوبة');
      }

      // Create withdrawal request
      const requestId = await this.repository.createWithdrawalRequest({
        teacherId: data.teacherId,
        amount: data.amount,
        currency: data.currency,
        bankName: data.bankName,
        accountNumber: data.accountNumber,
        iban: data.iban || '',
        status: WITHDRAWAL_STATUS.PENDING,
      });

      return requestId;
    } catch (error) {
      console.error('Error submitting withdrawal request:', error);
      throw error;
    }
  }

  /**
   * Update wallet balance after withdrawal
   */
  async updateBalanceAfterWithdrawal(teacherId: string, currentBalance: number, withdrawalAmount: number): Promise<void> {
    try {
      const newBalance = currentBalance - withdrawalAmount;
      if (newBalance < 0) {
        throw new Error('الرصيد غير كافي');
      }

      await this.repository.updateWalletBalance(teacherId, newBalance);
    } catch (error) {
      console.error('Error updating wallet balance:', error);
      throw error;
    }
  }
}

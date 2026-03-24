/**
 * Wallet Service
 * Business logic layer for wallet operations
 * NOTE: Firestore removed - this service is now a placeholder
 */

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
  constructor() {
    // Firestore removed
  }

  /**
   * Get complete wallet data for a teacher
   */
  async getWalletData(teacherId: string): Promise<WalletData> {
    console.warn('WalletService.getWalletData: Firestore removed, returning empty wallet');
    return {
      balance: 0,
      currency: 'SAR',
      transactions: [],
      withdrawalRequests: [],
    };
  }

  /**
   * Submit a withdrawal request
   */
  async submitWithdrawalRequest(data: WithdrawalRequestData): Promise<string> {
    throw new Error('WalletService.submitWithdrawalRequest: Firestore removed - use backend API instead');
  }

  /**
   * Update wallet balance after withdrawal
   */
  async updateBalanceAfterWithdrawal(teacherId: string, currentBalance: number, withdrawalAmount: number): Promise<void> {
    throw new Error('WalletService.updateBalanceAfterWithdrawal: Firestore removed - use backend API instead');
  }
}

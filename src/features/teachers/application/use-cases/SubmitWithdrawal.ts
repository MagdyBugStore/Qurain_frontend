/**
 * Submit Withdrawal Use Case
 * Creates a withdrawal request and updates wallet balance
 */

import type { ITeacherRepository } from '../../domain/interfaces/ITeacherRepository';
import type { WithdrawalRequest } from '../../domain/entities/Wallet';

export interface WithdrawalData {
  teacherId: string;
  amount: number;
  currency: string;
  bankName: string;
  accountNumber: string;
  iban?: string;
}

export class SubmitWithdrawal {
  constructor(private repository: ITeacherRepository) {}

  async execute(data: WithdrawalData): Promise<string> {
    // Validate amount
    const wallet = await this.repository.getWallet(data.teacherId);
    if (!wallet) {
      throw new Error('Wallet not found');
    }
    
    if (data.amount <= 0 || data.amount > wallet.balance) {
      throw new Error('Invalid withdrawal amount');
    }

    // Create withdrawal request
    const requestId = await this.repository.createWithdrawalRequest({
      teacherId: data.teacherId,
      amount: data.amount,
      currency: data.currency,
      bankName: data.bankName,
      accountNumber: data.accountNumber,
      iban: data.iban,
      status: 'pending',
    });

    // Update wallet balance
    const newBalance = wallet.balance - data.amount;
    await this.repository.updateWalletBalance(data.teacherId, newBalance);

    return requestId;
  }
}

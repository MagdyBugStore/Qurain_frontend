/**
 * Wallet Domain Entity
 * Represents teacher's earnings and transactions
 */

export type TransactionType = 'earning' | 'withdrawal';
export type TransactionStatus = 'pending' | 'completed' | 'rejected';

export interface Transaction {
  id: string;
  teacherId: string;
  type: TransactionType;
  amount: number;
  currency: string;
  description: string;
  status: TransactionStatus;
  createdAt: any;
}

export interface WithdrawalRequest {
  id: string;
  teacherId: string;
  amount: number;
  currency: string;
  bankName: string;
  accountNumber: string;
  iban?: string;
  status: TransactionStatus;
  createdAt: any;
}

export interface Wallet {
  teacherId: string;
  balance: number;
  currency: string;
  transactions: Transaction[];
  withdrawalRequests: WithdrawalRequest[];
}

import { Request } from 'express';


export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
     accountNumber: string; 
    karmaIsBlacklisted: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface Wallet {
    id: string;
    userId: string;
    balance: number;
    currency: string;
    status: 'active' | 'frozen' | 'closed';
    createdAt: Date;
    updatedAt: Date;
}

export interface Transaction {
    id: string;
    reference: string;
    userId: string;
    walletId: string;
    type: 'CREDIT' | 'DEBIT';
    amount: number;
    description?: string;
    status: 'PENDING' | 'COMPLETED' | 'FAILED';
    metadata?: any;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateUserRequest {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
}

export interface FundWalletRequest {
    amount: number;
    description?: string;
}

export interface TransferRequest {
     recipientAccountNumber: string;
    amount: number;
    description?: string;
}

export interface WithdrawRequest {
    amount: number;
    description?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface AuthRequest extends Request {
    user?: User;
}

import { Request, Response, NextFunction } from 'express';
import { WalletService } from '../services/wallet.service';
import { AuthRequest } from '../types';

export class WalletController {
    private walletService: WalletService;

    constructor() {
        this.walletService = new WalletService();
    }

    getBalance = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const userId = req.user!.id;
            const wallet = await this.walletService.getWalletBalance(userId);

            res.status(200).json({
                status: 'success',
                message: 'Wallet balance retrieved successfully',
                data: {
                    wallet: {
                        balance: wallet.balance,
                        currency: wallet.currency
                    }
                }
            });
        } catch (error) {
            next(error);
        }
    };

    fundWallet = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const userId = req.user!.id;
            const fundData = req.body;
            
            const transaction = await this.walletService.fundWallet(userId, fundData);

            res.status(200).json({
                status: 'success',
                message: 'Wallet funded successfully',
                data: {
                    transaction: {
                        id: transaction.id,
                        reference: transaction.reference,
                        type: transaction.type,
                        amount: transaction.amount,
                        description: transaction.description,
                        status: transaction.status,
                        createdAt: transaction.createdAt
                    }
                }
            });
        } catch (error) {
            next(error);
        }
    };

    transfer = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const userId = req.user!.id;
            const transferData = req.body;
            
            const transaction = await this.walletService.transferFunds(userId, transferData);

            res.status(200).json({
                status: 'success',
                message: 'Transfer completed successfully',
                data: {
                    transaction: {
                        id: transaction.id,
                        reference: transaction.reference,
                        type: transaction.type,
                        amount: transaction.amount,
                        description: transaction.description,
                        status: transaction.status,
                        createdAt: transaction.createdAt
                    }
                }
            });
        } catch (error) {
            next(error);
        }
    };

    withdraw = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const userId = req.user!.id;
            const withdrawData = req.body;
            
   // Validate request body
        if (!withdrawData || Object.keys(withdrawData).length === 0) {
            return res.status(400).json({
                status: 'error',
                message: 'Request body is required'
            });
        }

        if (!withdrawData.amount) {
            return res.status(400).json({
                status: 'error',
                message: 'Amount is required'
            });
        }

        if (isNaN(withdrawData.amount) || withdrawData.amount <= 0) {
            return res.status(400).json({
                status: 'error',
                message: 'Amount must be a positive number'
            });
        }

            const transaction = await this.walletService.withdrawFunds(userId, withdrawData);

            res.status(200).json({
                status: 'success',
                message: 'Withdrawal completed successfully',
                data: {
                    transaction: {
                        id: transaction.id,
                        reference: transaction.reference,
                        type: transaction.type,
                        amount: transaction.amount,
                        description: transaction.description,
                        status: transaction.status,
                        createdAt: transaction.createdAt
                    }
                }
            });
        } catch (error) {
            next(error);
        }
    };

    getTransactions = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const userId = req.user!.id;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            
            const result = await this.walletService.getTransactionHistory(userId, page, limit);

            res.status(200).json({
                status: 'success',
                message: 'Transaction history retrieved successfully',
                data: {
                    transactions: result.transactions.map(transaction => ({
                        id: transaction.id,
                        reference: transaction.reference,
                        type: transaction.type,
                        amount: transaction.amount,
                        description: transaction.description,
                        status: transaction.status,
                        createdAt: transaction.createdAt
                    })),
                    pagination: {
                        page: result.page,
                        limit: result.limit,
                        total: result.total,
                        pages: Math.ceil(result.total / result.limit)
                    }
                }
            });
        } catch (error) {
            next(error);
        }
    };
}

import { v4 as uuidv4 } from 'uuid';
import { WalletRepository } from '../repositories/wallet.repository';
import { TransactionRepository } from '../repositories/transaction.repository';
import { UserRepository } from '../repositories/user.repository';
import { Wallet, Transaction, FundWalletRequest, TransferRequest, WithdrawRequest } from '../types';
import { AppError } from '../utils/AppError';
import { dbConfig } from '../config/database';

export class WalletService {
    private walletRepository: WalletRepository;
    private transactionRepository: TransactionRepository;
    private userRepository: UserRepository;

    constructor() {
        this.walletRepository = new WalletRepository();
        this.transactionRepository = new TransactionRepository();
        this.userRepository = new UserRepository();
    }

    async getWalletBalance(userId: string): Promise<Wallet> {
        const wallet = await this.walletRepository.findByUserId(userId);
        if (!wallet) {
            throw new AppError('Wallet not found', 404);
        }
        return wallet;
    }

    async fundWallet(userId: string, fundData: FundWalletRequest): Promise<Transaction> {
        const trx = await dbConfig.transaction();
        
        try {
            const wallet = await this.walletRepository.findByUserId(userId);
            if (!wallet) {
                throw new AppError('Wallet not found', 404);
            }

            // Create transaction record
            const transaction = await this.transactionRepository.create({
                id: uuidv4(),
                reference: this.generateTransactionReference(),
                userId: userId,
                walletId: wallet.id,
                type: 'CREDIT',
                amount: fundData.amount,
                description: fundData.description || 'Wallet funding',
                status: 'PENDING'
            }, trx);

            // Update wallet balance
            await this.walletRepository.updateBalance(
                wallet.id,
                wallet.balance + fundData.amount,
                trx
            );

            // Mark transaction as completed
            await this.transactionRepository.updateStatus(
                transaction.id,
                'COMPLETED',
                trx
            );

            await trx.commit();
            return { ...transaction, status: 'COMPLETED' };
        } catch (error) {
            await trx.rollback();
            throw error;
        }
    }

    async transferFunds(userId: string, transferData: TransferRequest): Promise<Transaction> {
        const trx = await dbConfig.transaction();
        
        try {
            // Get sender's wallet
            const senderWallet = await this.walletRepository.findByUserId(userId);
            if (!senderWallet) {
                throw new AppError('Sender wallet not found', 404);
            }

            // Check sender's balance
            if (senderWallet.balance < transferData.amount) {
                throw new AppError('Insufficient funds', 400);
            }

            // Get recipient
            const recipient = await this.userRepository.findByAccountNumber(transferData.recipientAccountNumber);
            if (!recipient) {
                throw new AppError('Recipient account not found', 404);
            }

            // Get recipient's wallet
            const recipientWallet = await this.walletRepository.findByUserId(recipient.id);
            if (!recipientWallet) {
                throw new AppError('Recipient wallet not found', 404);
            }

            // Check if sender is trying to transfer to themselves
            if (userId === recipient.id) {
                throw new AppError('Cannot transfer funds to yourself', 400);
            }

             const debitReference = this.generateTransactionReference();
              const creditReference = this.generateTransactionReference();
        
                 const transferId = uuidv4();

            // Create debit transaction for sender
            const debitTransaction = await this.transactionRepository.create({
                id: uuidv4(),
                reference: debitReference,
                userId: userId,
                walletId: senderWallet.id,
                type: 'DEBIT',
                amount: transferData.amount,
                description: `Transfer to ${transferData.recipientAccountNumber}`,
                status: 'PENDING',
                metadata: { recipientAccountNumber: transferData.recipientAccountNumber }
            }, trx);

            // Create credit transaction for recipient
           const creditTransaction = await this.transactionRepository.create({
            id: uuidv4(),
            reference: creditReference, 
            userId: recipient.id,
            walletId: recipientWallet.id,
            type: 'CREDIT',
            amount: transferData.amount,
            description: `Transfer from ${userId}`,
            status: 'PENDING',
            metadata: { 
                senderUserId: userId,
                transferId: transferId,
                relatedTransactionReference: debitReference
            }
        }, trx);

            // Update sender's wallet balance
            await this.walletRepository.updateBalance(
                senderWallet.id,
                senderWallet.balance - transferData.amount,
                trx
            );

              // Update recipient's wallet balance
        await this.walletRepository.updateBalance(
            recipientWallet.id,
            recipientWallet.balance + transferData.amount,
            trx
        );


        // Mark both transactions as completed
        await this.transactionRepository.updateStatus(
            debitTransaction.id,
            'COMPLETED',
            trx
        );
        
          
        await this.transactionRepository.updateStatus(
            creditTransaction.id,
            'COMPLETED',
            trx
        );
            await trx.commit();
            return { ...debitTransaction, status: 'COMPLETED' };
        } catch (error) {
            await trx.rollback();
            throw error;
        }
    }

    async withdrawFunds(userId: string, withdrawData: WithdrawRequest): Promise<Transaction> {
        const trx = await dbConfig.transaction();
        
        try {

              // Validate withdrawData
        if (!withdrawData) {
            throw new AppError('Withdrawal data is required', 400);
        }
        
        if (!withdrawData.amount || withdrawData.amount <= 0) {
            throw new AppError('Valid withdrawal amount is required', 400);
        }

            const wallet = await this.walletRepository.findByUserId(userId);
            if (!wallet) {
                throw new AppError('Wallet not found', 404);
            }

            // Check balance
            if (wallet.balance < withdrawData.amount) {
                throw new AppError('Insufficient funds', 400);
            }

            // Create transaction record
            const transaction = await this.transactionRepository.create({
                id: uuidv4(),
                reference: this.generateTransactionReference(),
                userId: userId,
                walletId: wallet.id,
                type: 'DEBIT',
                amount: withdrawData.amount,
                description: withdrawData.description || 'Wallet withdrawal',
                status: 'PENDING'
            }, trx);

            // Update wallet balance
            await this.walletRepository.updateBalance(
                wallet.id,
                wallet.balance - withdrawData.amount,
                trx
            );

            // Mark transaction as completed
            await this.transactionRepository.updateStatus(
                transaction.id,
                'COMPLETED',
                trx
            );

            await trx.commit();
            return { ...transaction, status: 'COMPLETED' };
        } catch (error) {
            await trx.rollback();
            throw error;
        }
    }

    async getTransactionHistory(userId: string, page: number = 1, limit: number = 10): Promise<{
        transactions: Transaction[];
        total: number;
        page: number;
        limit: number;
    }> {
        const offset = (page - 1) * limit;
        const { transactions, total } = await this.transactionRepository.findByUserId(
            userId,
            limit,
            offset
        );

        return {
            transactions,
            total,
            page,
            limit
        };
    }

    private generateTransactionReference(): string {
        return `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}

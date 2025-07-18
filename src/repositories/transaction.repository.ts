import { Knex } from 'knex';
import { dbConfig } from '../config/database';
import { Transaction } from '../types';

export class TransactionRepository {
    private db: Knex;
    private tableName = 'transactions';

    constructor() {
        this.db = dbConfig;
    }

    async create(transactionData: Partial<Transaction>, trx?: Knex.Transaction): Promise<Transaction> {
        const query = trx ? trx(this.tableName) : this.db(this.tableName);
        
        // Execute the insert query (MySQL doesn't support .returning())
        await query.insert({
            id: transactionData.id,
            reference: transactionData.reference,
            user_id: transactionData.userId,
            wallet_id: transactionData.walletId,
            type: transactionData.type,
            amount: transactionData.amount,
            description: transactionData.description,
            status: transactionData.status || 'PENDING',
            metadata: transactionData.metadata ? JSON.stringify(transactionData.metadata) : null,
            created_at: new Date(),
            updated_at: new Date()
        });

        // For MySQL, we need to fetch the inserted transaction by ID
        const findQuery = trx ? trx(this.tableName) : this.db(this.tableName);
        const transaction = await findQuery.where('id', transactionData.id!).first();
        
        if (!transaction) {
            throw new Error(`Transaction creation failed. Could not retrieve inserted transaction with ID: ${transactionData.id}`);
        }

        return this.mapToTransaction(transaction);
    }

    async findById(id: string): Promise<Transaction | null> {
        const transaction = await this.db(this.tableName)
            .where('id', id)
            .first();

        return transaction ? this.mapToTransaction(transaction) : null;
    }

    async findByReference(reference: string): Promise<Transaction[]> {
        const transactions = await this.db(this.tableName)
            .where('reference', reference)
            .orderBy('created_at', 'desc');

        return transactions.map(this.mapToTransaction);
    }

    async findByUserId(userId: string, limit: number = 10, offset: number = 0): Promise<{
        transactions: Transaction[];
        total: number;
    }> {
        const transactions = await this.db(this.tableName)
            .where('user_id', userId)
            .orderBy('created_at', 'desc')
            .limit(limit)
            .offset(offset);

        const [{ count }] = await this.db(this.tableName)
            .where('user_id', userId)
            .count('* as count');

        return {
            transactions: transactions.map(this.mapToTransaction),
            total: parseInt(count.toString())
        };
    }

    async updateStatus(id: string, status: 'PENDING' | 'COMPLETED' | 'FAILED', trx?: Knex.Transaction): Promise<void> {
        const query = trx ? trx(this.tableName) : this.db(this.tableName);
        
        await query
            .where('id', id)
            .update({
                status,
                updated_at: new Date()
            });
    }

    async updateStatusByReference(reference: string, status: 'PENDING' | 'COMPLETED' | 'FAILED', trx?: Knex.Transaction): Promise<void> {
        const query = trx ? trx(this.tableName) : this.db(this.tableName);
        
        await query
            .where('reference', reference)
            .update({
                status,
                updated_at: new Date()
            });
    }

    private mapToTransaction(dbTransaction: any): Transaction {
        return {
            id: dbTransaction.id,
            reference: dbTransaction.reference,
            userId: dbTransaction.user_id,
            walletId: dbTransaction.wallet_id,
            type: dbTransaction.type,
            amount: parseFloat(dbTransaction.amount),
            description: dbTransaction.description,
            status: dbTransaction.status,
            metadata: typeof dbTransaction.metadata === 'string'
             ? JSON.parse(dbTransaction.metadata)
             : dbTransaction.metadata,
            createdAt: dbTransaction.created_at,
            updatedAt: dbTransaction.updated_at
        };
    }
}
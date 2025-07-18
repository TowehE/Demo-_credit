import { Knex } from 'knex';
import { dbConfig } from '../config/database';
import { Wallet } from '../types';

export class WalletRepository {
    private db: Knex;
    private tableName = 'wallets';

    constructor() {
        this.db = dbConfig;
    }

    async create(walletData: Partial<Wallet>, trx?: Knex.Transaction): Promise<Wallet> {
        try {
            const query = trx ? trx(this.tableName) : this.db(this.tableName);
            
            console.log('Attempting to create wallet with data:', walletData);
            
            // Execute the insert query (MySQL doesn't support .returning())
            const result = await query.insert({
                id: walletData.id,
                user_id: walletData.userId,
                balance: walletData.balance || 0,
                currency: walletData.currency || 'NGN',
                created_at: new Date(),
                updated_at: new Date()
            });

            console.log('Wallet insert result:', result);

            // For MySQL, we need to fetch the inserted wallet by ID
            console.log('Fetching inserted wallet by ID:', walletData.id);
            const findQuery = trx ? trx(this.tableName) : this.db(this.tableName);
            const wallet = await findQuery.where('id', walletData.id!).first();
            
            if (!wallet) {
                throw new Error(`Wallet creation failed. Could not retrieve inserted wallet with ID: ${walletData.id}`);
            }

            console.log('Found wallet:', wallet);
            return this.mapToWallet(wallet);
            
        } catch (error) {
            console.error('Error in wallet create method:', error);
            throw error;
        }
    }

    async findByUserId(userId: string): Promise<Wallet | null> {
        const wallet = await this.db(this.tableName)
            .where('user_id', userId)
            .first();

        return wallet ? this.mapToWallet(wallet) : null;
    }

    async findById(id: string): Promise<Wallet | null> {
        const wallet = await this.db(this.tableName)
            .where('id', id)
            .first();

        return wallet ? this.mapToWallet(wallet) : null;
    }

    async updateBalance(id: string, newBalance: number, trx?: Knex.Transaction): Promise<void> {
        const query = trx ? trx(this.tableName) : this.db(this.tableName);
        
        await query
            .where('id', id)
            .update({
                balance: newBalance,
                updated_at: new Date()
            });
    }

    private mapToWallet(dbWallet: any): Wallet {
        return {
            id: dbWallet.id,
            userId: dbWallet.user_id,
            balance: parseFloat(dbWallet.balance),
            status: dbWallet.status,
            currency: dbWallet.currency,
            createdAt: dbWallet.created_at,
            updatedAt: dbWallet.updated_at
        };
    }
}
import { Knex } from 'knex';
import { dbConfig } from '../config/database';
import { User } from '../types';

export class UserRepository {
    private db: Knex;
    private tableName = 'users';

    constructor() {
        this.db = dbConfig;
    }

    async create(userData: Partial<User>, trx?: Knex.Transaction): Promise<User> {
        try {
            const query = trx ? trx(this.tableName) : this.db(this.tableName);
            
            console.log('Attempting to create user with data:', userData);
            
            // Execute the insert query (MySQL doesn't support .returning())
            const result = await query.insert({
                id: userData.id,
                email: userData.email,
                first_name: userData.firstName,
                last_name: userData.lastName,
                phone: userData.phone,
                account_number: userData.accountNumber,
                karma_is_blacklisted: userData.karmaIsBlacklisted || false,
                created_at: new Date(),
                updated_at: new Date()
            });

            console.log('Insert result:', result);

            // For MySQL, we need to fetch the inserted user by ID
            console.log('Fetching inserted user by ID:', userData.id);
            const findQuery = trx ? trx(this.tableName) : this.db(this.tableName);
            const user = await findQuery.where('id', userData.id!).first();
            
            if (!user) {
                throw new Error(`User creation failed. Could not retrieve inserted user with ID: ${userData.id}`);
            }

            console.log('Found user:', user);
            return this.mapToUser(user);
            
        } catch (error) {
            console.error('Error in create method:', error);
            throw error;
        }
    }

    async findById(id: string): Promise<User | null> {
        const user = await this.db(this.tableName)
            .where('id', id)
            .first();

        return user ? this.mapToUser(user) : null;
    }

    async findByEmail(email: string): Promise<User | null> {
        const user = await this.db(this.tableName)
            .where('email', email)
            .first();

        return user ? this.mapToUser(user) : null;
    }

    async updateBlacklistStatus(id: string, karmaIsBlacklisted: boolean): Promise<void> {
        await this.db(this.tableName)
            .where('id', id)
            .update({
                karma_is_blacklisted: karmaIsBlacklisted, 
                updated_at: new Date()
            });
    }

    async findByAccountNumber(accountNumber: string): Promise<User | null> {
    const user = await this.db(this.tableName)
        .where('account_number', accountNumber)
        .first();

    return user ? this.mapToUser(user) : null;
}
    private mapToUser(dbUser: any): User {
        return {
            id: dbUser.id,
            email: dbUser.email,
            firstName: dbUser.first_name,
            lastName: dbUser.last_name,
            phone: dbUser.phone,
            accountNumber: dbUser.account_number,
            karmaIsBlacklisted: dbUser.karma_is_blacklisted,
            createdAt: dbUser.created_at,
            updatedAt: dbUser.updated_at
        };
    }
}
import { v4 as uuidv4 } from 'uuid';
import { UserRepository } from '../repositories/user.repository';
import { WalletRepository } from '../repositories/wallet.repository';
import { KarmaService } from './karma.service';
import { User, CreateUserRequest } from '../types';
import { AppError } from '../utils/AppError';
import { dbConfig } from '../config/database';
import { generateUniqueAccountNumber } from '../utils/generateReference';

export class UserService {
    private userRepository: UserRepository;
    private walletRepository: WalletRepository;
    private karmaService: KarmaService;

    constructor() {
        this.userRepository = new UserRepository();
        this.walletRepository = new WalletRepository();
        this.karmaService = new KarmaService();
    }

    async createUser(userData: CreateUserRequest): Promise<User> {
        const trx = await dbConfig.transaction();
        
        try {
            // Check if user already exists
            const existingUser = await this.userRepository.findByEmail(userData.email);
            if (existingUser) {
                throw new AppError('User with this email already exists', 409);
            }

            // Check blacklist status
            const karmaIsBlacklisted = await this.karmaService.checkBlacklist(userData.email);
            if (karmaIsBlacklisted) {
                throw new AppError('User is blacklisted and cannot be onboarded', 403);
            }

            
            // Generate unique account number
            const accountNumber = await generateUniqueAccountNumber(this.userRepository);

           

            // Create user
            const userId = uuidv4();
            const user = await this.userRepository.create({
                id: userId,
                ...userData,
                accountNumber,
                karmaIsBlacklisted: false
            }, trx);

            // Create wallet for user
            await this.walletRepository.create({
                id: uuidv4(),
                userId: userId,
                balance: 0,
                currency: 'NGN'
            }, trx);

            await trx.commit();
            return user;
        } catch (error) {
            await trx.rollback();
            throw error;
        }
    }

    async findById(id: string): Promise<User | null> {
        return await this.userRepository.findById(id);
    }

    async findByEmail(email: string): Promise<User | null> {
        return await this.userRepository.findByEmail(email);
    }
}
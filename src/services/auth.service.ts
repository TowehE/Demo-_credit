import jwt from 'jsonwebtoken';
import { UserService } from './user.service';
import { AppError } from '../utils/AppError';
import { WalletService } from './wallet.service';

export class AuthService {
    private userService: UserService;
    private walletService: WalletService;

    constructor() {
        this.userService = new UserService();
        this.walletService = new WalletService();
    }

    async login(email: string): Promise<{ token: string; user: any }> {
        const user = await this.userService.findByEmail(email);
        
        if (!user) {
            throw new AppError('User not found', 404);
        }

        if (user.karmaIsBlacklisted) {
            throw new AppError('User is blacklisted', 403);
        }

        // Fetch user's wallet details
      const wallet = await this.walletService.getWalletBalance(user.id);

        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET!,
            { expiresIn: '24h' }
        );

        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone,
                accountNumber: user.accountNumber,
                karmaIsBlacklisted: user.karmaIsBlacklisted,
                 balance: wallet?.balance ?? 0 
                
            }
        };
    }
}
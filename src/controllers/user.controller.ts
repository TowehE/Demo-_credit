import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { AuthRequest } from '../types';

export class UserController {
    private userService: UserService;

    constructor() {
        this.userService = new UserService();
    }

    register = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userData = req.body;
            const user = await this.userService.createUser(userData);

            res.status(201).json({
                status: 'success',
                message: 'User created successfully',
                data: {
                    user: {
                        id: user.id,
                        email: user.email,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        phone: user.phone,
                        accountNumber: user.accountNumber,
                        karmaIsBlacklisted: user.karmaIsBlacklisted,
                        createdAt: user.createdAt,
                    }
                }
            });
        } catch (error) {
            next(error);
        }
    };

    getProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const user = req.user!;

            res.status(200).json({
                status: 'success',
                message: 'Profile retrieved successfully',
                data: {
                    user: {
                        id: user.id,
                        email: user.email,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        phone: user.phone,
                        accountNumber: user.accountNumber,
                        karmaIsBlacklisted: user.karmaIsBlacklisted,
                        createdAt: user.createdAt
                    }
                }
            });
        } catch (error) {
            next(error);
        }
    };
}
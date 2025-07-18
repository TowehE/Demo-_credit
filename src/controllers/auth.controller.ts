import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { AppError } from '../utils/AppError';

export class AuthController {
    private authService: AuthService;

    constructor() {
        this.authService = new AuthService();
    }

    login = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email } = req.body;
            
            if (!email) {
                return next(new AppError('Email is required', 400));
            }

            const result = await this.authService.login(email);

            res.status(200).json({
                status: 'success',
                message: 'Login successful',
                data: result
            });
        } catch (error) {
            next(error);
        }
    };
}
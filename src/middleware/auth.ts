import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserService } from '../services/user.service';
import { AppError } from '../utils/AppError';
import { AuthRequest } from '../types';

const userService = new UserService();

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return next(new AppError('Access denied. No token provided.', 401));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
        const user = await userService.findById(decoded.userId);
        
        if (!user) {
            return next(new AppError('Invalid token.', 401));
        }

        req.user = user;
        next();
    } catch (error) {
        next(new AppError('Invalid token.', 401));
    }
};

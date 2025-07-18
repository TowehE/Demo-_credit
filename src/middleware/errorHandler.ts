import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { logger } from '../utils/logger';

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    logger.error(err);

    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            status: 'error',
            message: err.message
        });
    }

    // Handle specific database errors
    if (err.message.includes('ER_DUP_ENTRY')) {
        return res.status(409).json({
            status: 'error',
            message: 'Duplicate entry. Resource already exists.'
        });
    }

    // Default error response
    res.status(500).json({
        status: 'error',
        message: 'Something went wrong!'
    });
};
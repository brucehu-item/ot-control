import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
    statusCode: number;
    status: string;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        Error.captureStackTrace(this, this.constructor);
    }
}

export class NotFoundError extends AppError {
    constructor(message: string = 'Resource not found') {
        super(message, 404);
    }
}

export class UnauthorizedError extends AppError {
    constructor(message: string = 'Unauthorized access') {
        super(message, 401);
    }
}

export class ForbiddenError extends AppError {
    constructor(message: string = 'Forbidden access') {
        super(message, 403);
    }
}

export class ValidationError extends AppError {
    constructor(message: string = 'Validation failed') {
        super(message, 400);
    }
}

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    console.error('[Error] ====== Error Handler Start ======');
    console.error(`[Error] Path: ${req.method} ${req.path}`);
    console.error(`[Error] Error Type: ${err.constructor.name}`);
    console.error(`[Error] Message: ${err.message}`);
    
    if (err instanceof AppError) {
        console.error(`[Error] Status Code: ${err.statusCode}`);
        console.error(`[Error] Status: ${err.status}`);
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
    } else {
        console.error('[Error] Unhandled Error - Sending 500 Internal Server Error');
        console.error('[Error] Stack:', err.stack);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
    console.error('[Error] ====== Error Handler End ======\n');
}; 
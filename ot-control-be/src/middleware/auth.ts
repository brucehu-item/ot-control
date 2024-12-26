import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config/config';
import { UnauthorizedError } from './error';
import { SecurityContext } from '../authentication/domain/model/security-context';

interface JwtPayload {
    userId: string;
    organizationId: string;
    role: string;
}

declare module 'express-serve-static-core' {
    interface Request {
        user?: JwtPayload;
    }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    console.log(`[Auth] New request to ${req.method} ${req.path}`);
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            console.log('[Auth] No Bearer token found in authorization header');
            throw new UnauthorizedError('No token provided');
        }

        const token = authHeader.split(' ')[1];
        console.log('[Auth] Attempting to verify JWT token');
        const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;

        SecurityContext.runWithContext(token, async () => {
            console.log('[Auth] Request processing in SecurityContext');
            req.user = decoded;
            console.log(`[Auth] Successfully authenticated user ${decoded.userId} with role ${decoded.role}`);
            return new Promise<void>((resolve) => {
                next();
                resolve();
            });
        }).catch(error => {
            console.error('[Auth] Error in SecurityContext:', error);
            next(error);
        });
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            console.error('[Auth] JWT verification failed:', error.message);
            next(new UnauthorizedError('Invalid token'));
        } else {
            console.error('[Auth] Authentication error:', error);
            next(error);
        }
    }
};

export const requireRole = (allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        console.log(`[Auth] Checking role requirements. Allowed roles: ${allowedRoles.join(', ')}`);
        
        if (!req.user) {
            console.log('[Auth] Role check failed: User not authenticated');
            return next(new UnauthorizedError('User not authenticated'));
        }

        if (!allowedRoles.includes(req.user.role)) {
            console.log(`[Auth] Role check failed: User role ${req.user.role} not in allowed roles`);
            return next(new UnauthorizedError('Insufficient permissions'));
        }

        console.log(`[Auth] Role check passed for user ${req.user.userId}`);
        next();
    };
} 
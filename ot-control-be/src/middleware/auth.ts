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

        // 设置用户信息
        req.user = decoded;
        console.log(`[Auth] Successfully authenticated user ${decoded.userId} with role ${decoded.role}`);

        // 使用SecurityContext.runWithContext来管理token
        SecurityContext.runWithContext(token, () => {
            return new Promise<void>((resolve, reject) => {
                // 将resolve和reject存储在请求对象中，以便后续使用
                (req as any).__securityContextResolve = resolve;
                (req as any).__securityContextReject = reject;

                next();
            });
        }).catch(error => {
            console.error('[Auth] Error in SecurityContext:', error);
            next(error);
        });

        // 在请求结束时处理Promise
        res.on('finish', () => {
            console.log('[Auth] Request finished, resolving SecurityContext');
            if ((req as any).__securityContextResolve) {
                (req as any).__securityContextResolve();
            }
        });

        res.on('error', (error) => {
            console.error('[Auth] Request error, rejecting SecurityContext:', error);
            if ((req as any).__securityContextReject) {
                (req as any).__securityContextReject(error);
            }
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
import { Request, Response } from 'express';
import { Service, Inject } from 'typedi';
import { AuthenticationService } from './domain/ports/authentication-service';
import { AuthenticationFacade } from './domain/ports/authentication-facade';
import { INTERNAL_AUTH_TOKENS } from './di/tokens';
import { AUTH_TOKENS } from '../shared/di/tokens';

@Service()
export class AuthenticationController {
    constructor(
        @Inject(INTERNAL_AUTH_TOKENS.AuthenticationService)
        private authService: AuthenticationService,
        @Inject(AUTH_TOKENS.AuthFacade)
        private authFacade: AuthenticationFacade
    ) {}

    login = async (req: Request, res: Response) => {
        console.log('[Auth] Login attempt:', { username: req.body.username });
        try {
            const { username, password } = req.body;
            console.log('[Auth] Authenticating user...');
            const result = await this.authService.authenticate(username, password);
            console.log('[Auth] Login successful:', { 
                token: result.getToken(),
                expiresAt: result.getExpiresAt()
            });
            res.json(result);
        } catch (error) {
            console.error('[Auth] Login failed:', error);
            res.status(401).json({
                code: 'AUTHENTICATION_FAILED',
                message: 'Invalid username or password'
            });
        }
    };

    logout = async (req: Request, res: Response) => {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new Error('User not authenticated');
            }
            await this.authService.logout(userId);
            res.status(200).send();
        } catch (error) {
            res.status(401).json({
                code: 'LOGOUT_FAILED',
                message: 'Failed to logout'
            });
        }
    };

    refreshToken = async (req: Request, res: Response) => {
        try {
            const token = req.headers.authorization?.split(' ')[1];
            if (!token) {
                throw new Error('No token provided');
            }
            const result = await this.authService.refreshToken(token);
            res.json(result);
        } catch (error) {
            res.status(401).json({
                code: 'TOKEN_REFRESH_FAILED',
                message: 'Failed to refresh token'
            });
        }
    };

    getCurrentUser = async (req: Request, res: Response) => {
        console.log('[Auth] Getting current user info');
        try {
            const userId = req.user?.userId;
            if (!userId) {
                console.error('[Auth] getCurrentUser failed: No user ID in request');
                throw new Error('User not authenticated');
            }
            console.log('[Auth] Fetching user details for:', userId);
            const user = await this.authFacade.getCurrentUser();
            if (!user) {
                console.error('[Auth] User not found');
                throw new Error('User not found');
            }
            console.log('[Auth] User details retrieved successfully:', { 
                userId: user.userId,
                username: user.username,
                role: user.role,
                permissionsCount: user.permissions.length,
                departmentId: user.departmentId,
                departmentName: user.departmentName,
                facilityId: user.facilityId,
                facilityName: user.facilityName
            });
            res.json(user);
        } catch (error) {
            console.error('[Auth] getCurrentUser failed:', error);
            res.status(401).json({
                code: 'GET_CURRENT_USER_FAILED',
                message: 'Failed to get current user'
            });
        }
    };
} 
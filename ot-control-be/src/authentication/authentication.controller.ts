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
        try {
            const { username, password } = req.body;
            const result = await this.authService.authenticate(username, password);
            res.json(result);
        } catch (error) {
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
        try {
            const userInfo = await this.authFacade.getCurrentUser();
            if (!userInfo) {
                throw new Error('User not found');
            }
            res.json(userInfo);
        } catch (error) {
            res.status(401).json({
                code: 'USER_INFO_FAILED',
                message: 'Failed to get user information'
            });
        }
    };
} 
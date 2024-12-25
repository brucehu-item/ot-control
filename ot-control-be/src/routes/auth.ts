import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth';
import { AuthenticationController } from '../authentication/authentication.controller';
import { GlobalContainer } from '../shared/di/container';

const router = Router();

// Login
router.post('/login', (req: Request, res: Response) => {
    const authController = GlobalContainer.getInstance().get(AuthenticationController);
    return authController.login(req, res);
});

// Logout
router.post('/logout', authenticate, (req: Request, res: Response) => {
    const authController = GlobalContainer.getInstance().get(AuthenticationController);
    return authController.logout(req, res);
});

// Refresh token
router.post('/token/refresh', authenticate, (req: Request, res: Response) => {
    const authController = GlobalContainer.getInstance().get(AuthenticationController);
    return authController.refreshToken(req, res);
});

// Get current user info
router.get('/me', authenticate, (req: Request, res: Response) => {
    const authController = GlobalContainer.getInstance().get(AuthenticationController);
    return authController.getCurrentUser(req, res);
});

export default router; 
import { Router, Request, Response } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { OvertimeController } from '../overtime/infrastructure/controllers/overtime.controller';
import { GlobalContainer } from '../shared/di/container';

const router = Router();

// Create overtime request
router.post('/overtime/overtime-requests', authenticate, (req: Request, res: Response) => {
    const overtimeController = GlobalContainer.getInstance().get(OvertimeController);
    return overtimeController.createRequest(req, res);
});

// Get overtime requests
router.get('/overtime/overtime-requests', authenticate, (req: Request, res: Response) => {
    const overtimeController = GlobalContainer.getInstance().get(OvertimeController);
    return overtimeController.findRequests(req, res);
});

// Get overtime request details
router.get('/overtime/overtime-requests/:requestId', authenticate, (req: Request, res: Response) => {
    const overtimeController = GlobalContainer.getInstance().get(OvertimeController);
    return overtimeController.getRequestDetails(req, res);
});

// Approve overtime request
router.post('/overtime/overtime-requests/:requestId/approve', authenticate, requireRole(['SUPERVISOR', 'MANAGER', 'CUSTOMER']), (req: Request, res: Response) => {
    const overtimeController = GlobalContainer.getInstance().get(OvertimeController);
    return overtimeController.approveRequest(req, res);
});

// Reject overtime request
router.post('/overtime/overtime-requests/:requestId/reject', authenticate, requireRole(['SUPERVISOR', 'MANAGER', 'CUSTOMER']), (req: Request, res: Response) => {
    const overtimeController = GlobalContainer.getInstance().get(OvertimeController);
    return overtimeController.rejectRequest(req, res);
});

// Edit overtime request
router.put('/overtime/overtime-requests/:requestId', authenticate, requireRole(['WORKER']), (req: Request, res: Response) => {
    const overtimeController = GlobalContainer.getInstance().get(OvertimeController);
    return overtimeController.editRequest(req, res);
});

// Cancel overtime request
router.post('/overtime/overtime-requests/:requestId/cancel', authenticate, requireRole(['WORKER']), (req: Request, res: Response) => {
    const overtimeController = GlobalContainer.getInstance().get(OvertimeController);
    return overtimeController.cancelRequest(req, res);
});

export default router; 
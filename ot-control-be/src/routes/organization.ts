import { Router, Request, Response } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { OrganizationController } from '../organization/infrastructure/controllers/organization.controller';
import { GlobalContainer } from '../shared/di/container';

const router = Router();

// Get departments
router.get('/departments', authenticate, (req: Request, res: Response) => {
    const organizationController = GlobalContainer.getInstance().get(OrganizationController);
    return organizationController.getDepartments(req, res);
});

// Get facility customers
router.get('/facilities/:facilityId/customers', authenticate, (req: Request, res: Response) => {
    const organizationController = GlobalContainer.getInstance().get(OrganizationController);
    return organizationController.getFacilityCustomers(req, res);
});

// Get department hierarchy
router.get('/departments/:departmentId', authenticate, (req: Request, res: Response) => {
    const organizationController = GlobalContainer.getInstance().get(OrganizationController);
    return organizationController.getDepartmentHierarchy(req, res);
});

// Change department supervisor
router.put('/departments/:departmentId/supervisor', authenticate, requireRole(['SYSTEM_ADMIN', 'MANAGER']), (req: Request, res: Response) => {
    const organizationController = GlobalContainer.getInstance().get(OrganizationController);
    return organizationController.changeDepartmentSupervisor(req, res);
});

// Change facility manager
router.put('/facilities/:facilityId/manager', authenticate, requireRole(['SYSTEM_ADMIN']), (req: Request, res: Response) => {
    const organizationController = GlobalContainer.getInstance().get(OrganizationController);
    return organizationController.changeFacilityManager(req, res);
});

// Assign user to department
router.post('/users/:userId/department', authenticate, requireRole(['SYSTEM_ADMIN', 'MANAGER']), (req: Request, res: Response) => {
    const organizationController = GlobalContainer.getInstance().get(OrganizationController);
    return organizationController.assignUserToDepartment(req, res);
});

// Assign user to facility
router.post('/users/:userId/facility', authenticate, requireRole(['SYSTEM_ADMIN']), (req: Request, res: Response) => {
    const organizationController = GlobalContainer.getInstance().get(OrganizationController);
    return organizationController.assignUserToFacility(req, res);
});

export default router; 
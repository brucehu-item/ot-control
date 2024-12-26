import { Router, Request, Response } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { OrganizationController } from '../organization/infrastructure/controllers/organization.controller';
import { GlobalContainer } from '../shared/di/container';

const router = Router();

// Get facility customers
router.get('/organization/facilities/:facilityId/customers', authenticate, (req: Request, res: Response) => {
    const organizationController = GlobalContainer.getInstance().get(OrganizationController);
    return organizationController.getFacilityCustomers(req, res);
});

// Get department hierarchy
router.get('/organization/departments/:departmentId', authenticate, (req: Request, res: Response) => {
    const organizationController = GlobalContainer.getInstance().get(OrganizationController);
    return organizationController.getDepartmentHierarchy(req, res);
});

// Change department supervisor
router.put('/organization/departments/:departmentId/supervisor', authenticate, requireRole(['SYSTEM_ADMIN', 'MANAGER']), (req: Request, res: Response) => {
    const organizationController = GlobalContainer.getInstance().get(OrganizationController);
    return organizationController.changeDepartmentSupervisor(req, res);
});

// Change facility manager
router.put('/organization/facilities/:facilityId/manager', authenticate, requireRole(['SYSTEM_ADMIN']), (req: Request, res: Response) => {
    const organizationController = GlobalContainer.getInstance().get(OrganizationController);
    return organizationController.changeFacilityManager(req, res);
});

// Assign user to department
router.post('/organization/users/:userId/department', authenticate, requireRole(['SYSTEM_ADMIN', 'MANAGER']), (req: Request, res: Response) => {
    const organizationController = GlobalContainer.getInstance().get(OrganizationController);
    return organizationController.assignUserToDepartment(req, res);
});

// Assign user to facility
router.post('/organization/users/:userId/facility', authenticate, requireRole(['SYSTEM_ADMIN']), (req: Request, res: Response) => {
    const organizationController = GlobalContainer.getInstance().get(OrganizationController);
    return organizationController.assignUserToFacility(req, res);
});

export default router; 
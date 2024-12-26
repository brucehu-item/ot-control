import { Request, Response } from 'express';
import { Service, Inject } from 'typedi';
import { OrganizationService } from '../../domain/services/organization.service';
import { UserAssignmentService } from '../../domain/services/user-assignment.service';
import { ORGANIZATION_TOKENS } from '../../di/tokens';
import { Department } from '../../domain/entities/department';

@Service()
export class OrganizationController {
    constructor(
        @Inject(ORGANIZATION_TOKENS.ORGANIZATION_SERVICE)
        private readonly organizationService: OrganizationService,
        @Inject(ORGANIZATION_TOKENS.USER_ASSIGNMENT_SERVICE)
        private readonly userAssignmentService: UserAssignmentService
    ) {}

    getDepartments = async (req: Request, res: Response) => {
        try {
            const { facilityId } = req.query;
            const departments: Department[] = await this.organizationService.getDepartmentsByFacility(facilityId as string);
            
            // 转换为前端需要的格式
            const result = departments.map(dept => ({
                departmentId: dept.getDepartmentId(),
                name: dept.getName(),
                facilityId: dept.getFacilityId(),
                supervisorId: dept.getSupervisorId()
            }));

            res.json(result);
        } catch (error) {
            res.status(500).json({
                code: 'GET_DEPARTMENTS_ERROR',
                message: 'Failed to get departments'
            });
        }
    };

    getFacilityCustomers = async (req: Request, res: Response) => {
        try {
            const { facilityId } = req.params;
            const customers = await this.organizationService.getFacilityCustomers(facilityId);
            res.json(customers);
        } catch (error) {
            res.status(500).json({
                code: 'FACILITY_CUSTOMERS_ERROR',
                message: 'Failed to get facility customers'
            });
        }
    };

    getDepartmentHierarchy = async (req: Request, res: Response) => {
        try {
            const { departmentId } = req.params;
            const hierarchy = await this.organizationService.getDepartmentHierarchy(departmentId);
            res.json(hierarchy);
        } catch (error) {
            res.status(500).json({
                code: 'DEPARTMENT_HIERARCHY_ERROR',
                message: 'Failed to get department hierarchy'
            });
        }
    };

    changeDepartmentSupervisor = async (req: Request, res: Response) => {
        try {
            const { departmentId } = req.params;
            const { supervisorId } = req.body;
            await this.userAssignmentService.changeDepartmentSupervisor(departmentId, supervisorId);
            res.status(200).send();
        } catch (error) {
            res.status(500).json({
                code: 'CHANGE_SUPERVISOR_ERROR',
                message: 'Failed to change department supervisor'
            });
        }
    };

    changeFacilityManager = async (req: Request, res: Response) => {
        try {
            const { facilityId } = req.params;
            const { managerId } = req.body;
            await this.userAssignmentService.changeFacilityManager(facilityId, managerId);
            res.status(200).send();
        } catch (error) {
            res.status(500).json({
                code: 'CHANGE_MANAGER_ERROR',
                message: 'Failed to change facility manager'
            });
        }
    };

    assignUserToDepartment = async (req: Request, res: Response) => {
        try {
            const { userId } = req.params;
            const { departmentId } = req.body;
            await this.userAssignmentService.assignUserToDepartment(userId, departmentId);
            res.status(200).send();
        } catch (error) {
            res.status(500).json({
                code: 'ASSIGN_USER_ERROR',
                message: 'Failed to assign user to department'
            });
        }
    };

    assignUserToFacility = async (req: Request, res: Response) => {
        try {
            const { userId } = req.params;
            const { facilityId } = req.body;
            await this.userAssignmentService.assignUserToFacility(userId, facilityId);
            res.status(200).send();
        } catch (error) {
            res.status(500).json({
                code: 'ASSIGN_USER_ERROR',
                message: 'Failed to assign user to facility'
            });
        }
    };
} 
import { Request, Response } from 'express';
import { Service, Inject } from 'typedi';
import { OvertimeRequestService } from '../../domain/services/overtime-request.service';
import { OVERTIME_TOKENS } from '../../di/tokens';
import { OvertimeRequestData } from '../../domain/value-objects/overtime-request-data';
import { OvertimeRequestEditData } from '../../domain/value-objects/overtime-request-edit-data';
import { RequestSearchCriteria } from '../../domain/value-objects/request-search-criteria';
import { UserRole } from '../../domain/value-objects/user-role';
import { OvertimeRequestStatus } from '../../domain/value-objects/overtime-request-status';
import { UserRepository } from '../../../organization/domain/repositories/user.repository';
import { ORGANIZATION_TOKENS } from '../../../organization/di/tokens';

@Service()
export class OvertimeController {
    constructor(
        @Inject(OVERTIME_TOKENS.OvertimeRequestService)
        private readonly overtimeService: OvertimeRequestService,
        @Inject(ORGANIZATION_TOKENS.USER_REPOSITORY)
        private readonly userRepository: UserRepository
    ) {}

    createRequest = async (req: Request, res: Response) => {
        try {
            const requestData = req.body as OvertimeRequestData;
            const request = await this.overtimeService.createRequest(requestData);
            res.status(201).json(request);
        } catch (error: any) {
            res.status(400).json({
                code: 'CREATE_REQUEST_ERROR',
                message: error.message || 'Failed to create overtime request'
            });
        }
    };

    getRequestDetails = async (req: Request, res: Response) => {
        try {
            const { requestId } = req.params;
            const criteria: RequestSearchCriteria = {
                workerId: undefined,
                departmentId: undefined,
                facilityId: undefined,
                customerId: undefined,
                status: undefined,
                startDate: undefined,
                endDate: undefined,
                page: 1,
                pageSize: 1,
                equals: (other: RequestSearchCriteria) => false,
                hasFilters: () => true
            };

            const { requests } = await this.overtimeService.findRequests(criteria);
            const request = requests.find(r => r.getId() === requestId);

            if (!request) {
                res.status(404).json({
                    code: 'REQUEST_NOT_FOUND',
                    message: 'Overtime request not found'
                });
                return;
            }

            res.json(request);
        } catch (error: any) {
            res.status(400).json({
                code: 'GET_REQUEST_ERROR',
                message: error.message || 'Failed to get overtime request'
            });
        }
    };

    approveRequest = async (req: Request, res: Response) => {
        try {
            const { requestId } = req.params;
            const { comment } = req.body;
            const { userId, role } = req.user!;
            
            // 获取用户信息
            const user = await this.userRepository.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }
            const username = user.getUsername();

            await this.overtimeService.approveRequest(
                requestId,
                userId,
                username,
                role as UserRole,
                comment
            );
            res.status(200).send();
        } catch (error: any) {
            res.status(400).json({
                code: 'APPROVE_REQUEST_ERROR',
                message: error.message || 'Failed to approve overtime request'
            });
        }
    };

    rejectRequest = async (req: Request, res: Response) => {
        try {
            const { requestId } = req.params;
            const { comment } = req.body;
            const { userId, role } = req.user!;
            
            // 获取用户信息
            const user = await this.userRepository.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }
            const username = user.getUsername();

            await this.overtimeService.rejectRequest(
                requestId,
                userId,
                username,
                role as UserRole,
                comment
            );
            res.status(200).send();
        } catch (error: any) {
            res.status(400).json({
                code: 'REJECT_REQUEST_ERROR',
                message: error.message || 'Failed to reject overtime request'
            });
        }
    };

    editRequest = async (req: Request, res: Response) => {
        try {
            const { requestId } = req.params;
            const editData = req.body as OvertimeRequestEditData;
            const { userId, role } = req.user!;

            await this.overtimeService.editRequest(
                requestId,
                editData,
                userId,
                role as UserRole
            );
            res.status(200).send();
        } catch (error: any) {
            res.status(400).json({
                code: 'EDIT_REQUEST_ERROR',
                message: error.message || 'Failed to edit overtime request'
            });
        }
    };

    cancelRequest = async (req: Request, res: Response) => {
        try {
            const { requestId } = req.params;
            const { userId, role } = req.user!;

            await this.overtimeService.cancelRequest(
                requestId,
                userId,
                role as UserRole
            );
            res.status(200).send();
        } catch (error: any) {
            res.status(400).json({
                code: 'CANCEL_REQUEST_ERROR',
                message: error.message || 'Failed to cancel overtime request'
            });
        }
    };

    findRequests = async (req: Request, res: Response) => {
        try {
            const criteria = {
                workerId: req.query.workerId as string,
                departmentId: req.query.departmentId as string,
                facilityId: req.query.facilityId as string,
                customerId: req.query.customerId as string,
                status: req.query.status as OvertimeRequestStatus,
                startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
                endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
                page: parseInt(req.query.page as string) || 1,
                pageSize: parseInt(req.query.pageSize as string) || 20,
                equals: () => false,
                hasFilters: () => true
            } as RequestSearchCriteria;

            const { requests, total } = await this.overtimeService.findRequests(criteria);
            res.json({ requests, total });
        } catch (error: any) {
            res.status(400).json({
                code: 'FIND_REQUESTS_ERROR',
                message: error.message || 'Failed to find overtime requests'
            });
        }
    };
} 
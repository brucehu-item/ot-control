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
            console.log(`[Overtime] Creating request - User ID: ${req.user?.userId}`);
            const requestData = req.body as OvertimeRequestData;
            const request = await this.overtimeService.createRequest(requestData);
            console.log(`[Overtime] Request created successfully - Request ID: ${request.getId()}`);
            res.status(201).json(request);
        } catch (error: any) {
            console.error(`[Overtime] Failed to create request - ${error.message}`);
            res.status(400).json({
                code: 'CREATE_REQUEST_ERROR',
                message: error.message || 'Failed to create overtime request'
            });
        }
    };

    getRequestDetails = async (req: Request, res: Response) => {
        try {
            const { requestId } = req.params;
            console.log(`[Overtime] Getting request details - Request ID: ${requestId}`);
            
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
                console.log(`[Overtime] Request not found - Request ID: ${requestId}`);
                res.status(404).json({
                    code: 'REQUEST_NOT_FOUND',
                    message: 'Overtime request not found'
                });
                return;
            }

            console.log(`[Overtime] Request details retrieved successfully - Request ID: ${requestId}`);
            res.json(request);
        } catch (error: any) {
            console.error(`[Overtime] Failed to get request details - ${error.message}`);
            res.status(400).json({
                code: 'GET_REQUEST_ERROR',
                message: error.message || 'Failed to get overtime request'
            });
        }
    };

    approveRequest = async (req: Request, res: Response) => {
        try {
            const { requestId } = req.params;
            const { userId, role } = req.user!;
            
            console.log(`[Overtime] Approving request - Request ID: ${requestId}, Approver: ${userId}, Role: ${role}`);
            
            const user = await this.userRepository.findById(userId);
            if (!user) {
                console.error(`[Overtime] User not found - User ID: ${userId}`);
                throw new Error('User not found');
            }
            const username = user.getUsername();

            await this.overtimeService.approveRequest(
                requestId,
                userId,
                username,
                role as UserRole,
                req.body.comment
            );
            
            console.log(`[Overtime] Request approved successfully - Request ID: ${requestId}`);
            res.status(200).send();
        } catch (error: any) {
            console.error(`[Overtime] Failed to approve request - ${error.message}`);
            res.status(400).json({
                code: 'APPROVE_REQUEST_ERROR',
                message: error.message || 'Failed to approve overtime request'
            });
        }
    };

    rejectRequest = async (req: Request, res: Response) => {
        try {
            const { requestId } = req.params;
            const { userId, role } = req.user!;
            
            console.log(`[Overtime] Rejecting request - Request ID: ${requestId}, Rejector: ${userId}, Role: ${role}`);
            
            const user = await this.userRepository.findById(userId);
            if (!user) {
                console.error(`[Overtime] User not found - User ID: ${userId}`);
                throw new Error('User not found');
            }
            const username = user.getUsername();

            await this.overtimeService.rejectRequest(
                requestId,
                userId,
                username,
                role as UserRole,
                req.body.comment
            );
            
            console.log(`[Overtime] Request rejected successfully - Request ID: ${requestId}`);
            res.status(200).send();
        } catch (error: any) {
            console.error(`[Overtime] Failed to reject request - ${error.message}`);
            res.status(400).json({
                code: 'REJECT_REQUEST_ERROR',
                message: error.message || 'Failed to reject overtime request'
            });
        }
    };

    editRequest = async (req: Request, res: Response) => {
        try {
            const { requestId } = req.params;
            const { userId, role } = req.user!;

            console.log(`[Overtime] Editing request - Request ID: ${requestId}, Editor: ${userId}`);

            await this.overtimeService.editRequest(
                requestId,
                req.body as OvertimeRequestEditData,
                userId,
                role as UserRole
            );
            
            console.log(`[Overtime] Request edited successfully - Request ID: ${requestId}`);
            res.status(200).send();
        } catch (error: any) {
            console.error(`[Overtime] Failed to edit request - ${error.message}`);
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

            console.log(`[Overtime] Cancelling request - Request ID: ${requestId}, Canceller: ${userId}`);

            await this.overtimeService.cancelRequest(
                requestId,
                userId,
                role as UserRole
            );
            
            console.log(`[Overtime] Request cancelled successfully - Request ID: ${requestId}`);
            res.status(200).send();
        } catch (error: any) {
            console.error(`[Overtime] Failed to cancel request - ${error.message}`);
            res.status(400).json({
                code: 'CANCEL_REQUEST_ERROR',
                message: error.message || 'Failed to cancel overtime request'
            });
        }
    };

    findRequests = async (req: Request, res: Response) => {
        try {
            console.log(`[Overtime] Finding requests - User ID: ${req.user?.userId}, Query:`, req.query);
            
            let startDate: Date | undefined;
            let endDate: Date | undefined;
            
            if (Array.isArray(req.query.startDate)) {
                startDate = new Date(req.query.startDate[0] as string);
            } else if (req.query.startDate) {
                startDate = new Date(req.query.startDate as string);
            }

            if (Array.isArray(req.query.endDate)) {
                endDate = new Date(req.query.endDate[0] as string);
            } else if (req.query.endDate) {
                endDate = new Date(req.query.endDate as string);
            }

            const criteria = {
                workerId: req.query.workerId as string,
                departmentId: req.query.departmentId as string,
                facilityId: req.query.facilityId as string,
                customerId: req.query.customerId as string,
                status: req.query.status as OvertimeRequestStatus,
                startDate,
                endDate,
                page: parseInt(req.query.page as string) || 1,
                pageSize: parseInt(req.query.pageSize as string) || 20,
                equals: () => false,
                hasFilters: () => true
            } as RequestSearchCriteria;

            const { requests, total } = await this.overtimeService.findRequests(criteria);
            
            console.log(`[Overtime] Requests found successfully - Total: ${total}, Page: ${criteria.page}, PageSize: ${criteria.pageSize}`);
            res.json({ requests, total });
        } catch (error: any) {
            console.error(`[Overtime] Failed to find requests - ${error.message}`);
            res.status(400).json({
                code: 'FIND_REQUESTS_ERROR',
                message: error.message || 'Failed to find overtime requests'
            });
        }
    };
} 
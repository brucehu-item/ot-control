import { Inject, Service } from 'typedi';
import { OvertimeRequest } from '../aggregates/overtime-request';
import { OvertimeRequestData } from '../value-objects/overtime-request-data';
import { OvertimeRequestEditData } from '../value-objects/overtime-request-edit-data';
import { RequestSearchCriteria } from '../value-objects/request-search-criteria';
import { UserRole } from '../value-objects/user-role';
import { OvertimeRequestService } from './overtime-request.service';
import { OvertimeRequestRepository } from '../repositories/overtime-request.repository';
import { UserRepository } from '../../../organization/domain/repositories/user.repository';
import { ORGANIZATION_TOKENS } from '../../../shared/di/tokens';
import { OVERTIME_TOKENS } from '../../di/tokens';
import { v4 as uuidv4 } from 'uuid';

@Service(OVERTIME_TOKENS.OvertimeRequestService)
export class OvertimeRequestServiceImpl implements OvertimeRequestService {
  constructor(
    @Inject(OVERTIME_TOKENS.OvertimeRequestRepository)
    private readonly overtimeRequestRepository: OvertimeRequestRepository,
    @Inject(ORGANIZATION_TOKENS.UserRepository)
    private readonly userRepository: UserRepository
  ) {}

  async createRequest(data: OvertimeRequestData): Promise<OvertimeRequest> {
    // 验证时间
    this.validateRequestTimes(data.startTime, data.endTime);

    // 获取主管信息，判断是否需要经理审批
    const supervisor = await this.userRepository.findById(data.supervisorId);
    if (!supervisor) {
      throw new Error('Supervisor not found');
    }
    const requiresManagerApproval = !supervisor.canApproveRequests();

    // 如果有客户ID，获取客户信息，判断是否需要客户审批
    let requiresCustomerApproval = false;
    if (data.customerId) {
      const customer = await this.userRepository.findById(data.customerId);
      if (!customer) {
        throw new Error('Customer not found');
      }
      requiresCustomerApproval = customer.requiresRequestApproval();
    }

    // 创���新的加班申请，包含审批标记
    const requestData = new OvertimeRequestData(
      data.startTime,
      data.endTime,
      data.reason,
      data.workerId,
      data.workerName,
      data.departmentId,
      data.departmentName,
      data.supervisorId,
      data.supervisorName,
      requiresManagerApproval,
      requiresCustomerApproval,
      data.managerId,
      data.managerName,
      data.customerId,
      data.customerName
    );

    const request = new OvertimeRequest(uuidv4(), requestData);

    // 保存到仓储
    await this.overtimeRequestRepository.save(request);

    return request;
  }

  async approveRequest(
    requestId: string,
    approverId: string,
    role: UserRole,
    comment?: string
  ): Promise<void> {
    const request = await this.overtimeRequestRepository.findById(requestId);
    if (!request) {
      throw new Error('Overtime request not found');
    }

    // 验证审批人权限
    const approver = await this.userRepository.findById(approverId);
    if (!approver) {
      throw new Error('Approver not found');
    }

    if (!approver.canApproveRequests()) {
      throw new Error('User is not authorized to approve requests');
    }

    request.approve(approverId, role, comment);
    await this.overtimeRequestRepository.save(request);
  }

  async rejectRequest(
    requestId: string,
    approverId: string,
    role: UserRole,
    comment?: string
  ): Promise<void> {
    const request = await this.overtimeRequestRepository.findById(requestId);
    if (!request) {
      throw new Error('Overtime request not found');
    }

    // 验证审批人权限
    const approver = await this.userRepository.findById(approverId);
    if (!approver) {
      throw new Error('Approver not found');
    }

    if (!approver.canApproveRequests()) {
      throw new Error('User is not authorized to reject requests');
    }

    request.reject(approverId, role, comment);
    await this.overtimeRequestRepository.save(request);
  }

  async editRequest(
    requestId: string,
    data: OvertimeRequestEditData,
    editorId: string,
    role: UserRole
  ): Promise<void> {
    const request = await this.overtimeRequestRepository.findById(requestId);
    if (!request) {
      throw new Error('Overtime request not found');
    }

    if (data.startTime && data.endTime) {
      this.validateRequestTimes(data.startTime, data.endTime);
    }

    request.edit(data, editorId, role);
    await this.overtimeRequestRepository.save(request);
  }

  async cancelRequest(
    requestId: string,
    userId: string,
    role: UserRole
  ): Promise<void> {
    const request = await this.overtimeRequestRepository.findById(requestId);
    if (!request) {
      throw new Error('Overtime request not found');
    }

    request.cancel(userId, role);
    await this.overtimeRequestRepository.save(request);
  }

  async findRequests(criteria: RequestSearchCriteria): Promise<{
    requests: OvertimeRequest[];
    total: number;
  }> {
    if (criteria.workerId) {
      return this.overtimeRequestRepository.findByWorkerId(criteria.workerId, criteria);
    }
    if (criteria.departmentId) {
      return this.overtimeRequestRepository.findByDepartmentId(criteria.departmentId, criteria);
    }
    if (criteria.facilityId) {
      return this.overtimeRequestRepository.findByFacilityId(criteria.facilityId, criteria);
    }
    if (criteria.customerId) {
      return this.overtimeRequestRepository.findByCustomerId(criteria.customerId, criteria);
    }
    if (criteria.status) {
      return this.overtimeRequestRepository.findByStatus(criteria.status, criteria);
    }

    throw new Error('At least one search criteria must be provided');
  }

  validateRequestTimes(startTime: Date, endTime: Date): boolean {
    if (startTime >= endTime) {
      throw new Error('Start time must be before end time');
    }

    const now = new Date();
    if (startTime < now) {
      throw new Error('Start time cannot be in the past');
    }

    return true;
  }

  validateApprovalFlow(request: OvertimeRequest): boolean {
    // 验证审批流程是否合法
    const status = request.getStatus();
    const approvalRecords = request.getApprovalRecords();

    // 确保审批记录的顺序正确
    for (let i = 1; i < approvalRecords.length; i++) {
      const prevRecord = approvalRecords[i - 1];
      const currRecord = approvalRecords[i];
      
      // 如果前一个是拒绝，后面不应该有更多审批
      if (prevRecord.action === 'REJECT' && currRecord.action !== 'REJECT') {
        return false;
      }
    }

    return true;
  }
} 
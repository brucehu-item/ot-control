import { Inject, Service } from 'typedi';
import { OvertimeRequest } from '../aggregates/overtime-request';
import { OvertimeRequestData } from '../value-objects/overtime-request-data';
import { OvertimeRequestEditData } from '../value-objects/overtime-request-edit-data';
import { RequestSearchCriteria } from '../value-objects/request-search-criteria';
import { UserRole } from '../value-objects/user-role';
import { OvertimeRequestService } from './overtime-request.service';
import { OvertimeRequestRepository } from '../repositories/overtime-request.repository';
import { UserRepository } from '../../../organization/domain/repositories/user.repository';
import { ORGANIZATION_TOKENS } from '../../../organization/di/tokens';
import { OVERTIME_TOKENS } from '../../di/tokens';
import { v4 as uuidv4 } from 'uuid';
import { OrganizationService } from '../../../organization/domain/services/organization.service';
import { ORGANIZATION_TOKENS as SHARED_ORGANIZATION_TOKENS } from '../../../shared/di/tokens';

@Service(OVERTIME_TOKENS.OvertimeRequestService)
export class OvertimeRequestServiceImpl implements OvertimeRequestService {
  constructor(
    @Inject(OVERTIME_TOKENS.OvertimeRequestRepository)
    private readonly overtimeRequestRepository: OvertimeRequestRepository,
    @Inject(ORGANIZATION_TOKENS.USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(SHARED_ORGANIZATION_TOKENS.OrganizationService)
    private readonly organizationService: OrganizationService
  ) {}

  async createRequest(data: OvertimeRequestData): Promise<OvertimeRequest> {
    // 验证时间
    this.validateRequestTimes(data.startTime, data.endTime);

    // 获取部门的主管信息
    const departmentHierarchy = await this.organizationService.getDepartmentHierarchy(data.departmentId);
    const supervisorId = departmentHierarchy.getSupervisorId();
    const supervisorName = departmentHierarchy.getSupervisorName();

    if (!supervisorId || !supervisorName) {
      throw new Error('Department supervisor not found');
    }

    // 获取主管信息，判断是否需要经理审批
    const supervisor = await this.userRepository.findById(supervisorId);
    if (!supervisor) {
      throw new Error('Supervisor not found');
    }
    const requiresManagerApproval = !supervisor.canApproveRequests();

    // 如果需要经理审批，获取经理信息
    let managerId = undefined;
    let managerName = undefined;
    if (requiresManagerApproval) {
      managerId = departmentHierarchy.getManagerId();
      managerName = departmentHierarchy.getManagerName();
      if (!managerId || !managerName) {
        throw new Error('Facility manager not found');
      }
    }

    // 如果有客户ID，获取客户信息，判断是否需要客户审批
    let requiresCustomerApproval = false;
    if (data.customerId) {
      const customer = await this.userRepository.findById(data.customerId);
      if (!customer) {
        throw new Error('Customer not found');
      }
      requiresCustomerApproval = customer.requiresRequestApproval();
    }

    // 创建新的加班申请，包含审批标记
    const requestData = new OvertimeRequestData(
      data.startTime,
      data.endTime,
      data.reason,
      data.workerId,
      data.workerName,
      data.departmentId,
      data.departmentName,
      data.facilityId,
      data.facilityName,
      supervisorId,
      supervisorName,
      requiresManagerApproval,
      requiresCustomerApproval,
      managerId,
      managerName,
      data.customerId,
      data.customerName
    );

    // 创建请求对象（使用临时ID，Repository会在保存时替换为正确的序列号ID）
    const request = new OvertimeRequest('', requestData);

    // 保存到仓储
    await this.overtimeRequestRepository.save(request);

    return request;
  }

  async approveRequest(
    requestId: string,
    approverId: string,
    approverName: string,
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

    // 如果是经理审批，且请求没有经理信息，先设置经理信息
    if (role === UserRole.MANAGER && !request.getManagerId()) {
      const departmentHierarchy = await this.organizationService.getDepartmentHierarchy(request.getDepartmentId());
      const facilityManagerId = departmentHierarchy.getManagerId();
      const facilityManagerName = departmentHierarchy.getManagerName();
      
      if (!facilityManagerId || !facilityManagerName) {
        throw new Error('Facility manager not found');
      }

      if (approverId !== facilityManagerId) {
        throw new Error('Only the facility manager can approve this request');
      }

      request.setManager(facilityManagerId, facilityManagerName);
    }

    request.approve(approverId, approverName, role, comment);
    await this.overtimeRequestRepository.save(request);
  }

  async rejectRequest(
    requestId: string,
    approverId: string,
    approverName: string,
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

    // 如果是经理审批，且请求没有经理信息，先设置经理信息
    if (role === UserRole.MANAGER && !request.getManagerId()) {
      const departmentHierarchy = await this.organizationService.getDepartmentHierarchy(request.getDepartmentId());
      const facilityManagerId = departmentHierarchy.getManagerId();
      const facilityManagerName = departmentHierarchy.getManagerName();
      
      if (!facilityManagerId || !facilityManagerName) {
        throw new Error('Facility manager not found');
      }

      if (approverId !== facilityManagerId) {
        throw new Error('Only the facility manager can reject this request');
      }

      request.setManager(facilityManagerId, facilityManagerName);
    }

    request.reject(approverId, approverName, role, comment);
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

    // 如果是经理取消，且请求没有经理信息，先设置经理信息
    if (role === UserRole.MANAGER && !request.getManagerId()) {
      const departmentHierarchy = await this.organizationService.getDepartmentHierarchy(request.getDepartmentId());
      const facilityManagerId = departmentHierarchy.getManagerId();
      const facilityManagerName = departmentHierarchy.getManagerName();
      
      if (!facilityManagerId || !facilityManagerName) {
        throw new Error('Facility manager not found');
      }

      if (userId !== facilityManagerId) {
        throw new Error('Only the facility manager can cancel this request');
      }

      request.setManager(facilityManagerId, facilityManagerName);
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
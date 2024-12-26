import { OvertimeRequest } from '../../domain/aggregates/overtime-request';
import { OvertimeRequestStatus } from '../../domain/value-objects/overtime-request-status';
import { RequestSearchCriteria } from '../../domain/value-objects/request-search-criteria';
import { OvertimeRequestRepository } from '../../domain/repositories/overtime-request.repository';
import { Service } from 'typedi';
import fs from 'fs';
import path from 'path';
import { ApprovalRecord, ApprovalAction } from '../../domain/value-objects/approval-record';
import { OvertimeRequestData } from '../../domain/value-objects/overtime-request-data';
import { UserRole } from '../../domain/value-objects/user-role';

interface ApprovalRecordData {
  approverId: string;
  approverName: string;
  role: string;
  action: string;
  comment?: string;
  timestamp: string;
}

interface UserData {
  userId: string;
  username: string;
  firstName: string;
  lastName: string;
  password: string;
  role: string;
  departmentId: string | null;
  facilityId: string | null;
  hasApprovalAuthority: boolean;
  requiresApproval: boolean;
}

@Service()
export class MemoryOvertimeRequestRepository implements OvertimeRequestRepository {
  private requests: Map<string, OvertimeRequest> = new Map();
  private userConfigs: Map<string, UserData> = new Map();
  private currentSequence: number = 0;

  constructor() {
    // 初始化用户配置
    this.initializeUserConfigs();
    // 初始化mock数据
    this.initializeMockData();
  }

  private initializeUserConfigs(): void {
    try {
      const usersPath = path.join(process.cwd(), '..', 'mock_data', 'users.json');
      const usersData = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
      
      for (const user of usersData.users) {
        this.userConfigs.set(user.userId, user);
      }
    } catch (error) {
      console.error('Failed to load user configurations:', error);
    }
  }

  private initializeMockData(): void {
    try {
      // 读取mock数据文件
      const mockDataPath = path.join(process.cwd(), '..', 'mock_data', 'overtime_requests.json');
      const overtimeData = JSON.parse(fs.readFileSync(mockDataPath, 'utf-8'));

      // 初始化加班申请数据
      for (const requestData of overtimeData.overtimeRequests) {
        // 根据用户配置判断是否需要审批
        const customerConfig = requestData.customerId ? this.userConfigs.get(requestData.customerId) : undefined;
        const supervisorConfig = requestData.supervisorId ? this.userConfigs.get(requestData.supervisorId) : undefined;

        // 根据主管的审批权限决定是否需要经理审批
        const requiresManagerApproval = !supervisorConfig?.hasApprovalAuthority;
        const requiresCustomerApproval = customerConfig?.requiresApproval ?? false;

        const data = new OvertimeRequestData(
          new Date(requestData.startTime),
          new Date(requestData.endTime),
          requestData.reason,
          requestData.workerId,
          requestData.workerName,
          requestData.departmentId,
          requestData.departmentName,
          requestData.facilityId,
          requestData.facilityName,
          requestData.supervisorId || '',
          requestData.supervisorName || '',
          requiresManagerApproval,
          requiresCustomerApproval,
          requestData.managerId,
          requestData.managerName,
          requestData.customerId,
          requestData.customerName
        );

        const request = new OvertimeRequest(requestData.id, data);
        
        // 设置状态和审批记录
        if (requestData.approvalRecords) {
          for (const record of requestData.approvalRecords) {
            const approvalRecord = new ApprovalRecord(
              record.approverId,
              record.approverName,
              record.role as UserRole,
              record.action as ApprovalAction,
              record.comment,
              new Date(record.timestamp)
            );
            request.addApprovalRecord(approvalRecord);
          }
        }

        // 设置状态
        if (requestData.status) {
          (request as any).status = requestData.status;
        }

        this.requests.set(request.getId(), request);
      }

      console.log('Mock overtime requests loaded successfully');
    } catch (error) {
      console.error('Failed to load mock overtime requests:', error);
    }
  }

  private async getNextSequenceNumber(): Promise<number> {
    // 获取所有请求ID
    const ids = Array.from(this.requests.keys());
    
    // 找出当前最大的序列号
    const maxSequence = ids.reduce((max, id) => {
      if (id.startsWith('OT')) {
        const sequence = parseInt(id.substring(2));
        return isNaN(sequence) ? max : Math.max(max, sequence);
      }
      return max;
    }, 0);

    // 返回下一个序列号
    this.currentSequence = maxSequence + 1;
    return this.currentSequence;
  }

  async save(request: OvertimeRequest): Promise<void> {
    let id = request.getId();
    
    // 如果是新请求（没有ID），生成新的序列号ID
    if (!id) {
      const sequence = await this.getNextSequenceNumber();
      id = `OT${sequence.toString().padStart(3, '0')}`;
      (request as any).id = id;
    }
    
    this.requests.set(id, request);
  }

  async findById(requestId: string): Promise<OvertimeRequest | null> {
    return this.requests.get(requestId) || null;
  }

  private async findAndPaginate(
    predicate: (request: OvertimeRequest) => boolean,
    criteria: RequestSearchCriteria
  ): Promise<{
    requests: OvertimeRequest[];
    total: number;
  }> {
    const allRequests = Array.from(this.requests.values());
    const filteredRequests = allRequests.filter(predicate);

    // 应用日期过滤
    const dateFilteredRequests = filteredRequests.filter(request => {
      if (criteria.startDate && request.getStartTime() < criteria.startDate) {
        return false;
      }
      if (criteria.endDate && request.getEndTime() > criteria.endDate) {
        return false;
      }
      return true;
    });

    // 应用状态过滤
    const statusFilteredRequests = criteria.status
      ? dateFilteredRequests.filter(request => request.getStatus() === criteria.status)
      : dateFilteredRequests;

    // 计算分页
    const start = (criteria.page - 1) * criteria.pageSize;
    const end = start + criteria.pageSize;
    const paginatedRequests = statusFilteredRequests.slice(start, end);

    return {
      requests: paginatedRequests,
      total: statusFilteredRequests.length
    };
  }

  async findByWorkerId(
    workerId: string,
    criteria: RequestSearchCriteria
  ): Promise<{
    requests: OvertimeRequest[];
    total: number;
  }> {
    return this.findAndPaginate(
      request => request.getWorkerId() === workerId,
      criteria
    );
  }

  async findByDepartmentId(
    departmentId: string,
    criteria: RequestSearchCriteria
  ): Promise<{
    requests: OvertimeRequest[];
    total: number;
  }> {
    return this.findAndPaginate(
      request => request.getDepartmentId() === departmentId,
      criteria
    );
  }

  async findByFacilityId(
    facilityId: string,
    criteria: RequestSearchCriteria
  ): Promise<{
    requests: OvertimeRequest[];
    total: number;
  }> {
    return this.findAndPaginate(
      request => {
        const departmentId = request.getDepartmentId();
        // 注意：这里简化了实现，实际应该通过组织架构服务来判断部门是否属于该场所
        return departmentId.startsWith(facilityId);
      },
      criteria
    );
  }

  async findByCustomerId(
    customerId: string,
    criteria: RequestSearchCriteria
  ): Promise<{
    requests: OvertimeRequest[];
    total: number;
  }> {
    return this.findAndPaginate(
      request => request.getCustomerId() === customerId,
      criteria
    );
  }

  async findByStatus(
    status: OvertimeRequestStatus,
    criteria: RequestSearchCriteria
  ): Promise<{
    requests: OvertimeRequest[];
    total: number;
  }> {
    return this.findAndPaginate(
      request => request.getStatus() === status,
      criteria
    );
  }
} 
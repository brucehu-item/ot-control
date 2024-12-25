import { OvertimeRequest } from '../aggregates/overtime-request';
import { OvertimeRequestData } from '../value-objects/overtime-request-data';
import { OvertimeRequestEditData } from '../value-objects/overtime-request-edit-data';
import { RequestSearchCriteria } from '../value-objects/request-search-criteria';
import { UserRole } from '../value-objects/user-role';

export interface OvertimeRequestService {
  // 创建加班申请
  createRequest(data: OvertimeRequestData): Promise<OvertimeRequest>;
  
  // 审批相关
  approveRequest(requestId: string, approverId: string, approverName: string, role: UserRole, comment?: string): Promise<void>;
  rejectRequest(requestId: string, approverId: string, approverName: string, role: UserRole, comment?: string): Promise<void>;
  
  // 编辑和取消
  editRequest(requestId: string, data: OvertimeRequestEditData, editorId: string, role: UserRole): Promise<void>;
  cancelRequest(requestId: string, userId: string, role: UserRole): Promise<void>;
  
  // 查询
  findRequests(criteria: RequestSearchCriteria): Promise<{
    requests: OvertimeRequest[],
    total: number
  }>;
  
  // 业务规则验证
  validateRequestTimes(startTime: Date, endTime: Date): boolean;
  validateApprovalFlow(request: OvertimeRequest): boolean;
} 
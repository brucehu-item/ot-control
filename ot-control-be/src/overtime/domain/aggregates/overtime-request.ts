import { ApprovalRecord, ApprovalAction } from '../value-objects/approval-record';
import { OvertimeRequestStatus } from '../value-objects/overtime-request-status';
import { OvertimeRequestData } from '../value-objects/overtime-request-data';
import { OvertimeRequestEditData } from '../value-objects/overtime-request-edit-data';
import { UserRole } from '../value-objects/user-role';

export class OvertimeRequest {
  private id: string;
  private startTime: Date;
  private endTime: Date;
  private reason: string;
  private status: OvertimeRequestStatus;
  private workerId: string;
  private workerName: string;
  private departmentId: string;
  private departmentName: string;
  private facilityId: string;
  private facilityName: string;
  private supervisorId: string;
  private supervisorName: string;
  private requiresManagerApproval: boolean;
  private requiresCustomerApproval: boolean;
  private managerId?: string;
  private managerName?: string;
  private customerId?: string;
  private customerName?: string;
  private createdAt: Date;
  private updatedAt: Date;
  private approvalRecords: ApprovalRecord[];

  constructor(id: string, data: OvertimeRequestData) {
    this.id = id;
    this.startTime = data.startTime;
    this.endTime = data.endTime;
    this.reason = data.reason;
    this.status = OvertimeRequestStatus.PENDING_SUPERVISOR;
    this.workerId = data.workerId;
    this.workerName = data.workerName;
    this.departmentId = data.departmentId;
    this.departmentName = data.departmentName;
    this.facilityId = data.facilityId;
    this.facilityName = data.facilityName;
    this.supervisorId = data.supervisorId;
    this.supervisorName = data.supervisorName;
    this.requiresManagerApproval = data.requiresManagerApproval;
    this.requiresCustomerApproval = data.requiresCustomerApproval;
    this.managerId = data.managerId;
    this.managerName = data.managerName;
    this.customerId = data.customerId;
    this.customerName = data.customerName;
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.approvalRecords = [];
  }

  // 获取器方法
  getId(): string { return this.id; }
  getStartTime(): Date { return this.startTime; }
  getEndTime(): Date { return this.endTime; }
  getReason(): string { return this.reason; }
  getStatus(): OvertimeRequestStatus { return this.status; }
  getWorkerId(): string { return this.workerId; }
  getWorkerName(): string { return this.workerName; }
  getDepartmentId(): string { return this.departmentId; }
  getDepartmentName(): string { return this.departmentName; }
  getFacilityId(): string { return this.facilityId; }
  getFacilityName(): string { return this.facilityName; }
  getSupervisorId(): string { return this.supervisorId; }
  getSupervisorName(): string { return this.supervisorName; }
  getManagerId(): string | undefined { return this.managerId; }
  getManagerName(): string | undefined { return this.managerName; }
  getCustomerId(): string | undefined { return this.customerId; }
  getCustomerName(): string | undefined { return this.customerName; }
  getCreatedAt(): Date { return this.createdAt; }
  getUpdatedAt(): Date { return this.updatedAt; }
  getApprovalRecords(): ApprovalRecord[] { return [...this.approvalRecords]; }

  // 设置经理信息
  setManager(managerId: string, managerName: string): void {
    this.managerId = managerId;
    this.managerName = managerName;
    this.updatedAt = new Date();
  }

  // 添加审批记录
  addApprovalRecord(approvalRecord: ApprovalRecord): void {
    this.approvalRecords.push(approvalRecord);
  }

  // 审批方法
  approve(approverId: string, approverName: string, role: UserRole, comment?: string): void {
    this.validateApprover(approverId, role);
    this.validateStatus(this.getNextStatusAfterApproval(role));

    const approvalRecord = new ApprovalRecord(approverId, approverName, role, 'APPROVE', comment);
    this.addApprovalRecord(approvalRecord);
    this.status = this.getNextStatusAfterApproval(role);
    this.updatedAt = new Date();
  }

  reject(approverId: string, approverName: string, role: UserRole, comment?: string): void {
    this.validateApprover(approverId, role);
    this.validateStatus(OvertimeRequestStatus.REJECTED);

    const approvalRecord = new ApprovalRecord(approverId, approverName, role, 'REJECT', comment);
    this.addApprovalRecord(approvalRecord);
    this.status = OvertimeRequestStatus.REJECTED;
    this.updatedAt = new Date();
  }

  // 取消方法
  cancel(userId: string, role: UserRole): void {
    if (!this.canBeCancelledBy(userId, role)) {
      throw new Error('User is not authorized to cancel this request');
    }
    if (this.status === OvertimeRequestStatus.CANCELLED) {
      throw new Error('Request is already cancelled');
    }
    if (this.status === OvertimeRequestStatus.APPROVED || this.status === OvertimeRequestStatus.REJECTED) {
      throw new Error('Cannot cancel a request that is already approved or rejected');
    }

    this.status = OvertimeRequestStatus.CANCELLED;
    this.updatedAt = new Date();
  }

  // 编辑方法
  edit(data: OvertimeRequestEditData, editorId: string, role: UserRole): void {
    if (!this.canBeEditedBy(editorId, role)) {
      throw new Error('User is not authorized to edit this request');
    }

    if (data.startTime) {
      this.startTime = data.startTime;
    }
    if (data.endTime) {
      this.endTime = data.endTime;
    }
    if (data.reason) {
      this.reason = data.reason;
    }
    if (data.customerId) {
      this.customerId = data.customerId;
    }

    this.validateTimes();
    this.updatedAt = new Date();
  }

  // 状态检查方法
  canBeEditedBy(userId: string, role: UserRole): boolean {
    if (role === UserRole.WORKER) {
      return userId === this.workerId && this.status === OvertimeRequestStatus.PENDING_SUPERVISOR;
    }
    if (role === UserRole.SUPERVISOR) {
      return userId === this.supervisorId && 
        [OvertimeRequestStatus.PENDING_SUPERVISOR, OvertimeRequestStatus.SUPERVISOR_APPROVED].includes(this.status);
    }
    return false;
  }

  canBeCancelledBy(userId: string, role: UserRole): boolean {
    if (role === UserRole.WORKER) {
      return userId === this.workerId;
    }
    if (role === UserRole.SUPERVISOR) {
      return userId === this.supervisorId;
    }
    if (role === UserRole.MANAGER && this.managerId) {
      return userId === this.managerId;
    }
    return false;
  }

  needsManagerApproval(): boolean {
    return this.requiresManagerApproval;
  }

  needsCustomerApproval(): boolean {
    return this.requiresCustomerApproval;
  }

  toJSON() {
    return {
      id: this.id,
      startTime: this.startTime,
      endTime: this.endTime,
      reason: this.reason,
      status: this.status,
      workerId: this.workerId,
      workerName: this.workerName,
      departmentId: this.departmentId,
      departmentName: this.departmentName,
      facilityId: this.facilityId,
      facilityName: this.facilityName,
      supervisorId: this.supervisorId,
      supervisorName: this.supervisorName,
      requiresManagerApproval: this.requiresManagerApproval,
      requiresCustomerApproval: this.requiresCustomerApproval,
      managerId: this.managerId,
      managerName: this.managerName,
      customerId: this.customerId,
      customerName: this.customerName,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      approvalRecords: this.getApprovalRecords()
    };
  }

  // 业务规则验证
  private validateTimes(): boolean {
    if (this.startTime >= this.endTime) {
      throw new Error('Start time must be before end time');
    }
    return true;
  }

  private validateStatus(newStatus: OvertimeRequestStatus): void {
    const validTransitions = this.getValidStatusTransitions();
    if (!validTransitions.includes(newStatus)) {
      throw new Error(`Invalid status transition from ${this.status} to ${newStatus}`);
    }
  }

  private validateApprover(approverId: string, role: UserRole): void {
    switch (role) {
      case UserRole.SUPERVISOR:
        if (approverId !== this.supervisorId) {
          throw new Error('Only assigned supervisor can approve this request');
        }
        break;
      case UserRole.MANAGER:
        if (approverId !== this.managerId) {
          throw new Error('Only assigned manager can approve this request');
        }
        break;
      case UserRole.CUSTOMER:
        if (approverId !== this.customerId) {
          throw new Error('Only assigned customer can approve this request');
        }
        break;
      default:
        throw new Error('Invalid approver role');
    }
  }

  private getValidStatusTransitions(): OvertimeRequestStatus[] {
    switch (this.status) {
      case OvertimeRequestStatus.PENDING_SUPERVISOR:
        return [OvertimeRequestStatus.SUPERVISOR_APPROVED, OvertimeRequestStatus.REJECTED];
      case OvertimeRequestStatus.SUPERVISOR_APPROVED:
        if (this.needsManagerApproval() && this.needsCustomerApproval()) {
          return [OvertimeRequestStatus.PENDING_MANAGER, OvertimeRequestStatus.PENDING_CUSTOMER];
        } else if (this.needsManagerApproval()) {
          return [OvertimeRequestStatus.PENDING_MANAGER];
        } else if (this.needsCustomerApproval()) {
          return [OvertimeRequestStatus.PENDING_CUSTOMER];
        } else {
          return [OvertimeRequestStatus.APPROVED];
        }
      case OvertimeRequestStatus.PENDING_MANAGER:
        return [OvertimeRequestStatus.APPROVED, OvertimeRequestStatus.REJECTED];
      case OvertimeRequestStatus.PENDING_CUSTOMER:
        return [OvertimeRequestStatus.APPROVED, OvertimeRequestStatus.REJECTED];
      default:
        return [];
    }
  }

  private getNextStatusAfterApproval(role: UserRole): OvertimeRequestStatus {
    switch (role) {
      case UserRole.SUPERVISOR:
        if (this.needsManagerApproval()) {
          return OvertimeRequestStatus.PENDING_MANAGER;
        } else if (this.needsCustomerApproval()) {
          return OvertimeRequestStatus.PENDING_CUSTOMER;
        } else {
          return OvertimeRequestStatus.APPROVED;
        }
      case UserRole.MANAGER:
        if (this.needsCustomerApproval() && this.status !== OvertimeRequestStatus.PENDING_MANAGER) {
          return OvertimeRequestStatus.PENDING_CUSTOMER;
        } else {
          return OvertimeRequestStatus.APPROVED;
        }
      case UserRole.CUSTOMER:
        if (this.needsManagerApproval() && this.status !== OvertimeRequestStatus.PENDING_CUSTOMER) {
          return OvertimeRequestStatus.PENDING_MANAGER;
        } else {
          return OvertimeRequestStatus.APPROVED;
        }
      default:
        throw new Error('Invalid approver role');
    }
  }
} 
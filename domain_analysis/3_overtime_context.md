# 加班管理上下文设计

## 聚合

### 加班申请聚合（OvertimeRequest）

#### 聚合根：OvertimeRequest
```typescript
class OvertimeRequest {
  // 标识符
  id: string
  
  // 基本信息
  startTime: Date
  endTime: Date
  reason: string
  status: OvertimeRequestStatus
  
  // 关联信息
  workerId: string
  departmentId: string
  supervisorId: string
  managerId?: string
  customerId?: string
  
  // 时间戳
  createdAt: Date
  updatedAt: Date
  
  // 审批记录
  approvalRecords: ApprovalRecord[]
  
  // 方法
  approve(approverId: string, role: UserRole, comment?: string): void
  reject(approverId: string, role: UserRole, comment?: string): void
  cancel(userId: string, role: UserRole): void
  edit(data: OvertimeRequestEditData, editorId: string, role: UserRole): void
  
  // 状态检查方法
  canBeEditedBy(userId: string, role: UserRole): boolean
  canBeCancelledBy(userId: string, role: UserRole): boolean
  needsManagerApproval(): boolean
  needsCustomerApproval(): boolean
  
  // 业务规则验证
  validateTimes(): boolean
  validateStatus(newStatus: OvertimeRequestStatus): boolean
  validateApprover(approverId: string, role: UserRole): boolean
}
```

## 值对象

### OvertimeRequestStatus
```typescript
enum OvertimeRequestStatus {
  PENDING_SUPERVISOR = 'PENDING_SUPERVISOR',
  SUPERVISOR_APPROVED = 'SUPERVISOR_APPROVED',
  PENDING_MANAGER = 'PENDING_MANAGER',
  PENDING_CUSTOMER = 'PENDING_CUSTOMER',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED'
}
```

### ApprovalRecord
```typescript
class ApprovalRecord {
  approverId: string
  role: UserRole
  action: 'APPROVE' | 'REJECT'
  comment?: string
  timestamp: Date
}
```

### OvertimeRequestEditData
```typescript
class OvertimeRequestEditData {
  startTime?: Date
  endTime?: Date
  reason?: string
  customerId?: string
}
```

### RequestSearchCriteria
```typescript
class RequestSearchCriteria {
  workerId?: string
  departmentId?: string
  facilityId?: string
  customerId?: string
  status?: OvertimeRequestStatus
  startDate?: Date
  endDate?: Date
  page: number
  pageSize: number
}
```

## 领域服务

### OvertimeRequestService
```typescript
interface OvertimeRequestService {
  // 创建加班申请（直接创建并提交）
  createRequest(data: OvertimeRequestData): Promise<OvertimeRequest>
  
  // 审批相关
  approveRequest(requestId: string, approverId: string, role: UserRole, comment?: string): Promise<void>
  rejectRequest(requestId: string, approverId: string, role: UserRole, comment?: string): Promise<void>
  
  // 编辑和取消
  editRequest(requestId: string, data: OvertimeRequestEditData, editorId: string, role: UserRole): Promise<void>
  cancelRequest(requestId: string, userId: string, role: UserRole): Promise<void>
  
  // 查询
  findRequests(criteria: RequestSearchCriteria): Promise<{
    requests: OvertimeRequest[],
    total: number
  }>
  
  // 业务规则验证
  validateRequestTimes(startTime: Date, endTime: Date): boolean
  validateApprovalFlow(request: OvertimeRequest): boolean
}
```

## 仓储

### OvertimeRequestRepository
```typescript
interface OvertimeRequestRepository {
  save(request: OvertimeRequest): Promise<void>
  findById(requestId: string): Promise<OvertimeRequest>
  findByWorkerId(workerId: string, criteria: RequestSearchCriteria): Promise<{
    requests: OvertimeRequest[],
    total: number
  }>
  findByDepartmentId(departmentId: string, criteria: RequestSearchCriteria): Promise<{
    requests: OvertimeRequest[],
    total: number
  }>
  findByFacilityId(facilityId: string, criteria: RequestSearchCriteria): Promise<{
    requests: OvertimeRequest[],
    total: number
  }>
  findByCustomerId(customerId: string, criteria: RequestSearchCriteria): Promise<{
    requests: OvertimeRequest[],
    total: number
  }>
  findByStatus(status: OvertimeRequestStatus, criteria: RequestSearchCriteria): Promise<{
    requests: OvertimeRequest[],
    total: number
  }>
}
```

## 领域事件

### OvertimeRequestCreatedEvent
```typescript
class OvertimeRequestCreatedEvent {
  requestId: string
  workerId: string
  supervisorId: string
  timestamp: Date
}
```

### OvertimeRequestApprovedEvent
```typescript
class OvertimeRequestApprovedEvent {
  requestId: string
  approverId: string
  role: UserRole
  timestamp: Date
}
```

### OvertimeRequestRejectedEvent
```typescript
class OvertimeRequestRejectedEvent {
  requestId: string
  approverId: string
  role: UserRole
  reason?: string
  timestamp: Date
}
```

### OvertimeRequestCancelledEvent
```typescript
class OvertimeRequestCancelledEvent {
  requestId: string
  cancelledBy: string
  role: UserRole
  timestamp: Date
}
```

### OvertimeRequestEditedEvent
```typescript
class OvertimeRequestEditedEvent {
  requestId: string
  editedBy: string
  role: UserRole
  changes: OvertimeRequestEditData
  timestamp: Date
}
``` 
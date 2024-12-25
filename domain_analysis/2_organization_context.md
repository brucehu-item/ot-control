# 组织架构上下文设计

## 聚合

### 场所聚合（Facility）

#### 聚合根：Facility
```typescript
class Facility {
  // 标识符
  facilityId: string
  
  // 属性
  name: string
  managerId: string
  customerIds: string[]
  
  // 方法
  // 获取器方法
  getFacilityId(): string              // 获取场所ID
  getName(): string                    // 获取场所名称
  getManagerId(): string              // 获取经理ID
  getCustomerIds(): string[]          // 获取客户ID列表
  
  // 客户管理方法
  addCustomer(customerId: string): void      // 添加客户
  removeCustomer(customerId: string): void   // 移除客户
  hasCustomer(customerId: string): boolean   // 检查客户是否存在
  
  // 场所管理方法
  changeManager(managerId: string): void     // 更换经理
  setName(name: string): void               // 修改场所名称
}
```

### 部门聚合（Department）

#### 聚合根：Department
```typescript
class Department {
  // 标识符
  departmentId: string
  
  // 属性
  name: string
  facilityId: string
  supervisorId: string
  
  // 方法
  // 获取器方法
  getDepartmentId(): string           // 获取部门ID
  getName(): string                   // 获取部门名称
  getFacilityId(): string            // 获取所属场所ID
  getSupervisorId(): string          // 获取主管ID
  
  // 部门管理方法
  changeSupervisor(supervisorId: string): void    // 更换主管
  changeFacility(facilityId: string): void        // 更换所属场所
  setName(name: string): void                     // 修改部门名称
  
  // 查询方法
  belongsToFacility(facilityId: string): boolean  // 检查是否属于指定场所
}
```

## 实体

### User
```typescript
class User {
  // 标识符
  userId: string
  
  // 属性
  username: string
  role: UserRole
  departmentId?: string
  facilityId?: string
  hasApprovalAuthority: boolean
  requiresApproval: boolean
  
  // 方法
  // 获取器方法
  getUserId(): string                      // 获取用户ID
  getUsername(): string                    // 获取用户名
  getRole(): UserRole                      // 获取用户角色
  getDepartmentId(): string | undefined    // 获取部门ID
  getFacilityId(): string | undefined      // 获取场所ID
  
  // 组织分配方法
  assignToDepartment(departmentId: string): void  // 分配到部门
  assignToFacility(facilityId: string): void      // 分配到场所
  
  // 权限相关方法
  canApproveRequests(): boolean                   // 检查是否有审批权限
  requiresRequestApproval(): boolean              // 检查是否需要审批
  changeRole(role: UserRole): void               // 修改用户角色
  setApprovalAuthority(hasAuthority: boolean): void  // 设置审批权限
  setRequiresApproval(requires: boolean): void      // 设置是否需要审批
}
```

## 值对象

### OrganizationInfo
```typescript
class OrganizationInfo {
  // 场所信息
  facilityId: string
  facilityName: string
  
  // 部门信息（可选）
  departmentId?: string
  departmentName?: string
  
  // 主管信息（可选）
  supervisorId?: string
  supervisorName?: string
  
  // 经理信息（可选）
  managerId?: string
  managerName?: string

  // 获取器方法
  getFacilityId(): string                    // 获取场所ID
  getFacilityName(): string                  // 获取场所名称
  getDepartmentId(): string | undefined      // 获取部门ID
  getDepartmentName(): string | undefined    // 获取部门名称
  getSupervisorId(): string | undefined      // 获取主管ID
  getSupervisorName(): string | undefined    // 获取主管名称
  getManagerId(): string | undefined         // 获取经理ID
  getManagerName(): string | undefined       // 获取经理名称

  // 值对象比较方法
  equals(other: OrganizationInfo): boolean   // 比较两个组织信息是否相等
}
```

## 领域服务

### OrganizationService（组织架构服务）
```typescript
interface OrganizationService {
  // 核心职责：处理组织架构的查询和验证逻辑
  // 这些逻辑不适合放在实体中，因为它需要跨多个聚合进行复杂的组织关系查询
  
  // 获取用户的组织信息
  // 输入：用户ID
  // 输出：组织信息
  // 业务意义：获取用户的完整组织架构信息，包括所属部门、场所等
  getUserOrganizationInfo(userId: string): Promise<OrganizationInfo>
  
  // 获取部门的完整层级信息
  // 输入：部门ID
  // 输出：组织信息
  // 业务意义：获取部门的完整组织架构信息，包括所属场所、主管等
  getDepartmentHierarchy(departmentId: string): Promise<OrganizationInfo>
  
  // 获取场所的客户列表
  // 输入：场所ID
  // 输出：客户用户列表
  // 业务意义：获取指定场所关联的所有客户信息
  getFacilityCustomers(facilityId: string): Promise<User[]>
  
  // 验证用户权限
  // 输入：用户ID、目标ID、操作类型
  // 输出：是否有权限
  // 业务意义：验证用户是否有权限执行特定操作
  validateUserAuthority(userId: string, targetId: string, operation: string): Promise<boolean>
  
  // 依赖关系：
  // - 需要访问 Facility 聚合
  // - 需要访问 Department 聚合
  // - 需要访问 User 实体
  // - 需要访问相应的仓储接口
}
```

### UserAssignmentService（用户分配服务）
```typescript
interface UserAssignmentService {
  // 核心职责：处理用户在组织架构中的分配和调整
  // 这些逻辑不适合放在实体中，因为它涉及多个聚合之间的协调和业务规则验证
  
  // 分配用户到部门
  // 输入：用户ID、部门ID
  // 输出：无
  // 业务意义：将用户分配到指定部门，并处理相关的组织关系
  assignUserToDepartment(userId: string, departmentId: string): Promise<void>
  
  // 分配用户到场所
  // 输入：用户ID、场所ID
  // 输出：无
  // 业务意义：将用户分配到指定场所，并处理相关的组织关系
  assignUserToFacility(userId: string, facilityId: string): Promise<void>
  
  // 更换部门主管
  // 输入：部门ID、新主管ID
  // 输出：无
  // 业务意义：更换部门主管，并处理相关的权限变更
  changeDepartmentSupervisor(departmentId: string, newSupervisorId: string): Promise<void>
  
  // 更换场所经理
  // 输入：场所ID、新经理ID
  // 输出：无
  // 业务意义：更换场所经理，并处理相关的权限变更
  changeFacilityManager(facilityId: string, newManagerId: string): Promise<void>
  
  // 依赖关系：
  // - 需要访问 User 实体
  // - 需要访问 Department 聚合
  // - 需要访问 Facility 聚合
  // - 需要访问相应的仓储接口
}
```

## 仓储

### FacilityRepository
```typescript
interface FacilityRepository {
  save(facility: Facility): Promise<void>
  findById(facilityId: string): Promise<Facility>
  findByCustomerId(customerId: string): Promise<Facility[]>
  findByManagerId(managerId: string): Promise<Facility>
}
```

### DepartmentRepository
```typescript
interface DepartmentRepository {
  save(department: Department): Promise<void>
  findById(departmentId: string): Promise<Department>
  findByFacilityId(facilityId: string): Promise<Department[]>
  findBySupervisorId(supervisorId: string): Promise<Department>
}
```

### UserRepository
```typescript
interface UserRepository {
  save(user: User): Promise<void>
  findById(userId: string): Promise<User>
  findByDepartmentId(departmentId: string): Promise<User[]>
  findByFacilityId(facilityId: string): Promise<User[]>
  findByRole(role: UserRole): Promise<User[]>
  findCustomersByFacilityId(facilityId: string): Promise<User[]>
}
```

## 领域事件

### DepartmentChangedEvent
```typescript
class DepartmentChangedEvent {
  departmentId: string
  oldSupervisorId?: string
  newSupervisorId?: string
  oldFacilityId?: string
  newFacilityId?: string
  timestamp: Date
}
```

### FacilityChangedEvent
```typescript
class FacilityChangedEvent {
  facilityId: string
  oldManagerId?: string
  newManagerId?: string
  customerChange?: {
    type: 'ADD' | 'REMOVE'
    customerId: string
  }
  timestamp: Date
}
```

### UserAssignmentChangedEvent
```typescript
class UserAssignmentChangedEvent {
  userId: string
  oldDepartmentId?: string
  newDepartmentId?: string
  oldFacilityId?: string
  newFacilityId?: string
  timestamp: Date
}
```

## 共享内核（Shared Kernel）

### OrganizationCore
```typescript
interface OrganizationCore {
  // 供其他上下文��用的核心接口
  getUserById(userId: string): Promise<User>
  getDepartmentById(departmentId: string): Promise<Department>
  getFacilityById(facilityId: string): Promise<Facility>
  getOrganizationHierarchy(entityId: string, entityType: 'USER' | 'DEPARTMENT' | 'FACILITY'): Promise<OrganizationInfo>
}
``` 
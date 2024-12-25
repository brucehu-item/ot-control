/**
 * 用户分配变更事件
 * 记录用户在组织架构中的分配变更
 */
export class UserAssignmentChangedEvent {
  constructor(
    public readonly userId: string,
    public readonly oldDepartmentId?: string,
    public readonly newDepartmentId?: string,
    public readonly oldFacilityId?: string,
    public readonly newFacilityId?: string,
    public readonly timestamp: Date = new Date(),
  ) {}
} 
/**
 * 部门变更事件
 * 记录部门主管或所属场所的变更
 */
export class DepartmentChangedEvent {
  constructor(
    public readonly departmentId: string,
    public readonly oldSupervisorId?: string,
    public readonly newSupervisorId?: string,
    public readonly oldFacilityId?: string,
    public readonly newFacilityId?: string,
    public readonly timestamp: Date = new Date(),
  ) {}
} 
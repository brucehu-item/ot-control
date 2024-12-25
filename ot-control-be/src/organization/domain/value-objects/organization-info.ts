export class OrganizationInfo {
  constructor(
    private readonly facilityId: string,
    private readonly facilityName: string,
    private readonly departmentId?: string,
    private readonly departmentName?: string,
    private readonly supervisorId?: string,
    private readonly supervisorName?: string,
    private readonly managerId?: string,
    private readonly managerName?: string,
  ) {}

  public getFacilityId(): string {
    return this.facilityId;
  }

  public getFacilityName(): string {
    return this.facilityName;
  }

  public getDepartmentId(): string | undefined {
    return this.departmentId;
  }

  public getDepartmentName(): string | undefined {
    return this.departmentName;
  }

  public getSupervisorId(): string | undefined {
    return this.supervisorId;
  }

  public getSupervisorName(): string | undefined {
    return this.supervisorName;
  }

  public getManagerId(): string | undefined {
    return this.managerId;
  }

  public getManagerName(): string | undefined {
    return this.managerName;
  }

  public equals(other: OrganizationInfo): boolean {
    return (
      this.facilityId === other.facilityId &&
      this.departmentId === other.departmentId &&
      this.supervisorId === other.supervisorId &&
      this.managerId === other.managerId
    );
  }
} 
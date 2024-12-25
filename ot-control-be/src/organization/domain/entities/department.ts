export class Department {
  constructor(
    private readonly departmentId: string,
    private name: string,
    private facilityId: string,
    private supervisorId: string
  ) {}

  public getDepartmentId(): string {
    return this.departmentId;
  }

  public getName(): string {
    return this.name;
  }

  public getFacilityId(): string {
    return this.facilityId;
  }

  public getSupervisorId(): string {
    return this.supervisorId;
  }

  public changeSupervisor(supervisorId: string): void {
    this.supervisorId = supervisorId;
  }

  public changeFacility(facilityId: string): void {
    this.facilityId = facilityId;
  }

  public belongsToFacility(facilityId: string): boolean {
    return this.facilityId === facilityId;
  }

  public setName(name: string): void {
    this.name = name;
  }
} 
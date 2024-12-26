import { UserRole } from '../../../authentication/domain/model/user-role';

export class User {
  constructor(
    private readonly userId: string,
    private readonly username: string,
    private readonly firstName: string,
    private readonly lastName: string,
    private role: UserRole,
    private departmentId?: string,
    private facilityId?: string,
    private hasApprovalAuthority: boolean = false,
    private requiresApproval: boolean = true,
  ) {}

  public getUserId(): string {
    return this.userId;
  }

  public getUsername(): string {
    return this.username;
  }

  public getFirstName(): string {
    return this.firstName;
  }

  public getLastName(): string {
    return this.lastName;
  }

  public getRole(): UserRole {
    return this.role;
  }

  public getDepartmentId(): string | undefined {
    return this.departmentId;
  }

  public getFacilityId(): string | undefined {
    return this.facilityId;
  }

  public assignToDepartment(departmentId: string): void {
    this.departmentId = departmentId;
  }

  public assignToFacility(facilityId: string): void {
    this.facilityId = facilityId;
  }

  public canApproveRequests(): boolean {
    return this.hasApprovalAuthority;
  }

  public requiresRequestApproval(): boolean {
    return this.requiresApproval;
  }

  public changeRole(role: UserRole): void {
    this.role = role;
  }

  public setApprovalAuthority(hasAuthority: boolean): void {
    this.hasApprovalAuthority = hasAuthority;
  }

  public setRequiresApproval(requires: boolean): void {
    this.requiresApproval = requires;
  }
} 
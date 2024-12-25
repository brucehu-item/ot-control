export class OvertimeRequestData {
  constructor(
    public readonly startTime: Date,
    public readonly endTime: Date,
    public readonly reason: string,
    public readonly workerId: string,
    public readonly workerName: string,
    public readonly departmentId: string,
    public readonly departmentName: string,
    public readonly facilityId: string,
    public readonly facilityName: string,
    public readonly supervisorId: string,
    public readonly supervisorName: string,
    public readonly requiresManagerApproval: boolean,
    public readonly requiresCustomerApproval: boolean,
    public readonly managerId?: string,
    public readonly managerName?: string,
    public readonly customerId?: string,
    public readonly customerName?: string
  ) {}

  equals(other: OvertimeRequestData): boolean {
    return (
      this.startTime.getTime() === other.startTime.getTime() &&
      this.endTime.getTime() === other.endTime.getTime() &&
      this.reason === other.reason &&
      this.workerId === other.workerId &&
      this.workerName === other.workerName &&
      this.departmentId === other.departmentId &&
      this.departmentName === other.departmentName &&
      this.facilityId === other.facilityId &&
      this.facilityName === other.facilityName &&
      this.supervisorId === other.supervisorId &&
      this.supervisorName === other.supervisorName &&
      this.requiresManagerApproval === other.requiresManagerApproval &&
      this.requiresCustomerApproval === other.requiresCustomerApproval &&
      this.managerId === other.managerId &&
      this.managerName === other.managerName &&
      this.customerId === other.customerId &&
      this.customerName === other.customerName
    );
  }
} 
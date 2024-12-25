import { OvertimeRequestStatus } from './overtime-request-status';

export class RequestSearchCriteria {
  constructor(
    public readonly workerId?: string,
    public readonly departmentId?: string,
    public readonly facilityId?: string,
    public readonly customerId?: string,
    public readonly status?: OvertimeRequestStatus,
    public readonly startDate?: Date,
    public readonly endDate?: Date,
    public readonly page: number = 1,
    public readonly pageSize: number = 10
  ) {
    // 确保页码和每页记录数的合法性
    if (page < 1) {
      throw new Error('Page number must be greater than 0');
    }
    if (pageSize < 1 || pageSize > 50) {
      throw new Error('Page size must be between 1 and 50');
    }
  }

  equals(other: RequestSearchCriteria): boolean {
    return (
      this.workerId === other.workerId &&
      this.departmentId === other.departmentId &&
      this.facilityId === other.facilityId &&
      this.customerId === other.customerId &&
      this.status === other.status &&
      this.startDate?.getTime() === other.startDate?.getTime() &&
      this.endDate?.getTime() === other.endDate?.getTime() &&
      this.page === other.page &&
      this.pageSize === other.pageSize
    );
  }

  hasFilters(): boolean {
    return (
      this.workerId !== undefined ||
      this.departmentId !== undefined ||
      this.facilityId !== undefined ||
      this.customerId !== undefined ||
      this.status !== undefined ||
      this.startDate !== undefined ||
      this.endDate !== undefined
    );
  }
} 
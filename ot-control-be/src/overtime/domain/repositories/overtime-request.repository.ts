import { OvertimeRequest } from '../aggregates/overtime-request';
import { OvertimeRequestStatus } from '../value-objects/overtime-request-status';
import { RequestSearchCriteria } from '../value-objects/request-search-criteria';

export interface OvertimeRequestRepository {
  save(request: OvertimeRequest): Promise<void>;
  findById(requestId: string): Promise<OvertimeRequest | null>;
  
  findByWorkerId(workerId: string, criteria: RequestSearchCriteria): Promise<{
    requests: OvertimeRequest[],
    total: number
  }>;
  
  findByDepartmentId(departmentId: string, criteria: RequestSearchCriteria): Promise<{
    requests: OvertimeRequest[],
    total: number
  }>;
  
  findByFacilityId(facilityId: string, criteria: RequestSearchCriteria): Promise<{
    requests: OvertimeRequest[],
    total: number
  }>;
  
  findByCustomerId(customerId: string, criteria: RequestSearchCriteria): Promise<{
    requests: OvertimeRequest[],
    total: number
  }>;
  
  findByStatus(status: OvertimeRequestStatus, criteria: RequestSearchCriteria): Promise<{
    requests: OvertimeRequest[],
    total: number
  }>;
} 
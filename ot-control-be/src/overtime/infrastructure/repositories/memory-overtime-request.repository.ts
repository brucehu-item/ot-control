import { OvertimeRequest } from '../../domain/aggregates/overtime-request';
import { OvertimeRequestStatus } from '../../domain/value-objects/overtime-request-status';
import { RequestSearchCriteria } from '../../domain/value-objects/request-search-criteria';
import { OvertimeRequestRepository } from '../../domain/repositories/overtime-request.repository';

export class MemoryOvertimeRequestRepository implements OvertimeRequestRepository {
  private requests: Map<string, OvertimeRequest> = new Map();

  async save(request: OvertimeRequest): Promise<void> {
    this.requests.set(request.getId(), request);
  }

  async findById(requestId: string): Promise<OvertimeRequest | null> {
    return this.requests.get(requestId) || null;
  }

  private async findAndPaginate(
    predicate: (request: OvertimeRequest) => boolean,
    criteria: RequestSearchCriteria
  ): Promise<{
    requests: OvertimeRequest[];
    total: number;
  }> {
    const allRequests = Array.from(this.requests.values());
    const filteredRequests = allRequests.filter(predicate);

    // 应用日期过滤
    const dateFilteredRequests = filteredRequests.filter(request => {
      if (criteria.startDate && request.getStartTime() < criteria.startDate) {
        return false;
      }
      if (criteria.endDate && request.getEndTime() > criteria.endDate) {
        return false;
      }
      return true;
    });

    // 应用状态过滤
    const statusFilteredRequests = criteria.status
      ? dateFilteredRequests.filter(request => request.getStatus() === criteria.status)
      : dateFilteredRequests;

    // 计算分页
    const start = (criteria.page - 1) * criteria.pageSize;
    const end = start + criteria.pageSize;
    const paginatedRequests = statusFilteredRequests.slice(start, end);

    return {
      requests: paginatedRequests,
      total: statusFilteredRequests.length
    };
  }

  async findByWorkerId(
    workerId: string,
    criteria: RequestSearchCriteria
  ): Promise<{
    requests: OvertimeRequest[];
    total: number;
  }> {
    return this.findAndPaginate(
      request => request.getWorkerId() === workerId,
      criteria
    );
  }

  async findByDepartmentId(
    departmentId: string,
    criteria: RequestSearchCriteria
  ): Promise<{
    requests: OvertimeRequest[];
    total: number;
  }> {
    return this.findAndPaginate(
      request => request.getDepartmentId() === departmentId,
      criteria
    );
  }

  async findByFacilityId(
    facilityId: string,
    criteria: RequestSearchCriteria
  ): Promise<{
    requests: OvertimeRequest[];
    total: number;
  }> {
    return this.findAndPaginate(
      request => {
        const departmentId = request.getDepartmentId();
        // 注意：这里简化了实现，实际应该通过组织架构服务来判断部门是否属于该场所
        return departmentId.startsWith(facilityId);
      },
      criteria
    );
  }

  async findByCustomerId(
    customerId: string,
    criteria: RequestSearchCriteria
  ): Promise<{
    requests: OvertimeRequest[];
    total: number;
  }> {
    return this.findAndPaginate(
      request => request.getCustomerId() === customerId,
      criteria
    );
  }

  async findByStatus(
    status: OvertimeRequestStatus,
    criteria: RequestSearchCriteria
  ): Promise<{
    requests: OvertimeRequest[];
    total: number;
  }> {
    return this.findAndPaginate(
      request => request.getStatus() === status,
      criteria
    );
  }
} 
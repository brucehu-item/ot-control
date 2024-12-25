import { Facility } from '../../domain/entities/facility';
import { FacilityRepository } from '../../domain/repositories/facility.repository';

export class MemoryFacilityRepository implements FacilityRepository {
  private facilities: Map<string, Facility> = new Map();

  public async save(facility: Facility): Promise<void> {
    this.facilities.set(facility.getFacilityId(), facility);
  }

  public async findById(facilityId: string): Promise<Facility | undefined> {
    return this.facilities.get(facilityId);
  }

  public async findByCustomerId(customerId: string): Promise<Facility[]> {
    return Array.from(this.facilities.values())
      .filter(facility => facility.hasCustomer(customerId));
  }

  public async findByManagerId(managerId: string): Promise<Facility | undefined> {
    return Array.from(this.facilities.values())
      .find(facility => facility.getManagerId() === managerId);
  }
} 
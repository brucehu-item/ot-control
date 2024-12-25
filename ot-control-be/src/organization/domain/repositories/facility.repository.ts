import { Facility } from '../entities/facility';

export interface FacilityRepository {
  save(facility: Facility): Promise<void>;
  findById(facilityId: string): Promise<Facility | undefined>;
  findByCustomerId(customerId: string): Promise<Facility[]>;
  findByManagerId(managerId: string): Promise<Facility | undefined>;
} 
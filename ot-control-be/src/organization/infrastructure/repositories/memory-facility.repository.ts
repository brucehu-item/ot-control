import { Service } from 'typedi';
import { Facility } from '../../domain/entities/facility';
import { FacilityRepository } from '../../domain/repositories/facility.repository';
import fs from 'fs';
import path from 'path';

@Service()
export class MemoryFacilityRepository implements FacilityRepository {
  private facilities: Map<string, Facility> = new Map();

  constructor() {
    // 初始化mock数据
    this.initializeMockData();
  }

  private initializeMockData(): void {
    try {
      // 读取mock数据文件
      const mockDataPath = path.join(process.cwd(), '..', 'mock_data', 'organization.json');
      const organizationData = JSON.parse(fs.readFileSync(mockDataPath, 'utf-8'));

      // 初始化设施数据
      for (const facilityData of organizationData.facilities) {
        const facility = new Facility(
          facilityData.facilityId,
          facilityData.name,
          facilityData.managerId,
          facilityData.customerIds
        );
        this.facilities.set(facility.getFacilityId(), facility);
      }

      console.log('Mock facilities loaded successfully');
    } catch (error) {
      console.error('Failed to load mock facilities:', error);
    }
  }

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
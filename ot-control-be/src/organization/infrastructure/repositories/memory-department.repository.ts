import { Service } from 'typedi';
import { Department } from '../../domain/entities/department';
import { DepartmentRepository } from '../../domain/repositories/department.repository';
import fs from 'fs';
import path from 'path';

@Service()
export class MemoryDepartmentRepository implements DepartmentRepository {
  private departments: Map<string, Department> = new Map();

  constructor() {
    // 初始化mock数据
    this.initializeMockData();
  }

  private initializeMockData(): void {
    try {
      // 读取mock数据文件
      const mockDataPath = path.join(process.cwd(), '..', 'mock_data', 'organization.json');
      const organizationData = JSON.parse(fs.readFileSync(mockDataPath, 'utf-8'));

      // 初始化部门数据
      for (const departmentData of organizationData.departments) {
        const department = new Department(
          departmentData.departmentId,
          departmentData.name,
          departmentData.facilityId,
          departmentData.supervisorId
        );
        this.departments.set(department.getDepartmentId(), department);
      }

      console.log('Mock departments loaded successfully');
    } catch (error) {
      console.error('Failed to load mock departments:', error);
    }
  }

  public async save(department: Department): Promise<void> {
    this.departments.set(department.getDepartmentId(), department);
  }

  public async findById(departmentId: string): Promise<Department | undefined> {
    return this.departments.get(departmentId);
  }

  public async findByFacilityId(facilityId: string): Promise<Department[]> {
    return Array.from(this.departments.values())
      .filter(department => department.getFacilityId() === facilityId);
  }

  public async findBySupervisorId(supervisorId: string): Promise<Department | undefined> {
    return Array.from(this.departments.values())
      .find(department => department.getSupervisorId() === supervisorId);
  }
} 
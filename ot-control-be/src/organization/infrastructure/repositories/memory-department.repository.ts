import { Department } from '../../domain/entities/department';
import { DepartmentRepository } from '../../domain/repositories/department.repository';

export class MemoryDepartmentRepository implements DepartmentRepository {
  private departments: Map<string, Department> = new Map();

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
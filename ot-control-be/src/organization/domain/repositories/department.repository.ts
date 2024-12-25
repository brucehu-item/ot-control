import { Department } from '../entities/department';

export interface DepartmentRepository {
  save(department: Department): Promise<void>;
  findById(departmentId: string): Promise<Department | undefined>;
  findByFacilityId(facilityId: string): Promise<Department[]>;
  findBySupervisorId(supervisorId: string): Promise<Department | undefined>;
} 
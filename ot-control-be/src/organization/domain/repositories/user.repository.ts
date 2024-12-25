import { User } from '../entities/user';
import { UserRole } from '../../../authentication/domain/model/user-role';

export interface UserRepository {
  save(user: User): Promise<void>;
  findById(userId: string): Promise<User | undefined>;
  findByDepartmentId(departmentId: string): Promise<User[]>;
  findByFacilityId(facilityId: string): Promise<User[]>;
  findByRole(role: UserRole): Promise<User[]>;
  findCustomersByFacilityId(facilityId: string): Promise<User[]>;
} 
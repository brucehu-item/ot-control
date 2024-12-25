import { Service } from 'typedi';
import { User } from '../../domain/entities/user';
import { UserRepository } from '../../domain/repositories/user.repository';
import { UserRole } from '../../../authentication/domain/model/user-role';

@Service()
export class MemoryUserRepository implements UserRepository {
  private users: Map<string, User> = new Map();

  public async save(user: User): Promise<void> {
    this.users.set(user.getUserId(), user);
  }

  public async findById(userId: string): Promise<User | undefined> {
    return this.users.get(userId);
  }

  public async findByDepartmentId(departmentId: string): Promise<User[]> {
    return Array.from(this.users.values())
      .filter(user => user.getDepartmentId() === departmentId);
  }

  public async findByFacilityId(facilityId: string): Promise<User[]> {
    return Array.from(this.users.values())
      .filter(user => user.getFacilityId() === facilityId);
  }

  public async findByRole(role: UserRole): Promise<User[]> {
    return Array.from(this.users.values())
      .filter(user => user.getRole() === role);
  }

  public async findCustomersByFacilityId(facilityId: string): Promise<User[]> {
    return Array.from(this.users.values())
      .filter(user => 
        user.getFacilityId() === facilityId && 
        user.getRole() === UserRole.CUSTOMER
      );
  }
} 
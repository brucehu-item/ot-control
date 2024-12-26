import {Service} from 'typedi';
import {User} from '../../domain/entities/user';
import {UserRepository} from '../../domain/repositories/user.repository';
import {UserRole} from '../../../authentication/domain/model/user-role';
import * as fs from 'fs';
import * as path from 'path';

@Service()
export class MemoryUserRepository implements UserRepository {
    private users: Map<string, User> = new Map();

    constructor() {
        this.initializeMockData();
    }

    private initializeMockData(): void {
        try {
            const mockDataPath = path.join(process.cwd(), '..', 'mock_data', 'users.json');
            const mockData = JSON.parse(fs.readFileSync(mockDataPath, 'utf-8'));

            mockData.users.forEach((userData: any) => {
                const user = new User(
                    userData.userId,
                    userData.username,
                    userData.firstName,
                    userData.lastName,
                    userData.role as UserRole,
                    userData.departmentId,
                    userData.facilityId,
                    userData.hasApprovalAuthority,
                    userData.requiresApproval
                );
                this.users.set(user.getUserId(), user);
            });
        } catch (error) {
            console.error('Failed to load mock user data:', error);
        }
    }

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
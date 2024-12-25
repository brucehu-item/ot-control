import { Container } from 'typedi';
import { ORGANIZATION_TOKENS } from '../../../di/tokens';
import { OrganizationService } from '../organization.service';
import { UserRepository } from '../../repositories/user.repository';
import { DepartmentRepository } from '../../repositories/department.repository';
import { FacilityRepository } from '../../repositories/facility.repository';
import { User } from '../../entities/user';
import { Department } from '../../entities/department';
import { Facility } from '../../entities/facility';
import { UserRole } from '../../../../authentication/domain/model/user-role';

describe('OrganizationService', () => {
  let organizationService: OrganizationService;
  let userRepository: UserRepository;
  let departmentRepository: DepartmentRepository;
  let facilityRepository: FacilityRepository;

  const TEST_FACILITY = {
    facilityId: 'facility-1',
    name: 'Test Facility',
    managerId: 'manager-1'
  };

  const TEST_DEPARTMENT = {
    departmentId: 'department-1',
    name: 'Test Department',
    facilityId: TEST_FACILITY.facilityId,
    supervisorId: 'supervisor-1'
  };

  const TEST_USERS = {
    manager: {
      userId: TEST_FACILITY.managerId,
      username: 'manager',
      role: UserRole.MANAGER,
      facilityId: TEST_FACILITY.facilityId,
      departmentId: undefined
    },
    supervisor: {
      userId: TEST_DEPARTMENT.supervisorId,
      username: 'supervisor',
      role: UserRole.SUPERVISOR,
      facilityId: TEST_FACILITY.facilityId,
      departmentId: TEST_DEPARTMENT.departmentId
    },
    employee: {
      userId: 'employee-1',
      username: 'employee',
      role: UserRole.WORKER,
      facilityId: TEST_FACILITY.facilityId,
      departmentId: TEST_DEPARTMENT.departmentId
    }
  };

  beforeEach(() => {
    // 获取服务和仓储实例
    organizationService = Container.get(ORGANIZATION_TOKENS.ORGANIZATION_SERVICE);
    userRepository = Container.get(ORGANIZATION_TOKENS.USER_REPOSITORY);
    departmentRepository = Container.get(ORGANIZATION_TOKENS.DEPARTMENT_REPOSITORY);
    facilityRepository = Container.get(ORGANIZATION_TOKENS.FACILITY_REPOSITORY);

    // 初始化测试数据
    const facility = new Facility(TEST_FACILITY.facilityId, TEST_FACILITY.name, TEST_FACILITY.managerId);
    facilityRepository.save(facility);

    const department = new Department(TEST_DEPARTMENT.departmentId, TEST_DEPARTMENT.name, TEST_DEPARTMENT.facilityId, TEST_DEPARTMENT.supervisorId);
    departmentRepository.save(department);

    Object.values(TEST_USERS).forEach(userData => {
      const user = new User(userData.userId, userData.username, userData.role);
      if (userData.facilityId) {
        user.assignToFacility(userData.facilityId);
      }
      if (userData.departmentId) {
        user.assignToDepartment(userData.departmentId);
      }
      if (userData.role === UserRole.MANAGER || userData.role === UserRole.SUPERVISOR) {
        user.setApprovalAuthority(true);
      }
      userRepository.save(user);
    });
  });

  afterEach(() => {
    Container.reset();
  });

  describe('getUserOrganizationInfo', () => {
    it('should return complete organization info for a user', async () => {
      // When
      const orgInfo = await organizationService.getUserOrganizationInfo(TEST_USERS.employee.userId);

      // Then
      expect(orgInfo).toEqual({
        facilityId: TEST_FACILITY.facilityId,
        facilityName: TEST_FACILITY.name,
        departmentId: TEST_DEPARTMENT.departmentId,
        departmentName: TEST_DEPARTMENT.name,
        supervisorId: TEST_DEPARTMENT.supervisorId,
        supervisorName: TEST_USERS.supervisor.username,
        managerId: TEST_FACILITY.managerId,
        managerName: TEST_USERS.manager.username
      });
    });

    it('should throw error when user not found', async () => {
      // When & Then
      await expect(organizationService.getUserOrganizationInfo('non-existent-user'))
        .rejects
        .toThrow('User not found');
    });
  });

  describe('validateUserAuthority', () => {
    it('should return true when manager approves overtime in their facility', async () => {
      // When
      const hasAuthority = await organizationService.validateUserAuthority(
        TEST_USERS.manager.userId,
        TEST_USERS.employee.userId,
        'APPROVE_OVERTIME'
      );

      // Then
      expect(hasAuthority).toBe(true);
    });

    it('should return true when supervisor approves overtime in their department', async () => {
      // When
      const hasAuthority = await organizationService.validateUserAuthority(
        TEST_USERS.supervisor.userId,
        TEST_USERS.employee.userId,
        'APPROVE_OVERTIME'
      );

      // Then
      expect(hasAuthority).toBe(true);
    });

    it('should return false when supervisor tries to approve overtime outside their department', async () => {
      // Given
      const otherDepartment = new Department('other-dept', 'Other Department', TEST_FACILITY.facilityId, '');
      await departmentRepository.save(otherDepartment);

      const otherEmployee = new User('other-employee', 'other', UserRole.WORKER);
      otherEmployee.assignToFacility(TEST_FACILITY.facilityId);
      otherEmployee.assignToDepartment(otherDepartment.getDepartmentId());
      await userRepository.save(otherEmployee);

      // When
      const hasAuthority = await organizationService.validateUserAuthority(
        TEST_USERS.supervisor.userId,
        otherEmployee.getUserId(),
        'APPROVE_OVERTIME'
      );

      // Then
      expect(hasAuthority).toBe(false);
    });
  });
}); 
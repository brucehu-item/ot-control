import { Inject, Service } from 'typedi';
import { UserRepository } from '../repositories/user.repository';
import { DepartmentRepository } from '../repositories/department.repository';
import { FacilityRepository } from '../repositories/facility.repository';
import { UserRole } from '../../../authentication/domain/model/user-role';
import { ORGANIZATION_TOKENS } from '../../di/tokens';

/**
 * 用户分配服务
 * 核心职责：处理用户在组织架构中的分配和调整
 * 这些逻辑不适合放在实体中，因为它涉及多个聚合之间的协调和业务规则验证
 */
export interface UserAssignmentService {
  /**
   * 分配用户到部门
   * @param userId 用户ID
   * @param departmentId 部门ID
   * @description 将用户分配到指定部门，并处理相关的组织关系
   */
  assignUserToDepartment(userId: string, departmentId: string): Promise<void>;

  /**
   * 分配用户到场所
   * @param userId 用户ID
   * @param facilityId 场所ID
   * @description 将用户分配到指定场所，并处理相关的组织关系
   */
  assignUserToFacility(userId: string, facilityId: string): Promise<void>;

  /**
   * 更换部门主管
   * @param departmentId 部门ID
   * @param newSupervisorId 新主管ID
   * @description 更换部门主管，并处理相关的权限变更
   */
  changeDepartmentSupervisor(departmentId: string, newSupervisorId: string): Promise<void>;

  /**
   * 更换场所经理
   * @param facilityId 场所ID
   * @param newManagerId 新经理ID
   * @description 更换场所经理，并处理相关的权限变更
   */
  changeFacilityManager(facilityId: string, newManagerId: string): Promise<void>;
}

@Service()
export class UserAssignmentServiceImpl implements UserAssignmentService {
  constructor(
    @Inject(ORGANIZATION_TOKENS.USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(ORGANIZATION_TOKENS.DEPARTMENT_REPOSITORY)
    private readonly departmentRepository: DepartmentRepository,
    @Inject(ORGANIZATION_TOKENS.FACILITY_REPOSITORY)
    private readonly facilityRepository: FacilityRepository,
  ) {}

  public async assignUserToDepartment(userId: string, departmentId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const department = await this.departmentRepository.findById(departmentId);
    if (!department) {
      throw new Error('Department not found');
    }

    // 如果用户还没有分配到场所，先分配到部门所属的场所
    if (!user.getFacilityId()) {
      await this.assignUserToFacility(userId, department.getFacilityId());
    }

    // 确保用户属于同一个场所
    if (user.getFacilityId() !== department.getFacilityId()) {
      throw new Error('User and department must belong to the same facility');
    }

    user.assignToDepartment(departmentId);
    await this.userRepository.save(user);
  }

  public async assignUserToFacility(userId: string, facilityId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const facility = await this.facilityRepository.findById(facilityId);
    if (!facility) {
      throw new Error('Facility not found');
    }

    user.assignToFacility(facilityId);
    await this.userRepository.save(user);
  }

  public async changeDepartmentSupervisor(departmentId: string, newSupervisorId: string): Promise<void> {
    const department = await this.departmentRepository.findById(departmentId);
    if (!department) {
      throw new Error('Department not found');
    }

    const newSupervisor = await this.userRepository.findById(newSupervisorId);
    if (!newSupervisor) {
      throw new Error('New supervisor not found');
    }

    // 确保新主管是主管角色
    if (newSupervisor.getRole() !== UserRole.SUPERVISOR) {
      throw new Error('New supervisor must have SUPERVISOR role');
    }

    // 确保新主管属于同一个场所
    if (newSupervisor.getFacilityId() !== department.getFacilityId()) {
      throw new Error('New supervisor must belong to the same facility');
    }

    // 更新旧主管的权限
    const oldSupervisorId = department.getSupervisorId();
    if (oldSupervisorId) {
      const oldSupervisor = await this.userRepository.findById(oldSupervisorId);
      if (oldSupervisor) {
        oldSupervisor.setApprovalAuthority(false);
        await this.userRepository.save(oldSupervisor);
      }
    }

    // 更新新主管的权限
    newSupervisor.setApprovalAuthority(true);
    await this.userRepository.save(newSupervisor);

    // 更新部门主管
    department.changeSupervisor(newSupervisorId);
    await this.departmentRepository.save(department);
  }

  public async changeFacilityManager(facilityId: string, newManagerId: string): Promise<void> {
    const facility = await this.facilityRepository.findById(facilityId);
    if (!facility) {
      throw new Error('Facility not found');
    }

    const newManager = await this.userRepository.findById(newManagerId);
    if (!newManager) {
      throw new Error('New manager not found');
    }

    // 确保新经理是经理角色
    if (newManager.getRole() !== UserRole.MANAGER) {
      throw new Error('New manager must have MANAGER role');
    }

    // 更新旧经理的权限
    const oldManagerId = facility.getManagerId();
    const oldManager = await this.userRepository.findById(oldManagerId);
    if (oldManager) {
      oldManager.setApprovalAuthority(false);
      await this.userRepository.save(oldManager);
    }

    // 更新新经理的权限
    newManager.setApprovalAuthority(true);
    await this.userRepository.save(newManager);

    // 更新场所经理
    facility.changeManager(newManagerId);
    await this.facilityRepository.save(facility);
  }
} 
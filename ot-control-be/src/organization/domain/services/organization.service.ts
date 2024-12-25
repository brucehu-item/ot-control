import { User } from '../entities/user';
import { OrganizationInfo } from '../value-objects/organization-info';
import { UserRepository } from '../repositories/user.repository';
import { DepartmentRepository } from '../repositories/department.repository';
import { FacilityRepository } from '../repositories/facility.repository';
import { UserRole } from '../../../authentication/domain/model/user-role';

/**
 * 组织架构服务
 * 核心职责：处理组织架构的查询和验证逻辑
 * 这些逻辑不适合放在实体中，因为它需要跨多个聚合进行复杂的组织关系查询
 */
export interface OrganizationService {
  /**
   * 获取用户的组织信息
   * @param userId 用户ID
   * @returns 组织信息
   * @description 获取用户的完整组织架构信息，包括所属部门、场所等
   */
  getUserOrganizationInfo(userId: string): Promise<OrganizationInfo>;

  /**
   * 获取部门的完整层级信息
   * @param departmentId 部门ID
   * @returns 组织信息
   * @description 获取部门的完整组织架构信息，包括所属场所、主管等
   */
  getDepartmentHierarchy(departmentId: string): Promise<OrganizationInfo>;

  /**
   * 获取场所的客户列表
   * @param facilityId 场所ID
   * @returns 客户用户列表
   * @description 获取指定场所关联的所有客户信息
   */
  getFacilityCustomers(facilityId: string): Promise<User[]>;

  /**
   * 验证用户权限
   * @param userId 用户ID
   * @param targetId 目标ID
   * @param operation 操作类型
   * @returns 是否有权限
   * @description 验证用户是否有权限执行特定操作
   */
  validateUserAuthority(userId: string, targetId: string, operation: string): Promise<boolean>;
}

export class OrganizationServiceImpl implements OrganizationService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly departmentRepository: DepartmentRepository,
    private readonly facilityRepository: FacilityRepository,
  ) {}

  public async getUserOrganizationInfo(userId: string): Promise<OrganizationInfo> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const facilityId = user.getFacilityId();
    if (!facilityId) {
      throw new Error('User is not assigned to any facility');
    }

    const facility = await this.facilityRepository.findById(facilityId);
    if (!facility) {
      throw new Error('Facility not found');
    }

    const departmentId = user.getDepartmentId();
    let department = undefined;
    if (departmentId) {
      department = await this.departmentRepository.findById(departmentId);
    }

    return new OrganizationInfo(
      facility.getFacilityId(),
      facility.getName(),
      department?.getDepartmentId(),
      department?.getName(),
      department?.getSupervisorId(),
      (department && await this.userRepository.findById(department.getSupervisorId()))?.getUsername(),
      facility.getManagerId(),
      (await this.userRepository.findById(facility.getManagerId()))?.getUsername(),
    );
  }

  public async getDepartmentHierarchy(departmentId: string): Promise<OrganizationInfo> {
    const department = await this.departmentRepository.findById(departmentId);
    if (!department) {
      throw new Error('Department not found');
    }

    const facility = await this.facilityRepository.findById(department.getFacilityId());
    if (!facility) {
      throw new Error('Facility not found');
    }

    return new OrganizationInfo(
      facility.getFacilityId(),
      facility.getName(),
      department.getDepartmentId(),
      department.getName(),
      department.getSupervisorId(),
      (await this.userRepository.findById(department.getSupervisorId()))?.getUsername(),
      facility.getManagerId(),
      (await this.userRepository.findById(facility.getManagerId()))?.getUsername(),
    );
  }

  public async getFacilityCustomers(facilityId: string): Promise<User[]> {
    return this.userRepository.findCustomersByFacilityId(facilityId);
  }

  public async validateUserAuthority(userId: string, targetId: string, operation: string): Promise<boolean> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      return false;
    }

    // 系统管理员有所有权限
    if (user.getRole() === UserRole.SYSTEM_ADMIN) {
      return true;
    }

    // 获取用户和目标的组织信息
    const userOrg = await this.getUserOrganizationInfo(userId);
    
    switch (operation) {
      case 'APPROVE_OVERTIME':
        // 检查用户是否有审批权限
        if (!user.canApproveRequests()) {
          return false;
        }
        
        // 获取目标用户的组织信息
        const targetUser = await this.userRepository.findById(targetId);
        if (!targetUser) {
          return false;
        }
        const targetOrg = await this.getUserOrganizationInfo(targetId);

        // 经理可以审批其场所内的所有加班申请
        if (user.getRole() === UserRole.MANAGER) {
          return userOrg.getFacilityId() === targetOrg.getFacilityId();
        }

        // 主管可以审批其部门内的加班申请
        if (user.getRole() === UserRole.SUPERVISOR) {
          return userOrg.getDepartmentId() === targetOrg.getDepartmentId();
        }

        return false;

      // 可以根据需要添加其他操作类型的验证
      default:
        return false;
    }
  }
} 
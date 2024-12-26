import { Service, Inject } from 'typedi';
import { AuthenticationFacade, UserInfo } from '../../domain/ports/authentication-facade';
import { SecurityContext } from '../../domain/model/security-context';
import { SessionService } from '../../domain/ports/session-service';
import { UserCredentialRepository } from '../../domain/ports/user-credential-repository';
import { INTERNAL_AUTH_TOKENS } from '../../di/tokens';
import { ORGANIZATION_TOKENS as SHARED_ORGANIZATION_TOKENS } from '../../../shared/di/tokens';
import { OrganizationService } from '../../../organization/domain/services/organization.service';

@Service()
export class InMemoryAuthenticationFacade implements AuthenticationFacade {
  constructor(
    @Inject(INTERNAL_AUTH_TOKENS.SessionService)
    private readonly sessionService: SessionService,
    @Inject(INTERNAL_AUTH_TOKENS.UserCredentialRepository)
    private readonly userCredentialRepository: UserCredentialRepository,
    @Inject(SHARED_ORGANIZATION_TOKENS.OrganizationService)
    private readonly organizationService: OrganizationService
  ) {}

  async getCurrentUser(): Promise<UserInfo | null> {
    const token = SecurityContext.getCurrentToken();
    if (!token) {
      return null;
    }

    const session = await this.sessionService.getSession(token);
    if (!session || !session.isValid()) {
      return null;
    }

    const credential = await this.userCredentialRepository.findById(session.getUserId());
    if (!credential) {
      return null;
    }

    try {
      // 获取用户的组织信息
      const orgInfo = await this.organizationService.getUserOrganizationInfo(credential.getUserId());

      // 返回包含组织信息的用户信息
      return {
        userId: credential.getUserId(),
        username: credential.getUsername(),
        firstName: credential.getFirstName(),
        lastName: credential.getLastName(),
        role: credential.getRole(),
        permissions: [credential.getRole()], // 简单实现：将角色作为权限
        departmentId: orgInfo.getDepartmentId(),
        departmentName: orgInfo.getDepartmentName(),
        facilityId: orgInfo.getFacilityId(),
        facilityName: orgInfo.getFacilityName()
      };
    } catch (error) {
      console.error('Failed to get organization info:', error);
      // 如果获取组织信息失败，仍然返回基本用户信息
      return {
        userId: credential.getUserId(),
        username: credential.getUsername(),
        firstName: credential.getFirstName(),
        lastName: credential.getLastName(),
        role: credential.getRole(),
        permissions: [credential.getRole()]
      };
    }
  }

  async isAuthenticated(): Promise<boolean> {
    const token = SecurityContext.getCurrentToken();
    if (!token) {
      return false;
    }

    return this.sessionService.validateSession(token);
  }

  async hasPermission(permission: string): Promise<boolean> {
    const user = await this.getCurrentUser();
    if (!user) {
      return false;
    }

    // 简单实现：检查权限是否在用户的权限列表中
    // 在实际系统中，这里可能需要更复杂的权限检查逻辑
    return user.permissions.includes(permission);
  }
} 
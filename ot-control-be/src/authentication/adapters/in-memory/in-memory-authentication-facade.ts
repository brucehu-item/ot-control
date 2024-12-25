import { Service, Inject } from 'typedi';
import { AuthenticationFacade, UserInfo } from '../../domain/ports/authentication-facade';
import { SecurityContext } from '../../domain/model/security-context';
import { SessionService } from '../../domain/ports/session-service';
import { UserCredentialRepository } from '../../domain/ports/user-credential-repository';
import { INTERNAL_AUTH_TOKENS } from '../../di/tokens';

@Service()
export class InMemoryAuthenticationFacade implements AuthenticationFacade {
  constructor(
    @Inject(INTERNAL_AUTH_TOKENS.SessionService)
    private readonly sessionService: SessionService,
    @Inject(INTERNAL_AUTH_TOKENS.UserCredentialRepository)
    private readonly userCredentialRepository: UserCredentialRepository
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

    // 目前我们使用角色作为权限，在实际系统中可能需要更复杂的权限映射
    return {
      userId: credential.getUserId(),
      username: credential.getUsername(),
      role: credential.getRole(),
      permissions: [credential.getRole()] // 简单实现：将角色作为权限
    };
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
    // 在实际���统中，这里可能需要更复杂的权限检查逻辑
    return user.permissions.includes(permission);
  }
} 
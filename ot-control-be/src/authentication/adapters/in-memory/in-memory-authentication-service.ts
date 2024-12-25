import { Service, Inject } from 'typedi';
import { AuthenticationService } from '../../domain/ports/authentication-service';
import { AuthenticationToken } from '../../domain/model/authentication-token';
import { UserCredentialRepository } from '../../domain/ports/user-credential-repository';
import { SessionService } from '../../domain/ports/session-service';
import { UserAuthenticatedEvent } from '../../domain/model/events';
import { INTERNAL_AUTH_TOKENS } from '../../di/tokens';
import { v4 as uuidv4 } from 'uuid';

@Service()
export class InMemoryAuthenticationService implements AuthenticationService {
  constructor(
    @Inject(INTERNAL_AUTH_TOKENS.UserCredentialRepository)
    private readonly userCredentialRepository: UserCredentialRepository,
    @Inject(INTERNAL_AUTH_TOKENS.SessionService)
    private readonly sessionService: SessionService
  ) {}

  async authenticate(username: string, password: string): Promise<AuthenticationToken> {
    // 查找用户凭证
    const credential = await this.userCredentialRepository.findByUsername(username);
    if (!credential) {
      throw new Error('User not found');
    }

    // 验证密码
    const isValid = await credential.validatePassword(password);
    if (!isValid) {
      throw new Error('Invalid password');
    }

    // 生成新的认证令牌
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24小时后过期
    const authToken = new AuthenticationToken(token, expiresAt);

    // 创建新的会话
    await this.sessionService.createSession(credential.getUserId(), token);

    // 发布用户认证成功事件
    const event = new UserAuthenticatedEvent(
      credential.getUserId(),
      new Date(),
      credential.getRole()
    );
    // 这里可以添加事件发布的逻辑

    return authToken;
  }

  async validateToken(token: string): Promise<boolean> {
    return this.sessionService.validateSession(token);
  }

  async logout(userId: string): Promise<void> {
    // 获取用户的所有会话
    const sessions = await this.sessionService.findByUserId(userId);
    
    // 终止所有会话
    for (const session of sessions) {
      await this.sessionService.terminateSession(session.getToken());
    }
  }

  async refreshToken(token: string): Promise<AuthenticationToken> {
    // 验证当前令牌
    const isValid = await this.validateToken(token);
    if (!isValid) {
      throw new Error('Invalid token');
    }

    // 刷新会话
    const session = await this.sessionService.refreshSession(token);

    // 创建新的认证令牌
    const newToken = uuidv4();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24小时后过期
    const authToken = new AuthenticationToken(newToken, expiresAt);

    return authToken;
  }
} 
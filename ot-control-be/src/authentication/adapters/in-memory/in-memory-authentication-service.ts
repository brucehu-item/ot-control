import { Service, Inject } from 'typedi';
import { AuthenticationService } from '../../domain/ports/authentication-service';
import { AuthenticationToken } from '../../domain/model/authentication-token';
import { UserCredentialRepository } from '../../domain/ports/user-credential-repository';
import { SessionService } from '../../domain/ports/session-service';
import { UserAuthenticatedEvent } from '../../domain/model/events';
import { INTERNAL_AUTH_TOKENS } from '../../di/tokens';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const TOKEN_EXPIRES_IN = '24h';

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

    // 生成 JWT token
    const payload = {
      userId: credential.getUserId(),
      username: credential.getUsername(),
      role: credential.getRole()
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRES_IN });
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
    try {
      jwt.verify(token, JWT_SECRET);
      return this.sessionService.validateSession(token);
    } catch (error) {
      return false;
    }
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
    try {
      // 验证并解码当前令牌
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; username: string; role: string };
      
      // 验证会话
      const isValid = await this.sessionService.validateSession(token);
      if (!isValid) {
        throw new Error('Invalid session');
      }

      // 生成新的 JWT token
      const payload = {
        userId: decoded.userId,
        username: decoded.username,
        role: decoded.role
      };

      const newToken = jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRES_IN });
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const authToken = new AuthenticationToken(newToken, expiresAt);

      // 刷新会话
      await this.sessionService.refreshSession(token);

      return authToken;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
} 
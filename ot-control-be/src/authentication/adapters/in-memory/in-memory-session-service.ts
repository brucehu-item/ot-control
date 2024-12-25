import { Service, Inject } from 'typedi';
import { Session } from '../../domain/model/session';
import { SessionService } from '../../domain/ports/session-service';
import { SessionRepository } from '../../domain/ports/session-repository';
import { INTERNAL_AUTH_TOKENS } from '../../di/tokens';
import { v4 as uuidv4 } from 'uuid';

@Service()
export class InMemorySessionService implements SessionService {
  constructor(
    @Inject(INTERNAL_AUTH_TOKENS.SessionRepository)
    private readonly sessionRepository: SessionRepository
  ) {}

  async createSession(userId: string, token: string): Promise<Session> {
    const session = new Session(
      uuidv4(),
      userId,
      token,
      new Date(Date.now() + 24 * 60 * 60 * 1000), // 24小时后过期
      new Date()
    );
    
    await this.sessionRepository.save(session);
    return session;
  }

  async getSession(token: string): Promise<Session | null> {
    return this.sessionRepository.findByToken(token);
  }

  async validateSession(token: string): Promise<boolean> {
    const session = await this.getSession(token);
    return session !== null && session.isValid();
  }

  async refreshSession(token: string): Promise<Session> {
    const session = await this.getSession(token);
    if (!session) {
      throw new Error('Session not found');
    }

    session.refresh();
    await this.sessionRepository.save(session);
    return session;
  }

  async terminateSession(token: string): Promise<void> {
    const session = await this.getSession(token);
    if (session) {
      session.terminate();
      await this.sessionRepository.save(session);
    }
  }

  async cleanExpiredSessions(): Promise<number> {
    return this.sessionRepository.deleteExpired();
  }

  async findByUserId(userId: string): Promise<Session[]> {
    return this.sessionRepository.findByUserId(userId);
  }
} 
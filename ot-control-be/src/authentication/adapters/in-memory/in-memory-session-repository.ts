import { Service } from 'typedi';
import { Session } from '../../domain/model/session';
import { SessionRepository } from '../../domain/ports/session-repository';

@Service()
export class InMemorySessionRepository implements SessionRepository {
  private sessions: Map<string, Session> = new Map();
  private userSessions: Map<string, Set<string>> = new Map();
  private tokenToSessionId: Map<string, string> = new Map();

  async save(session: Session): Promise<void> {
    // 保存会话
    this.sessions.set(session.getSessionId(), session);
    
    // 更新用户的会话集合
    const userId = session.getUserId();
    if (!this.userSessions.has(userId)) {
      this.userSessions.set(userId, new Set());
    }
    this.userSessions.get(userId)?.add(session.getSessionId());

    // 更新token到会话ID的映射
    this.tokenToSessionId.set(session.getToken(), session.getSessionId());
  }

  async findByToken(token: string): Promise<Session | null> {
    const sessionId = this.tokenToSessionId.get(token);
    if (!sessionId) {
      return null;
    }
    return this.sessions.get(sessionId) || null;
  }

  async findByUserId(userId: string): Promise<Session[]> {
    const sessionIds = this.userSessions.get(userId) || new Set();
    const sessions: Session[] = [];
    
    for (const sessionId of sessionIds) {
      const session = this.sessions.get(sessionId);
      if (session) {
        sessions.push(session);
      }
    }
    
    return sessions;
  }

  async delete(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) {
      // 删除会话
      this.sessions.delete(sessionId);
      
      // 从用户的会话集合中移除
      const userId = session.getUserId();
      this.userSessions.get(userId)?.delete(sessionId);
      
      // 删除token映射
      this.tokenToSessionId.delete(session.getToken());
    }
  }

  async deleteExpired(): Promise<number> {
    let count = 0;
    const now = new Date();
    
    // 找出所有过期的会话
    const expiredSessions = Array.from(this.sessions.values())
      .filter(session => !session.isValid());
    
    // 删除过期会话
    for (const session of expiredSessions) {
      await this.delete(session.getSessionId());
      count++;
    }
    
    return count;
  }
} 
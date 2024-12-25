import { Session } from '../model/session';

export interface SessionRepository {
  save(session: Session): Promise<void>;
  findByToken(token: string): Promise<Session | null>;
  findByUserId(userId: string): Promise<Session[]>;
  delete(sessionId: string): Promise<void>;
  deleteExpired(): Promise<number>;
} 
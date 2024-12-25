import { Session } from '../model/session';

export interface SessionService {
  createSession(userId: string, token: string): Promise<Session>;
  getSession(token: string): Promise<Session | null>;
  validateSession(token: string): Promise<boolean>;
  refreshSession(token: string): Promise<Session>;
  terminateSession(token: string): Promise<void>;
  cleanExpiredSessions(): Promise<number>;
  findByUserId(userId: string): Promise<Session[]>;
} 
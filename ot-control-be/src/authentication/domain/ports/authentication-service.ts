import { AuthenticationToken } from '../model/authentication-token';

export interface AuthenticationService {
  authenticate(username: string, password: string): Promise<AuthenticationToken>;
  validateToken(token: string): Promise<boolean>;
  logout(userId: string): Promise<void>;
  refreshToken(token: string): Promise<AuthenticationToken>;
} 
import { UserRole } from '../model/user-role';

export interface UserInfo {
  userId: string;
  username: string;
  role: UserRole;
  permissions: string[];
}

export interface AuthenticationFacade {
  getCurrentUser(): Promise<UserInfo | null>;
  isAuthenticated(): Promise<boolean>;
  hasPermission(permission: string): Promise<boolean>;
} 
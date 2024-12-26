import { UserRole } from '../model/user-role';

export interface UserInfo {
  userId: string;
  username: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  permissions: string[];
  departmentId?: string;
  departmentName?: string;
  facilityId?: string;
  facilityName?: string;
}

export interface AuthenticationFacade {
  getCurrentUser(): Promise<UserInfo | null>;
  isAuthenticated(): Promise<boolean>;
  hasPermission(permission: string): Promise<boolean>;
} 
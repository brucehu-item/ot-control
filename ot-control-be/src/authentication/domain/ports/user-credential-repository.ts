import { UserCredential } from '../model/user-credential';

export interface UserCredentialRepository {
  findByUsername(username: string): Promise<UserCredential | null>;
  findById(userId: string): Promise<UserCredential | null>;
  save(credential: UserCredential): Promise<void>;
  updatePassword(userId: string, newPassword: string): Promise<void>;
} 
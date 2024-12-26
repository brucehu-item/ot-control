import { Service } from 'typedi';
import { UserCredential } from '../../domain/model/user-credential';
import { UserCredentialRepository } from '../../domain/ports/user-credential-repository';
import { UserRole } from '../../domain/model/user-role';
import fs from 'fs';
import path from 'path';

@Service()
export class InMemoryUserCredentialRepository implements UserCredentialRepository {
  private credentials: Map<string, UserCredential> = new Map();
  private usernameToId: Map<string, string> = new Map();

  constructor() {
    // 初始化mock数据
    this.initializeMockData();
  }

  private initializeMockData(): void {
    try {
      // 读取mock数据文件
      const mockDataPath = path.join(process.cwd(), '..', 'mock_data', 'users.json');
      const usersData = JSON.parse(fs.readFileSync(mockDataPath, 'utf-8'));

      // 初始化用户凭证
      for (const user of usersData.users) {
        const credential = new UserCredential(
          user.userId,
          user.username,
          user.firstName,
          user.lastName,
          user.password,
          user.role as UserRole
        );
        this.credentials.set(credential.getUserId(), credential);
        this.usernameToId.set(credential.getUsername(), credential.getUserId());
      }

      console.log('Mock user credentials loaded successfully');
    } catch (error) {
      console.error('Failed to load mock user credentials:', error);
    }
  }

  async findByUsername(username: string): Promise<UserCredential | null> {
    const userId = this.usernameToId.get(username);
    if (!userId) {
      return null;
    }
    return this.credentials.get(userId) || null;
  }

  async findById(userId: string): Promise<UserCredential | null> {
    return this.credentials.get(userId) || null;
  }

  async save(credential: UserCredential): Promise<void> {
    this.credentials.set(credential.getUserId(), credential);
    this.usernameToId.set(credential.getUsername(), credential.getUserId());
  }

  async updatePassword(userId: string, newPassword: string): Promise<void> {
    const credential = await this.findById(userId);
    if (credential) {
      await credential.changePassword(newPassword);
      await this.save(credential);
    }
  }
} 
import { Service } from 'typedi';
import { UserCredential } from '../../domain/model/user-credential';
import { UserCredentialRepository } from '../../domain/ports/user-credential-repository';
import { UserRole } from '../../domain/model/user-role';

@Service()
export class InMemoryUserCredentialRepository implements UserCredentialRepository {
  private credentials: Map<string, UserCredential> = new Map();
  private usernameToId: Map<string, string> = new Map();

  constructor() {
    // 初始化一些测试数据
    this.initializeTestData();
  }

  private async initializeTestData(): Promise<void> {
    const adminCredential = new UserCredential(
      'admin-id',
      'admin',
      'admin123',
      UserRole.SYSTEM_ADMIN
    );
    const workerCredential = new UserCredential(
      'worker-id',
      'worker',
      'worker123',
      UserRole.WORKER
    );

    await this.save(adminCredential);
    await this.save(workerCredential);
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
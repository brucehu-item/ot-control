import { UserRole } from './user-role';
import * as bcrypt from 'bcrypt';

export class UserCredential {
  constructor(
    private readonly userId: string,
    private readonly username: string,
    private password: string,
    private role: UserRole
  ) {}

  public getUserId(): string {
    return this.userId;
  }

  public getUsername(): string {
    return this.username;
  }

  public getRole(): UserRole {
    return this.role;
  }

  public async validatePassword(inputPassword: string): Promise<boolean> {
    return bcrypt.compare(inputPassword, this.password);
  }

  public async changePassword(newPassword: string): Promise<void> {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(newPassword, salt);
  }
} 
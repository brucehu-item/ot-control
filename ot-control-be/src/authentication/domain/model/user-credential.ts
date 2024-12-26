import { UserRole } from './user-role';

export class UserCredential {
  constructor(
    private readonly userId: string,
    private readonly username: string,
    private readonly firstName: string,
    private readonly lastName: string,
    private password: string,
    private role: UserRole
  ) {}

  public getUserId(): string {
    return this.userId;
  }

  public getUsername(): string {
    return this.username;
  }

  public getFirstName(): string {
    return this.firstName;
  }

  public getLastName(): string {
    return this.lastName;
  }

  public getRole(): UserRole {
    return this.role;
  }

  public async validatePassword(inputPassword: string): Promise<boolean> {
    return this.password === inputPassword;
  }

  public async changePassword(newPassword: string): Promise<void> {
    this.password = newPassword;
  }
} 
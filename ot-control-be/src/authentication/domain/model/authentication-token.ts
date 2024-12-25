export class AuthenticationToken {
  constructor(
    private readonly token: string,
    private readonly expiresAt: Date
  ) {}

  public getToken(): string {
    return this.token;
  }

  public getExpiresAt(): Date {
    return this.expiresAt;
  }

  public isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  public getRemainingTime(): number {
    const now = new Date();
    return Math.max(0, this.expiresAt.getTime() - now.getTime());
  }
} 
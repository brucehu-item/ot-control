export class Session {
  constructor(
    private readonly sessionId: string,
    private readonly userId: string,
    private readonly token: string,
    private expiresAt: Date,
    private lastAccessedAt: Date
  ) {}

  public getSessionId(): string {
    return this.sessionId;
  }

  public getUserId(): string {
    return this.userId;
  }

  public getToken(): string {
    return this.token;
  }

  public getExpiresAt(): Date {
    return this.expiresAt;
  }

  public getLastAccessedAt(): Date {
    return this.lastAccessedAt;
  }

  public isValid(): boolean {
    return new Date() < this.expiresAt;
  }

  public refresh(expirationMinutes: number = 60): void {
    this.expiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000);
    this.updateLastAccessed();
  }

  public terminate(): void {
    this.expiresAt = new Date(0);
  }

  public updateLastAccessed(): void {
    this.lastAccessedAt = new Date();
  }
} 
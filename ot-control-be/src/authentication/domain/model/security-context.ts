import { AsyncLocalStorage } from 'async_hooks';

export class SecurityContext {
  private static tokenStorage = new AsyncLocalStorage<string | null>();

  public static runWithContext<T>(token: string | null, fn: () => Promise<T>): Promise<T> {
    return SecurityContext.tokenStorage.run(token, fn);
  }

  public static setCurrentToken(token: string): void {
    const currentStore = SecurityContext.tokenStorage.getStore();
    if (currentStore === undefined) {
      throw new Error('SecurityContext not initialized. Make sure to use runWithContext.');
    }
    SecurityContext.tokenStorage.enterWith(token);
  }

  public static getCurrentToken(): string | null {
    const token = SecurityContext.tokenStorage.getStore();
    return token === undefined ? null : token;
  }

  public static clearCurrentToken(): void {
    SecurityContext.tokenStorage.enterWith(null);
  }
} 
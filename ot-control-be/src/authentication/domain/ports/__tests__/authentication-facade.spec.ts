import { Container } from 'typedi';
import { AUTH_TOKENS } from '../../../../shared/di/tokens';
import { INTERNAL_AUTH_TOKENS } from '../../../di/tokens';
import { AuthenticationFacade } from '../authentication-facade';
import { AuthenticationService } from '../authentication-service';
import { UserRole } from '../../model/user-role';
import { SecurityContext } from '../../model/security-context';
import { configureAuthenticationContext } from '../../../di/development.config';

describe('AuthenticationFacade', () => {
  let authFacade: AuthenticationFacade;
  let authService: AuthenticationService;

  const TEST_USER = {
    username: 'admin',
    password: 'admin123',
    role: UserRole.SYSTEM_ADMIN
  };

  beforeAll(() => {
    // 使用开发环境配置
    configureAuthenticationContext();
  });

  beforeEach(() => {
    authService = Container.get(INTERNAL_AUTH_TOKENS.AuthenticationService);
    authFacade = Container.get(AUTH_TOKENS.AuthFacade);
  });

  afterEach(() => {
    Container.reset();
  });

  describe('getCurrentUser', () => {
    it('should return user info after successful authentication', async () => {
      await SecurityContext.runWithContext(null, async () => {
        // Given
        const authResult = await authService.authenticate(TEST_USER.username, TEST_USER.password);
        SecurityContext.setCurrentToken(authResult.getToken());

        // When
        const userInfo = await authFacade.getCurrentUser();

        // Then
        expect(userInfo).not.toBeNull();
        expect(userInfo).toEqual({
          userId: expect.any(String),
          username: TEST_USER.username,
          role: TEST_USER.role,
          permissions: [TEST_USER.role]
        });
      });
    });
  });

  describe('hasPermission', () => {
    it('should return true when user has the required permission', async () => {
      await SecurityContext.runWithContext(null, async () => {
        // Given
        const authResult = await authService.authenticate(TEST_USER.username, TEST_USER.password);
        SecurityContext.setCurrentToken(authResult.getToken());
        const permission = TEST_USER.role;

        // When
        const hasPermission = await authFacade.hasPermission(permission);

        // Then
        expect(hasPermission).toBe(true);
      });
    });

    it('should return false when user does not have the required permission', async () => {
      await SecurityContext.runWithContext(null, async () => {
        // Given
        const authResult = await authService.authenticate(TEST_USER.username, TEST_USER.password);
        SecurityContext.setCurrentToken(authResult.getToken());
        const nonExistentPermission = 'NON_EXISTENT_PERMISSION';

        // When
        const hasPermission = await authFacade.hasPermission(nonExistentPermission);

        // Then
        expect(hasPermission).toBe(false);
      });
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when user is authenticated', async () => {
      await SecurityContext.runWithContext(null, async () => {
        // Given
        const authResult = await authService.authenticate(TEST_USER.username, TEST_USER.password);
        SecurityContext.setCurrentToken(authResult.getToken());

        // When
        const isAuthenticated = await authFacade.isAuthenticated();

        // Then
        expect(isAuthenticated).toBe(true);
      });
    });

    it('should return false when token is cleared', async () => {
      await SecurityContext.runWithContext(null, async () => {
        // Given
        const authResult = await authService.authenticate(TEST_USER.username, TEST_USER.password);
        SecurityContext.setCurrentToken(authResult.getToken());
        SecurityContext.clearCurrentToken();

        // When
        const isAuthenticated = await authFacade.isAuthenticated();

        // Then
        expect(isAuthenticated).toBe(false);
      });
    });
  });
}); 
import { Container } from 'typedi';
import { INTERNAL_AUTH_TOKENS } from './tokens';
import { AUTH_TOKENS } from '../../shared/di/tokens';

export interface AuthenticationConfig {
  database: {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
  };
  redis: {
    host: string;
    port: number;
    password?: string;
  };
  security: {
    tokenSecret: string;
    tokenExpirationHours: number;
    bcryptRounds: number;
  };
}

export function configureAuthenticationContext(config: AuthenticationConfig): void {
  // 这里是实际的数据库实现的占位，稍后实现
  // Container.set(
  //   INTERNAL_AUTH_TOKENS.UserCredentialRepository,
  //   new PostgresUserCredentialRepository(config.database)
  // );

  // Container.set(
  //   INTERNAL_AUTH_TOKENS.SessionRepository,
  //   new RedisSessionRepository(config.redis)
  // );

  // Container.set(
  //   INTERNAL_AUTH_TOKENS.SessionService,
  //   new DefaultSessionService(
  //     Container.get(INTERNAL_AUTH_TOKENS.SessionRepository),
  //     config.security
  //   )
  // );

  // Container.set(
  //   INTERNAL_AUTH_TOKENS.AuthenticationService,
  //   new DefaultAuthenticationService(
  //     Container.get(INTERNAL_AUTH_TOKENS.UserCredentialRepository),
  //     Container.get(INTERNAL_AUTH_TOKENS.SessionService),
  //     config.security
  //   )
  // );

  // Container.set(
  //   AUTH_TOKENS.AuthFacade,
  //   new DefaultAuthenticationFacade(
  //     Container.get(INTERNAL_AUTH_TOKENS.SessionService),
  //     Container.get(INTERNAL_AUTH_TOKENS.UserCredentialRepository)
  //   )
  // );
} 
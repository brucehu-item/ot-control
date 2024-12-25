import { Container } from 'typedi';
import { INTERNAL_AUTH_TOKENS } from './tokens';
import { AUTH_TOKENS } from '../../shared/di/tokens';
import { InMemoryUserCredentialRepository } from '../adapters/in-memory/in-memory-user-credential-repository';
import { InMemorySessionRepository } from '../adapters/in-memory/in-memory-session-repository';
import { InMemorySessionService } from '../adapters/in-memory/in-memory-session-service';
import { InMemoryAuthenticationService } from '../adapters/in-memory/in-memory-authentication-service';
import { InMemoryAuthenticationFacade } from '../adapters/in-memory/in-memory-authentication-facade';

export function configureAuthenticationContext(): void {
  // Configure internal dependencies
  Container.set(
    INTERNAL_AUTH_TOKENS.UserCredentialRepository,
    new InMemoryUserCredentialRepository()
  );

  Container.set(
    INTERNAL_AUTH_TOKENS.SessionRepository,
    new InMemorySessionRepository()
  );

  Container.set(
    INTERNAL_AUTH_TOKENS.SessionService,
    new InMemorySessionService(
      Container.get(INTERNAL_AUTH_TOKENS.SessionRepository)
    )
  );

  Container.set(
    INTERNAL_AUTH_TOKENS.AuthenticationService,
    new InMemoryAuthenticationService(
      Container.get(INTERNAL_AUTH_TOKENS.UserCredentialRepository),
      Container.get(INTERNAL_AUTH_TOKENS.SessionService)
    )
  );

  // Configure public facade
  Container.set(
    AUTH_TOKENS.AuthFacade,
    new InMemoryAuthenticationFacade(
      Container.get(INTERNAL_AUTH_TOKENS.SessionService),
      Container.get(INTERNAL_AUTH_TOKENS.UserCredentialRepository)
    )
  );
} 
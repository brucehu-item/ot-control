import { Token } from 'typedi';
import { UserCredentialRepository } from '../domain/ports/user-credential-repository';
import { SessionRepository } from '../domain/ports/session-repository';
import { SessionService } from '../domain/ports/session-service';
import { AuthenticationService } from '../domain/ports/authentication-service';

// Internal tokens for authentication context
export const INTERNAL_AUTH_TOKENS = {
  UserCredentialRepository: new Token<UserCredentialRepository>('auth.internal.userCredentialRepository'),
  SessionRepository: new Token<SessionRepository>('auth.internal.sessionRepository'),
  SessionService: new Token<SessionService>('auth.internal.sessionService'),
  AuthenticationService: new Token<AuthenticationService>('auth.internal.authenticationService')
}; 
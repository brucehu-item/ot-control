import { Token } from 'typedi';
import { AuthenticationFacade } from '../../authentication';

// Authentication Context Tokens
export const AUTH_TOKENS = {
  AuthFacade: new Token<AuthenticationFacade>('auth.facade')
}; 
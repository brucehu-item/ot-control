// Public Domain Models
export { UserRole } from './domain/model/user-role';
export { SecurityContext } from './domain/model/security-context';

// Public Interfaces (Ports)
export { AuthenticationFacade, UserInfo } from './domain/ports/authentication-facade';

// Public Events
export {
  UserAuthenticatedEvent,
  UserLoggedOutEvent,
  SessionCreatedEvent,
  SessionTerminatedEvent,
  SessionTerminationReason
} from './domain/model/events'; 
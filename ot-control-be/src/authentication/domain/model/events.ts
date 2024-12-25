import { UserRole } from './user-role';

export class UserAuthenticatedEvent {
  constructor(
    public readonly userId: string,
    public readonly timestamp: Date,
    public readonly role: UserRole
  ) {}
}

export class UserLoggedOutEvent {
  constructor(
    public readonly userId: string,
    public readonly timestamp: Date
  ) {}
}

export class SessionCreatedEvent {
  constructor(
    public readonly sessionId: string,
    public readonly userId: string,
    public readonly timestamp: Date
  ) {}
}

export enum SessionTerminationReason {
  LOGOUT = 'LOGOUT',
  EXPIRED = 'EXPIRED',
  FORCED = 'FORCED'
}

export class SessionTerminatedEvent {
  constructor(
    public readonly sessionId: string,
    public readonly userId: string,
    public readonly timestamp: Date,
    public readonly reason: SessionTerminationReason
  ) {}
} 
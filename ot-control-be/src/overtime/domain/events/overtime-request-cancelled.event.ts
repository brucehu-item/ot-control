import { UserRole } from '../value-objects/user-role';

export class OvertimeRequestCancelledEvent {
  constructor(
    public readonly requestId: string,
    public readonly cancelledBy: string,
    public readonly role: UserRole,
    public readonly timestamp: Date = new Date()
  ) {}
} 
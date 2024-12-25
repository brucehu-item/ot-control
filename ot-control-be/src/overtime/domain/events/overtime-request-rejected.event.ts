import { UserRole } from '../value-objects/user-role';

export class OvertimeRequestRejectedEvent {
  constructor(
    public readonly requestId: string,
    public readonly approverId: string,
    public readonly role: UserRole,
    public readonly reason?: string,
    public readonly timestamp: Date = new Date()
  ) {}
} 
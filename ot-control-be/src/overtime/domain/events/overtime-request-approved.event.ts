import { UserRole } from '../value-objects/user-role';

export class OvertimeRequestApprovedEvent {
  constructor(
    public readonly requestId: string,
    public readonly approverId: string,
    public readonly role: UserRole,
    public readonly timestamp: Date = new Date()
  ) {}
} 
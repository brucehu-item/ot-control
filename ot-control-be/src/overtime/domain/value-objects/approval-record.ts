import { UserRole } from './user-role';

export type ApprovalAction = 'APPROVE' | 'REJECT';

export class ApprovalRecord {
  constructor(
    public readonly approverId: string,
    public readonly role: UserRole,
    public readonly action: ApprovalAction,
    public readonly comment?: string,
    public readonly timestamp: Date = new Date()
  ) {}

  equals(other: ApprovalRecord): boolean {
    return (
      this.approverId === other.approverId &&
      this.role === other.role &&
      this.action === other.action &&
      this.comment === other.comment &&
      this.timestamp.getTime() === other.timestamp.getTime()
    );
  }
} 
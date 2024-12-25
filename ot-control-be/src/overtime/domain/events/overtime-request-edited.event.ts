import { UserRole } from '../value-objects/user-role';
import { OvertimeRequestEditData } from '../value-objects/overtime-request-edit-data';

export class OvertimeRequestEditedEvent {
  constructor(
    public readonly requestId: string,
    public readonly editedBy: string,
    public readonly role: UserRole,
    public readonly changes: OvertimeRequestEditData,
    public readonly timestamp: Date = new Date()
  ) {}
} 
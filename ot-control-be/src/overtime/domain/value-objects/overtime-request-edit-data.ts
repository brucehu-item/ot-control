export class OvertimeRequestEditData {
  constructor(
    public readonly startTime?: Date,
    public readonly endTime?: Date,
    public readonly reason?: string,
    public readonly customerId?: string
  ) {}

  hasChanges(): boolean {
    return this.startTime !== undefined || 
           this.endTime !== undefined || 
           this.reason !== undefined || 
           this.customerId !== undefined;
  }

  equals(other: OvertimeRequestEditData): boolean {
    return (
      this.startTime?.getTime() === other.startTime?.getTime() &&
      this.endTime?.getTime() === other.endTime?.getTime() &&
      this.reason === other.reason &&
      this.customerId === other.customerId
    );
  }
} 
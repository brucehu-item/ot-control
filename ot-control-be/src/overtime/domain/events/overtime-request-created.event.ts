export class OvertimeRequestCreatedEvent {
  constructor(
    public readonly requestId: string,
    public readonly workerId: string,
    public readonly supervisorId: string,
    public readonly timestamp: Date = new Date()
  ) {}
} 
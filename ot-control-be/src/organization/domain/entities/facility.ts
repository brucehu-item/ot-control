export class Facility {
  private readonly customerIds: string[];

  constructor(
    private readonly facilityId: string,
    private name: string,
    private managerId: string,
    customerIds: string[] = []
  ) {
    this.customerIds = [...customerIds];
  }

  public getFacilityId(): string {
    return this.facilityId;
  }

  public getName(): string {
    return this.name;
  }

  public getManagerId(): string {
    return this.managerId;
  }

  public getCustomerIds(): string[] {
    return [...this.customerIds];
  }

  public addCustomer(customerId: string): void {
    if (!this.hasCustomer(customerId)) {
      this.customerIds.push(customerId);
    }
  }

  public removeCustomer(customerId: string): void {
    const index = this.customerIds.indexOf(customerId);
    if (index !== -1) {
      this.customerIds.splice(index, 1);
    }
  }

  public changeManager(managerId: string): void {
    this.managerId = managerId;
  }

  public hasCustomer(customerId: string): boolean {
    return this.customerIds.includes(customerId);
  }

  public setName(name: string): void {
    this.name = name;
  }
} 
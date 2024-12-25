/**
 * 客户变更类型
 */
export type CustomerChangeType = 'ADD' | 'REMOVE';

/**
 * 客户变更信息
 */
export interface CustomerChange {
  type: CustomerChangeType;
  customerId: string;
}

/**
 * 场所变更事件
 * 记录场所经理或客户列表的变更
 */
export class FacilityChangedEvent {
  constructor(
    public readonly facilityId: string,
    public readonly oldManagerId?: string,
    public readonly newManagerId?: string,
    public readonly customerChange?: CustomerChange,
    public readonly timestamp: Date = new Date(),
  ) {}
} 
import { Container } from 'typedi';
import { OVERTIME_TOKENS } from './tokens';
import { MemoryOvertimeRequestRepository } from '../infrastructure/repositories/memory-overtime-request.repository';
import { OvertimeRequestServiceImpl } from '../domain/services/overtime-request.service.impl';
import { ORGANIZATION_TOKENS } from '../../organization/di/tokens';

export function configureOvertimeContext(): void {
  // 配置仓储
  Container.set(
    OVERTIME_TOKENS.OvertimeRequestRepository,
    new MemoryOvertimeRequestRepository()
  );

  // 配置服务
  Container.set(
    OVERTIME_TOKENS.OvertimeRequestService,
    new OvertimeRequestServiceImpl(
      Container.get(OVERTIME_TOKENS.OvertimeRequestRepository),
      Container.get(ORGANIZATION_TOKENS.USER_REPOSITORY)
    )
  );
} 
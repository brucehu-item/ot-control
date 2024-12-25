import { Container } from 'typedi';
import { OVERTIME_TOKENS } from './tokens';
import { OvertimeRequestServiceImpl } from '../domain/services/overtime-request.service.impl';
import { ORGANIZATION_TOKENS } from '../../shared/di/tokens';

export interface OvertimeConfig {
  database: {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
  };
  redis: {
    host: string;
    port: number;
    password?: string;
  };
}

export function configureOvertimeContext(config: OvertimeConfig): void {
  // 配置仓储
  // TODO: 实现生产环境的仓储
  // Container.set(
  //   OVERTIME_TOKENS.OvertimeRequestRepository,
  //   new PostgresOvertimeRequestRepository(config.database)
  // );

  // 配置服务
  Container.set(
    OVERTIME_TOKENS.OvertimeRequestService,
    new OvertimeRequestServiceImpl(
      Container.get(OVERTIME_TOKENS.OvertimeRequestRepository),
      Container.get(ORGANIZATION_TOKENS.UserRepository)
    )
  );
} 
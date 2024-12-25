import { Container } from 'typedi';
import { ORGANIZATION_TOKENS } from './tokens';
import { ORGANIZATION_TOKENS as SHARED_TOKENS } from '../../shared/di/tokens';

export interface OrganizationConfig {
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

export function configureOrganizationContext(config: OrganizationConfig): void {
  // 这里是实际的数据库实现的占位，稍后实现
  // Container.set(
  //   ORGANIZATION_TOKENS.USER_REPOSITORY,
  //   new PostgresUserRepository(config.database)
  // );

  // Container.set(
  //   ORGANIZATION_TOKENS.DEPARTMENT_REPOSITORY,
  //   new PostgresDepartmentRepository(config.database)
  // );

  // Container.set(
  //   ORGANIZATION_TOKENS.FACILITY_REPOSITORY,
  //   new PostgresFacilityRepository(config.database)
  // );

  // Container.set(
  //   ORGANIZATION_TOKENS.ORGANIZATION_SERVICE,
  //   Container.get(SHARED_TOKENS.OrganizationService)
  // );

  // Container.set(
  //   ORGANIZATION_TOKENS.USER_ASSIGNMENT_SERVICE,
  //   Container.get(SHARED_TOKENS.UserAssignmentService)
  // );
} 
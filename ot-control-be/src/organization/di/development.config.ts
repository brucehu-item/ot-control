import { Container } from 'typedi';
import { ORGANIZATION_TOKENS } from './tokens';
import { MemoryUserRepository } from '../infrastructure/repositories/memory-user.repository';
import { MemoryDepartmentRepository } from '../infrastructure/repositories/memory-department.repository';
import { MemoryFacilityRepository } from '../infrastructure/repositories/memory-facility.repository';
import { OrganizationServiceImpl } from '../domain/services/organization.service';
import { UserAssignmentServiceImpl } from '../domain/services/user-assignment.service';

export function configureOrganizationContext(): void {
  // 配置仓储
  Container.set(
    ORGANIZATION_TOKENS.USER_REPOSITORY,
    new MemoryUserRepository()
  );

  Container.set(
    ORGANIZATION_TOKENS.DEPARTMENT_REPOSITORY,
    new MemoryDepartmentRepository()
  );

  Container.set(
    ORGANIZATION_TOKENS.FACILITY_REPOSITORY,
    new MemoryFacilityRepository()
  );

  // 配置服务
  Container.set(
    ORGANIZATION_TOKENS.ORGANIZATION_SERVICE,
    new OrganizationServiceImpl(
      Container.get(ORGANIZATION_TOKENS.USER_REPOSITORY),
      Container.get(ORGANIZATION_TOKENS.DEPARTMENT_REPOSITORY),
      Container.get(ORGANIZATION_TOKENS.FACILITY_REPOSITORY)
    )
  );

  Container.set(
    ORGANIZATION_TOKENS.USER_ASSIGNMENT_SERVICE,
    new UserAssignmentServiceImpl(
      Container.get(ORGANIZATION_TOKENS.USER_REPOSITORY),
      Container.get(ORGANIZATION_TOKENS.DEPARTMENT_REPOSITORY),
      Container.get(ORGANIZATION_TOKENS.FACILITY_REPOSITORY)
    )
  );
} 
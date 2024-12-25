import { Token } from 'typedi';
import { UserRepository } from '../domain/repositories/user.repository';
import { DepartmentRepository } from '../domain/repositories/department.repository';
import { FacilityRepository } from '../domain/repositories/facility.repository';
import { OrganizationService } from '../domain/services/organization.service';
import { UserAssignmentService } from '../domain/services/user-assignment.service';

export const ORGANIZATION_TOKENS = {
  // 仓储
  USER_REPOSITORY: new Token<UserRepository>('ORGANIZATION.USER_REPOSITORY'),
  DEPARTMENT_REPOSITORY: new Token<DepartmentRepository>('ORGANIZATION.DEPARTMENT_REPOSITORY'),
  FACILITY_REPOSITORY: new Token<FacilityRepository>('ORGANIZATION.FACILITY_REPOSITORY'),

  // 服务
  ORGANIZATION_SERVICE: new Token<OrganizationService>('ORGANIZATION.ORGANIZATION_SERVICE'),
  USER_ASSIGNMENT_SERVICE: new Token<UserAssignmentService>('ORGANIZATION.USER_ASSIGNMENT_SERVICE'),
} as const; 
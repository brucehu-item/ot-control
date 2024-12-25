import { Token } from 'typedi';
import { AuthenticationFacade } from '../../authentication';
import { OrganizationService } from '../../organization/domain/services/organization.service';
import { UserAssignmentService } from '../../organization/domain/services/user-assignment.service';
import { UserRepository } from '../../organization/domain/repositories/user.repository';

// Authentication Context Tokens
export const AUTH_TOKENS = {
  AuthFacade: new Token<AuthenticationFacade>('auth.facade')
};

// Organization Context Tokens
export const ORGANIZATION_TOKENS = {
  OrganizationService: new Token<OrganizationService>('organization.service'),
  UserAssignmentService: new Token<UserAssignmentService>('organization.user-assignment.service'),
  UserRepository: new Token<UserRepository>('organization.user.repository')
}; 
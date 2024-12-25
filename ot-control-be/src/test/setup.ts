import 'reflect-metadata';
import { Container } from 'typedi';
import { configureAuthenticationContext } from '../authentication/di/development.config';
import { configureOrganizationContext } from '../organization/di/development.config';

beforeAll(() => {
  // 使用开发环境配置
  configureAuthenticationContext();
  configureOrganizationContext();
});

afterAll(() => {
  Container.reset();
}); 
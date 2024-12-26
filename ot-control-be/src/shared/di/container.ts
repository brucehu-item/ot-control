import { Container } from 'typedi';
import { configureAuthenticationContext as configureAuthForProd, AuthenticationConfig } from '../../authentication/di/production.config';
import { configureAuthenticationContext as configureAuthForDev } from '../../authentication/di/development.config';
import { configureOrganizationContext as configureOrgForProd, OrganizationConfig } from '../../organization/di/production.config';
import { configureOrganizationContext as configureOrgForDev } from '../../organization/di/development.config';
import { configureOvertimeContext as configureOvertimeForProd, OvertimeConfig } from '../../overtime/di/production.config';
import { configureOvertimeContext as configureOvertimeForDev } from '../../overtime/di/development.config';

export interface GlobalConfig {
  auth: AuthenticationConfig;
  organization: OrganizationConfig;
  overtime: OvertimeConfig;
  // 其他模块的配置可以在这里添加
}

export class GlobalContainer {
  private static instance: typeof Container | null = null;

  static initialize(config?: GlobalConfig): void {
    try {
      // 重置容器，确保每次初始化都是干净的状态
      Container.reset();

      // 根据环境配置认证模块
      const nodeEnv = process.env.NODE_ENV || 'development';
      
      if (nodeEnv === 'production') {
        if (!config?.auth) {
          throw new Error('Production environment requires authentication configuration');
        }
        if (!config?.organization) {
          throw new Error('Production environment requires organization configuration');
        }
        if (!config?.overtime) {
          throw new Error('Production environment requires overtime configuration');
        }
        // 按照依赖顺序初始化
        configureOrgForProd(config.organization);  // 先初始化 Organization
        configureAuthForProd(config.auth);         // 再初始化 Authentication
        configureOvertimeForProd(config.overtime); // 最后初始化 Overtime
      } else {
        // 开发环境使用内存实现
        // 按照依赖顺序初始化
        configureOrgForDev();    // 先初始化 Organization
        configureAuthForDev();   // 再初始化 Authentication
        configureOvertimeForDev(); // 最后初始化 Overtime
      }

      // 保存容器实例
      this.instance = Container;

      // 添加错误处理
      Container.has = new Proxy(Container.has, {
        apply: (target, thisArg, args) => {
          const result = Reflect.apply(target, thisArg, args);
          if (!result) {
            console.warn(`Dependency not found: ${String(args[0])}`);
          }
          return result;
        }
      });

      Container.get = new Proxy(Container.get, {
        apply: (target, thisArg, args) => {
          try {
            return Reflect.apply(target, thisArg, args);
          } catch (error) {
            console.error(`Error resolving dependency: ${String(args[0])}`, error);
            throw error;
          }
        }
      });

    } catch (error) {
      console.error('Failed to initialize container:', error);
      throw error;
    }
  }

  static getInstance(): typeof Container {
    if (!this.instance) {
      throw new Error('Container not initialized. Call initialize() first.');
    }
    return this.instance;
  }

  static reset(): void {
    Container.reset();
    this.instance = null;
  }
} 
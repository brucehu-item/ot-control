import { AuthenticationConfig, configureAuthenticationContext as configureForProd } from './production.config';
import { configureAuthenticationContext as configureForDev } from './development.config';
export { INTERNAL_AUTH_TOKENS } from './tokens';

// Re-export for external use
export { AuthenticationConfig };
export { configureForDev as configureAuthenticationContextForDev };
export { configureForProd as configureAuthenticationContextForProd };

// 统一的配置函数，根据环境选择合适的配置
export function configureAuthenticationContext(config?: AuthenticationConfig): void {
  if (process.env.NODE_ENV === 'production') {
    if (!config) {
      throw new Error('Production configuration is required in production environment');
    }
    configureForProd(config);
  } else {
    configureForDev();
  }
} 
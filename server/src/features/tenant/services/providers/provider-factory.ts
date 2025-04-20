import { ProviderRegistry } from '@core/providers/registry';
import { providerConfigs } from '@core/providers/config';
import { CloudProviderInterface } from './cloud-provider.interface';
import { logger } from '@core/utils';
import { AppError } from '@core/errors';
import { TokenInfo } from '@core/providers/types';

// Initialize providers
providerConfigs.forEach(config => ProviderRegistry.registerProvider(config));

export class ProviderFactory {
  static createProvider(providerId: string, token: string, tokenInfo?: TokenInfo): CloudProviderInterface {
    logger.debug('Creating cloud provider', {
      providerId,
      hasTokenInfo: !!tokenInfo
    });

    const provider = ProviderRegistry.createProviderInstance(providerId, token, tokenInfo);
    
    if (!provider) {
      throw new AppError(`Provider ${providerId} not found or disabled`, 400);
    }

    return provider;
  }

  static getAvailableProviders() {
    return ProviderRegistry.getEnabledProviders()
      .map(p => p.metadata);
  }

  static isProviderEnabled(providerId: string): boolean {
    return ProviderRegistry.isProviderEnabled(providerId);
  }

  static validateProvider(providerId: string): void {
    if (!this.isProviderEnabled(providerId)) {
      throw new AppError(`Provider ${providerId} not found or disabled`, 400);
    }
  }
}
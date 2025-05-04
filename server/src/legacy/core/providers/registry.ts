/** @deprecated Use equivalent functionality from v2 modules instead. This module will be removed in a future release. */

import { logger } from '@core/utils';
import { ProviderMetadata, ProviderConfig, ProviderRegistration, TokenInfo } from './types';
import { CloudProviderInterface } from '@features/tenant/services/providers/cloud-provider.interface';

export class ProviderRegistry {
  private static providers = new Map<string, ProviderRegistration>();

  static registerProvider(registration: ProviderRegistration) {
    logger.debug('Registering provider', {
      providerId: registration.metadata.id,
      version: registration.metadata.version
    });

    this.providers.set(registration.metadata.id, registration);
  }

  static getProvider(id: string): ProviderRegistration | undefined {
    const provider = this.providers.get(id);
    
    if (!provider) {
      logger.debug('Provider not found', { providerId: id });
      return undefined;
    }

    if (!provider.metadata.enabled) {
      logger.debug('Provider is disabled', { providerId: id });
      return undefined;
    }

    return provider;
  }

  static createProviderInstance(id: string, token: string, tokenInfo?: TokenInfo): CloudProviderInterface | undefined {
    const provider = this.getProvider(id);
    
    if (!provider) {
      return undefined;
    }

    return new provider.factory(token, provider.config, tokenInfo);
  }

  static listProviders(): ProviderRegistration[] {
    return Array.from(this.providers.values());
  }

  static getEnabledProviders(): ProviderRegistration[] {
    return this.listProviders().filter(p => p.metadata.enabled);
  }

  static getProviderMetadata(id: string): ProviderMetadata | undefined {
    return this.getProvider(id)?.metadata;
  }

  static hasProvider(id: string): boolean {
    return this.providers.has(id);
  }

  static isProviderEnabled(id: string): boolean {
    const provider = this.getProvider(id);
    return provider?.metadata.enabled ?? false;
  }
}
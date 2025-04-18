import { IntegrationProvider } from '../../types/api';
import { CloudProviderInterface } from './cloud-provider.interface';
import { DropboxProvider } from './dropbox.provider';
import { GoogleDriveProvider } from './gdrive.provider';
import { logger } from '@core/utils';

export class ProviderFactory {
  static createProvider(provider: IntegrationProvider, token: string): CloudProviderInterface {
    const providerType = provider.toLowerCase();

    logger.debug('Creating cloud provider', {
      provider: providerType
    });

    switch (providerType) {
      case 'dropbox':
        return new DropboxProvider(token);
      case 'gdrive':
        return new GoogleDriveProvider(token);
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }
}
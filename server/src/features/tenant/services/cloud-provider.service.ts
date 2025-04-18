import { AppError } from '@core/errors';
import { Integration } from '../schemas/tenant.schema';
import { logger } from '@core/utils';
import { ProviderFactory } from './providers/provider-factory';
import { CloudFolder, ListFoldersOptions } from './providers/cloud-provider.interface';

export class CloudProviderService {
  private integration: Integration;

  constructor(integration: Integration) {
    this.integration = integration;
  }

  async listFolders(options: ListFoldersOptions): Promise<CloudFolder[]> {
    const { parentId, search } = options;
    const provider = this.integration.provider.toLowerCase();

    try {
      // Log request details
      logger.debug('Listing cloud folders', {
        provider,
        parentId,
        search
      });

      // Get provider instance
      const cloudProvider = ProviderFactory.createProvider(
        this.integration.provider,
        this.integration.token
      );

      // List folders using provider
      const folders = await cloudProvider.listFolders({ parentId, search });

      // Log success
      logger.debug('Listed cloud folders successfully', {
        provider,
        parentId,
        search,
        folderCount: folders.length
      });

      return folders;
    } catch (error) {
      // Log error details
      logger.error('Failed to list cloud folders', {
        provider,
        parentId,
        search,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      throw new AppError(
        `Failed to list folders from ${provider}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        500
      );
    }
  }
}
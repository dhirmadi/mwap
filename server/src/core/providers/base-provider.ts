import { CloudProviderInterface, CloudFolder, ListFoldersOptions, ListFoldersResponse } from '@features/tenant/services/providers/cloud-provider.interface';
import { ProviderCapabilities, ProviderConfig } from './types';
import { AppError } from '@core/errors';
import { logger } from '@core/utils';

export abstract class BaseCloudProvider implements CloudProviderInterface {
  protected constructor(
    protected readonly token: string,
    protected readonly config: ProviderConfig
  ) {
    if (!token) {
      throw new AppError('Token is required for cloud provider operations', 400);
    }
  }

  abstract get capabilities(): ProviderCapabilities;

  protected async validateCapability(capability: keyof ProviderCapabilities, operation: string): Promise<void> {
    if (!this.capabilities[capability]) {
      const error = `Operation ${operation} not supported by this provider`;
      logger.error(error, { capability });
      throw new AppError(error, 400);
    }
  }

  abstract listFolders(options: ListFoldersOptions): Promise<ListFoldersResponse>;
  abstract createNewFolder(parentId: string, name: string): Promise<CloudFolder>;
  abstract removeFolder(folderId: string): Promise<void>;

  // Optional methods with default implementations
  async search?(query: string): Promise<CloudFolder[]> {
    await this.validateCapability('search', 'search');
    throw new AppError('Search not implemented', 501);
  }

  protected handleError(error: unknown, operation: string): never {
    logger.error(`Provider operation failed: ${operation}`, {
      error: error instanceof Error ? error.message : 'Unknown error',
      operation
    });

    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      `Failed to ${operation}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      500
    );
  }

  protected validateInput(value: unknown, name: string): asserts value is string {
    if (!value || typeof value !== 'string') {
      throw new AppError(`Invalid ${name}: must be a non-empty string`, 400);
    }
  }
}
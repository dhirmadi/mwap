/** @deprecated Use equivalent functionality from v2 modules instead. This module will be removed in a future release. */

import { CloudProviderInterface, CloudFolder, ListFoldersOptions, ListFoldersResponse } from '@features/tenant/services/providers/cloud-provider.interface';
import { ProviderCapabilities, ProviderConfig, TokenInfo } from './types';
import { AppError } from '@core/errors';
import { logger } from '@core/utils';
import { RateLimiter } from '@core/utils/rate-limiter';

export abstract class BaseCloudProvider implements CloudProviderInterface {
  protected rateLimiter?: RateLimiter;

  protected constructor(
    protected token: string,
    protected readonly config: ProviderConfig,
    protected tokenInfo?: TokenInfo
  ) {
    if (!token) {
      throw new AppError('Token is required for cloud provider operations', 400);
    }

    // Initialize rate limiter if limits are configured
    if (config.quotaLimits?.requestsPerMinute) {
      this.rateLimiter = new RateLimiter(
        config.quotaLimits.requestsPerMinute,
        this.constructor.name
      );
    }

    // Initialize token info if not provided
    if (!tokenInfo) {
      this.tokenInfo = {
        accessToken: token,
        expiresAt: new Date(Date.now() + 3600 * 1000) // Default 1 hour expiry
      };
    }
  }

  protected async refreshTokenIfNeeded(): Promise<void> {
    if (!this.config.refreshTokens || !this.tokenInfo?.refreshToken) {
      return;
    }

    const expiresAt = this.tokenInfo.expiresAt;
    if (!expiresAt || expiresAt > new Date(Date.now() + 300 * 1000)) { // 5 min buffer
      return;
    }

    try {
      const newTokenInfo = await this.refreshAccessToken();
      this.token = newTokenInfo.accessToken;
      this.tokenInfo = newTokenInfo;
    } catch (error) {
      logger.error('Failed to refresh access token', {
        error: error instanceof Error ? error.message : 'Unknown error',
        provider: this.constructor.name
      });
      throw new AppError('Failed to refresh access token', 401);
    }
  }

  protected abstract refreshAccessToken(): Promise<TokenInfo>;

  protected async withRateLimit<T>(operation: () => Promise<T>): Promise<T> {
    try {
      // Check token refresh before operation
      await this.refreshTokenIfNeeded();

      // Check rate limit
      if (this.rateLimiter) {
        await this.rateLimiter.checkLimit();
      }

      return await operation();
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw this.handleError(error, 'executing rate-limited operation');
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
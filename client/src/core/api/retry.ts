import { AxiosError, AxiosInstance } from 'axios';
import { RetryConfig, DEFAULT_RETRY_CONFIG } from './config';
import { transformApiError } from '../errors';

/**
 * Calculate delay with exponential backoff
 */
export function getBackoffDelay(retryCount: number, baseDelay: number): number {
  return baseDelay * Math.pow(2, retryCount - 1);
}

/**
 * Check if request should be retried
 */
export function shouldRetry(
  status: number | undefined,
  retryCount: number | undefined,
  config: RetryConfig
): boolean {
  if (!status || !retryCount) return false;
  return (
    retryCount < config.count &&
    config.statusCodes.includes(status)
  );
}

/**
 * Delay promise
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Create retry handler for axios
 */
export function createRetryHandler(
  client: AxiosInstance,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
) {
  return async (error: unknown) => {
    const axiosError = error as AxiosError;
    const { config: requestConfig, response } = axiosError;

    // Don't retry if:
    // - No config (shouldn't happen)
    // - Method is not GET (don't retry mutations)
    // - Status code not in retry list
    // - Already retried max times
    if (
      !requestConfig ||
      requestConfig.method !== 'get' ||
      !shouldRetry(response?.status, requestConfig.retryCount, config)
    ) {
      return Promise.reject(transformApiError(error));
    }

    // Increment retry count
    requestConfig.retryCount = (requestConfig.retryCount ?? 0) + 1;

    // Wait with exponential backoff
    const delayMs = getBackoffDelay(requestConfig.retryCount, config.delay);
    await delay(delayMs);

    // Retry request
    return client(requestConfig);
  };
}
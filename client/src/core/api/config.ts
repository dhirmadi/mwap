/**
 * API configuration constants
 */
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || '/api',  // Use environment variable in development
  TIMEOUT: 10000,
  RETRY: {
    COUNT: 3,
    DELAY: 1000,
    STATUS_CODES: [408, 429, 500, 502, 503, 504]
  },
  HEADERS: {
    CONTENT_TYPE: 'application/json',
    ACCEPT: 'application/json'
  }
} as const;

/**
 * API configuration interface
 */
export interface ApiConfig {
  readonly baseURL: string;
  readonly timeout: number;
  readonly headers: Record<string, string>;
}

/**
 * Retry configuration interface
 */
export interface RetryConfig {
  readonly count: number;
  readonly delay: number;
  readonly statusCodes: readonly number[];
}

/**
 * Default retry configuration
 */
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  count: API_CONFIG.RETRY.COUNT,
  delay: API_CONFIG.RETRY.DELAY,
  statusCodes: API_CONFIG.RETRY.STATUS_CODES
} as const;
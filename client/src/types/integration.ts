/**
 * @fileoverview Cloud storage provider integration types and utilities
 * @module integration
 */

/**
 * Available cloud storage providers
 * @constant {readonly string[]}
 */
export const INTEGRATION_PROVIDERS = ['GDRIVE', 'DROPBOX', 'BOX', 'ONEDRIVE'] as const;

/**
 * Type representing supported cloud storage providers
 * @typedef {typeof INTEGRATION_PROVIDERS[number]} IntegrationProvider
 */
export type IntegrationProvider = typeof INTEGRATION_PROVIDERS[number];

/**
 * Type guard to check if a value is a valid IntegrationProvider
 * @function isIntegrationProvider
 * @param {unknown} value - Value to check
 * @returns {boolean} True if value is a valid IntegrationProvider
 * 
 * @example
 * ```typescript
 * if (isIntegrationProvider(provider)) {
 *   // provider is typed as IntegrationProvider
 *   const label = PROVIDER_LABELS[provider];
 * }
 * ```
 */
export function isIntegrationProvider(value: unknown): value is IntegrationProvider {
  return typeof value === 'string' && INTEGRATION_PROVIDERS.includes(value as IntegrationProvider);
}

/**
 * Represents an active cloud storage integration
 * @interface Integration
 * @property {IntegrationProvider} provider - Cloud storage provider type
 * @property {string} token - OAuth access token
 * @property {string} connectedAt - ISO timestamp of when the integration was established
 */
export interface Integration {
  provider: IntegrationProvider;
  token: string;
  connectedAt: string;
}

/**
 * Request payload for adding a new integration
 * @interface AddIntegrationRequest
 * @property {IntegrationProvider} provider - Cloud storage provider to integrate
 * @property {string} token - OAuth access token from the provider
 */
export interface AddIntegrationRequest {
  provider: IntegrationProvider;
  token: string;
}

/**
 * Display names for cloud storage providers
 * @constant {Record<IntegrationProvider, string>}
 * 
 * @example
 * ```typescript
 * const label = PROVIDER_LABELS[provider];
 * // Returns: 'Google Drive' for provider === 'GDRIVE'
 * ```
 */
export const PROVIDER_LABELS: Record<IntegrationProvider, string> = {
  'GDRIVE': 'Google Drive',
  'DROPBOX': 'Dropbox',
  'BOX': 'Box',
  'ONEDRIVE': 'OneDrive'
} as const;
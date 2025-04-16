import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { API_CONFIG, ApiConfig, RetryConfig, DEFAULT_RETRY_CONFIG } from './config';
import { addAuthToken } from './auth';
import { createRetryHandler } from './retry';
import { handleApiError } from '../errors';

/**
 * Extend AxiosRequestConfig to include retry count
 */
declare module 'axios' {
  export interface AxiosRequestConfig {
    retryCount?: number;
  }
}

/**
 * Create axios instance with auth and retry handling
 */
export function createApiClient(
  config: Partial<ApiConfig> = {},
  retryConfig: RetryConfig = DEFAULT_RETRY_CONFIG
): AxiosInstance {
  // Create axios instance with merged config
  const client = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    headers: API_CONFIG.HEADERS,
    ...config
  });

  // Add auth token to requests
  client.interceptors.request.use(addAuthToken);

  // Add response interceptors
  client.interceptors.response.use(
    // Success handler - pass through
    response => response,
    // Error handler - retry or transform error
    createRetryHandler(client, retryConfig)
  );

  return client;
}

/**
 * Hook to get API client instance
 * Use this in components and hooks
 */
export function useApi(
  config: Partial<ApiConfig> = {},
  retryConfig: RetryConfig = DEFAULT_RETRY_CONFIG
): AxiosInstance {
  // Create new instance for each hook call
  // This ensures each component has its own client
  return createApiClient(config, retryConfig);
}

/**
 * Type-safe request methods
 */
export async function get<T>(
  client: AxiosInstance,
  url: string,
  config?: AxiosRequestConfig
): Promise<T> {
  try {
    const response = await client.get<T>(url, config);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function post<T, D = unknown>(
  client: AxiosInstance,
  url: string,
  data?: D,
  config?: AxiosRequestConfig
): Promise<T> {
  try {
    const response = await client.post<T>(url, data, config);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function put<T, D = unknown>(
  client: AxiosInstance,
  url: string,
  data?: D,
  config?: AxiosRequestConfig
): Promise<T> {
  try {
    const response = await client.put<T>(url, data, config);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function patch<T, D = unknown>(
  client: AxiosInstance,
  url: string,
  data?: D,
  config?: AxiosRequestConfig
): Promise<T> {
  try {
    const response = await client.patch<T>(url, data, config);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function del<T>(
  client: AxiosInstance,
  url: string,
  config?: AxiosRequestConfig
): Promise<T> {
  try {
    const response = await client.delete<T>(url, config);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}
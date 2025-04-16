import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { API_CONFIG, ApiConfig, RetryConfig, DEFAULT_RETRY_CONFIG } from './config';
import { addAuthToken, refreshToken } from './auth';
import { createRetryHandler } from './retry';
import { handleApiError, AuthError, ErrorCode } from '../errors';

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
    async (error) => {
      // Log error for debugging
      console.error('API Error:', {
        url: error.config?.url,
        status: error.response?.status,
        data: error.response?.data
      });

      // Handle auth errors
      if (error.response?.status === 401) {
        // Try to refresh token and retry request
        try {
          const token = await refreshToken();
          error.config.headers.Authorization = `Bearer ${token}`;
          return client(error.config);
        } catch (refreshError) {
          // Token refresh failed, trigger auth flow
          throw new AuthError(
            ErrorCode.UNAUTHORIZED,
            'Session expired. Please log in again.',
            refreshError
          );
        }
      }

      // Handle 404 for collections as empty array
      if (
        error.response?.status === 404 &&
        error.config?.method?.toLowerCase() === 'get' &&
        Array.isArray(error.config?.data)
      ) {
        return {
          data: [],
          meta: {
            requestId: error.response?.headers['x-request-id'],
            pagination: {
              total: 0,
              page: 1,
              limit: 10
            }
          }
        };
      }

      // Handle 404 for single resources as null
      if (
        error.response?.status === 404 &&
        error.config?.method?.toLowerCase() === 'get'
      ) {
        return {
          data: null,
          meta: {
            requestId: error.response?.headers['x-request-id']
          }
        };
      }

      // Handle other errors with retry
      return createRetryHandler(client, retryConfig)(error);
    }
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
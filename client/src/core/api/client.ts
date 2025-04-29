import { useMemo } from 'react';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { API_CONFIG, ApiConfig, RetryConfig, DEFAULT_RETRY_CONFIG } from './config';
import { createRetryHandler } from './retry';
import { transformApiError, AuthError, ErrorCode } from '../errors';
import { useAuth } from '../../hooks/useAuth';

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
  getToken: () => Promise<string | null>,
  config: Partial<ApiConfig> = {},
  retryConfig: RetryConfig = DEFAULT_RETRY_CONFIG
): AxiosInstance {
  // Create axios instance with merged config
  console.log('Creating API client with config:', {
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    headers: API_CONFIG.HEADERS,
    envConfig: import.meta.env,
    additionalConfig: config
  });
  
  const client = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    headers: API_CONFIG.HEADERS,
    ...config
  });

  // Add auth token to requests
  client.interceptors.request.use(async (config) => {
    // Skip auth for public endpoints
    if (config.url?.endsWith('/health') || config.url?.includes('/public/')) {
      return config;
    }

    try {
      const token = await getToken();
      if (!token) {
        console.error('No auth token available for request:', {
          url: config.url,
          baseURL: config.baseURL,
          method: config.method
        });
        throw new AuthError(ErrorCode.UNAUTHORIZED, 'No auth token available');
      }

      // Log request details for debugging
      console.debug('Request interceptor:', {
        url: config.url,
        baseURL: config.baseURL,
        fullPath: `${config.baseURL}${config.url}`,
        method: config.method,
        hasToken: !!token,
        headers: {
          ...config.headers,
          Authorization: token ? 'Bearer [REDACTED]' : undefined
        }
      });

      return {
        ...config,
        headers: {
          ...config.headers,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      };
    } catch (error) {
      console.error('Auth error in request interceptor:', {
        error,
        url: config.url,
        baseURL: config.baseURL,
        method: config.method
      });
      throw new AuthError(ErrorCode.UNAUTHORIZED, 'Authentication required', error);
    }
  });

  // Add response interceptors
  client.interceptors.response.use(
    // Success handler - pass through
    response => response,
    // Error handler - retry or transform error
    async (error) => {
      // Log error for debugging with better context
      console.error('API Error:', {
        request: {
          url: error.config?.url,
          baseURL: error.config?.baseURL,
          fullPath: error.config ? `${error.config.baseURL}${error.config.url}` : 'unknown',
          method: error.config?.method,
          headers: error.config?.headers ? {
            ...error.config.headers,
            Authorization: error.config.headers.Authorization ? 'Bearer [REDACTED]' : undefined
          } : undefined
        },
        response: {
          status: error.response?.status,
          data: error.response?.data,
          headers: error.response?.headers
        },
        error: {
          message: error.message,
          code: error.code,
          name: error.name,
          stack: error.stack
        },
        timestamp: new Date().toISOString()
      });

      // Handle auth errors (401) and permission errors (403)
      if (error.response?.status === 401 || error.response?.status === 403) {
        // For 401, try to refresh token and retry
        if (error.response?.status === 401) {
          try {
            const token = await getToken();
            if (!token) {
              throw new AuthError(ErrorCode.UNAUTHORIZED, 'Failed to refresh token');
            }
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
        
        // For 403, provide clear permission error
        if (error.response?.status === 403) {
          const tenantId = error.config?.headers?.['X-Tenant-ID'];
          const errorMessage = tenantId 
            ? `You don't have permission to perform this action in tenant ${tenantId}. Please contact your administrator.`
            : 'You don\'t have permission to perform this action. Please contact your administrator.';
          
          throw new AuthError(
            ErrorCode.FORBIDDEN,
            errorMessage,
            error
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
  const { getToken } = useAuth();
  
  return useMemo(
    () => createApiClient(getToken, config, retryConfig),
    [getToken, config, retryConfig]
  );
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
    const response = await client.get(url, config);
    return response.data.data as T; // ✅ unwrap .data.data
  } catch (error) {
    throw transformApiError(error);
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
    //return response.data;
    return response.data.data as T;
  } catch (error) {
    throw transformApiError(error);
  }
}

export async function put<T, D = unknown>(
  client: AxiosInstance,
  url: string,
  data?: D,
  config?: AxiosRequestConfig
): Promise<T> {
  try {
    const response = await client.put(url, data, config);
    return response.data.data as T; // ✅ unwrap
  } catch (error) {
    throw transformApiError(error);
  }
}


export async function patch<T, D = unknown>(
  client: AxiosInstance,
  url: string,
  data?: D,
  config?: AxiosRequestConfig
): Promise<T> {
  try {
    const response = await client.patch(url, data, config);
    return response.data.data as T; // ✅ unwrap
  } catch (error) {
    throw transformApiError(error);
  }
}


export async function del<T>(
  client: AxiosInstance,
  url: string,
  config?: AxiosRequestConfig
): Promise<T> {
  try {
    const response = await client.delete(url, config);
    return response.data.data as T; // ✅ unwrap
  } catch (error) {
    throw transformApiError(error);
  }
}

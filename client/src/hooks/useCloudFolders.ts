import { useQuery } from '@tanstack/react-query';
import { useApi, get } from '../core/api/client';
import { API_PATHS } from '../core/api/paths';
import { IntegrationProvider } from '../types/tenant';
import { handleApiError } from '../core/errors';

// Debug flag - set to true to enable detailed logging
const DEBUG = true;

export interface CloudFolder {
  id: string;
  name: string;
  path: string;
  hasChildren: boolean;
}

interface CloudFolderListResponse {
  data: CloudFolder[];
}

interface CloudFolderError extends Error {
  status?: number;
  requestId?: string;
}

/**
 * Hook for browsing cloud provider folders
 */
export function useCloudFolders(
  tenantId: string,
  provider: IntegrationProvider,
  parentId?: string,
  search?: string
) {
  const api = useApi();
  const queryKey = ['tenant', tenantId, 'folders', provider, parentId, search];

  // Debug logging for initial parameters
  if (DEBUG) {
    console.info('useCloudFolders parameters:', {
      tenantId,
      provider,
      parentId,
      search,
      queryKey
    });
  }

  return useQuery<CloudFolder[], CloudFolderError>({
    queryKey,
    queryFn: async () => {
      const requestId = Math.random().toString(36).substring(7);
      const normalizedProvider = provider.toUpperCase();

      try {
        // Debug logging for request details
        if (DEBUG) {
          console.info(`[${requestId}] Preparing folder request:`, {
            tenantId,
            provider: normalizedProvider,
            parentId,
            search,
            url: API_PATHS.TENANT.INTEGRATIONS.LIST_FOLDERS(tenantId, normalizedProvider)
          });
        }

        // Validate required parameters
        if (!tenantId) throw new Error('Tenant ID is required');
        if (!normalizedProvider) throw new Error('Provider is required');
        
        const response = await get<CloudFolderListResponse>(
          api,
          API_PATHS.TENANT.INTEGRATIONS.LIST_FOLDERS(tenantId, normalizedProvider),
          {
            params: {
              parentId,
              search,
              requestId,
            },
          }
        );

        // Debug logging for response
        if (DEBUG) {
          console.info(`[${requestId}] Received response:`, {
            status: response?.status,
            hasData: !!response?.data,
            dataLength: response?.data?.length,
            data: response?.data
          });
        }

        // Handle empty or invalid response
        if (!response || !response.data) {
          console.warn(`[${requestId}] Invalid response structure from ${provider}`, {
            response,
            tenantId,
            parentId,
            search
          });
          return [];
        }

        // Handle empty folder list
        if (response.data.length === 0) {
          console.info(`[${requestId}] No folders found for ${provider}`, {
            tenantId,
            parentId,
            search,
            provider: normalizedProvider
          });
        }

        return response.data;
      } catch (error) {
        const folderError = error as CloudFolderError;
        folderError.requestId = requestId;

        // Enhanced error logging
        if (DEBUG) {
          console.error(`[${requestId}] Folder fetch error details:`, {
            error: folderError,
            errorMessage: folderError.message,
            errorStack: folderError.stack,
            status: folderError.status,
            tenantId,
            provider: normalizedProvider,
            parentId,
            search,
            url: API_PATHS.TENANT.INTEGRATIONS.LIST_FOLDERS(tenantId, normalizedProvider)
          });
        }

        // Check for specific error conditions
        if (folderError.status === 404) {
          console.warn(`[${requestId}] Provider integration not found or not configured:`, {
            provider: normalizedProvider,
            tenantId
          });
        } else if (folderError.status === 401 || folderError.status === 403) {
          console.warn(`[${requestId}] Authentication/Authorization error:`, {
            status: folderError.status,
            provider: normalizedProvider
          });
        }

        throw folderError;
      }
    },
    enabled: !!tenantId && !!provider,
    retry: (failureCount, error) => {
      const shouldRetry = !(
        error.status === 404 || // Not Found
        error.status === 401 || // Unauthorized
        error.status === 403 || // Forbidden
        (error.status && error.status >= 400 && error.status < 500) // Other client errors
      );

      if (DEBUG) {
        console.info(`[${error.requestId}] Retry decision:`, {
          failureCount,
          errorStatus: error.status,
          shouldRetry,
          reason: shouldRetry ? 'Server error' : 'Client error'
        });
      }

      return shouldRetry && failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
}
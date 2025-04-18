import { useQuery } from '@tanstack/react-query';
import { useApi, get } from '../core/api/client';
import { API_PATHS } from '../core/api/paths';
import { IntegrationProvider } from '../types/tenant';

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

  return useQuery<CloudFolder[], CloudFolderError>({
    queryKey,
    queryFn: async () => {
      const requestId = Math.random().toString(36).substring(7);
      try {
        console.info(`[${requestId}] Fetching folders for ${provider}`, { tenantId, parentId, search });
        
        const response = await get<CloudFolderListResponse>(
          api,
          API_PATHS.TENANT.INTEGRATIONS.LIST_FOLDERS(tenantId, provider),
          {
            params: {
              parentId,
              search,
              requestId,
            },
          }
        );

        if (!response.data || response.data.length === 0) {
          console.info(`[${requestId}] No folders found for ${provider}`, { tenantId, parentId, search });
        }

        return response.data;
      } catch (error) {
        const folderError = error as CloudFolderError;
        folderError.requestId = requestId;
        
        console.error(`[${requestId}] Failed to fetch folders for ${provider}`, { 
          tenantId, 
          parentId, 
          search,
          error: folderError
        });
        throw folderError;
      }
    },
    enabled: !!tenantId && !!provider,
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors (client errors)
      if (error.status && error.status >= 400 && error.status < 500) {
        return false;
      }
      // Retry up to 3 times for other errors
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
}
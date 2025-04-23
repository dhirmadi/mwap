import { useApi, get } from '../core/api';
import { API_PATHS } from '../core/api/paths';
import { useQuery } from '@tanstack/react-query';
import { AppError } from '../core/errors';

interface Permission {
  action: string;
  resource: string;
  tenantId: string;
}

interface PermissionResponse {
  permissions: Permission[];
}

/**
 * Hook to check user permissions
 */
export function usePermissions(tenantId: string) {
  const api = useApi();

  const {
    data: permissions,
    isLoading,
    error,
    refetch
  } = useQuery<PermissionResponse, AppError>({
    queryKey: ['permissions', tenantId],
    queryFn: async () => {
      try {
        console.log('Fetching permissions for tenant:', tenantId);
        const response = await get<PermissionResponse>(api, `${API_PATHS.PERMISSIONS.LIST}?tenantId=${tenantId}`, {
          headers: {
            'X-Tenant-ID': tenantId
          }
        });
        console.log('Permissions response:', response);
        return response;
      } catch (error) {
        console.error('Failed to fetch permissions:', {
          error,
          tenantId,
          path: API_PATHS.PERMISSIONS.LIST,
          timestamp: new Date().toISOString()
        });
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    cacheTime: 15 * 60 * 1000, // Keep in cache for 15 minutes
    retry: 2, // Retry failed requests twice
    retryDelay: 1000, // Wait 1 second between retries
  });

  const hasPermission = (action: string, resource: string): boolean => {
    // If error or no permissions data, return false
    if (error || (!isLoading && !permissions)) {
      console.log('Permission check state:', {
        isLoading,
        error: error ? { message: error.message, code: error.code } : null,
        hasPermissions: !!permissions,
        action,
        resource,
        tenantId
      });
      return false;
    }

    // If loading, return null to indicate loading state
    if (isLoading) {
      console.log('Permissions are still loading...', {
        action,
        resource,
        tenantId
      });
      return false;
    }

    const hasPermission = permissions.permissions.some(
      p => p.action === action && 
           p.resource === resource && 
           p.tenantId === tenantId
    );

    console.log('Permission check result:', {
      action,
      resource,
      tenantId,
      hasPermission,
      availablePermissions: permissions.permissions
    });

    return hasPermission;
  };

  const canCreateProject = (): boolean => {
    return hasPermission('create', 'project');
  };

  return {
    permissions,
    isLoading,
    error,
    hasPermission,
    canCreateProject,
    refetch,
    // Expose loading state for better UI handling
    isPermissionLoading: isLoading
  };
}
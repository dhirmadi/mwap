import { useApi, get } from '../core/api';
import { API_PATHS } from '../core/api/paths';
import { useQuery } from '@tanstack/react-query';
import { AppError } from '../core/errors';
import { Permission, PermissionResponse, PERMISSIONS } from '../types/permissions';

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

  /**
   * Type guard to check if the permissions response is valid
   */
  /**
   * Type guard to check if the permissions response is valid
   */
  const isValidPermissionResponse = (data: PermissionResponse | undefined): data is PermissionResponse => {
    return !!data?.data?.permissions && Array.isArray(data.data.permissions);
  };

  /**
   * Check if user has a specific permission
   * @param action - The action to check (e.g., 'create', 'read', 'update', 'delete')
   * @param resource - The resource to check (e.g., 'project', 'tenant')
   * @returns boolean indicating if user has permission
   */
  const hasPermission = (action: string, resource: string): boolean => {
    // Early return if loading or error
    if (isLoading || error) {
      console.log('Permission check state:', {
        isLoading,
        error: error ? { message: error.message, code: error.code } : null,
        action,
        resource,
        tenantId
      });
      return false;
    }

    // Validate permissions data
    if (!isValidPermissionResponse(permissions)) {
      console.warn('Invalid permissions data:', { permissions });
      return false;
    }

    // Check permission
    const hasPermission = permissions.data.permissions.some(
      p => p.action === action && 
           p.resource === resource && 
           p.tenantId === tenantId &&
           p.allowed
    );

    console.log('Permission check result:', {
      action,
      resource,
      tenantId,
      hasPermission,
      availablePermissions: permissions.data.permissions
    });

    return hasPermission;
  };

  const canCreateProject = (): boolean => {
    return hasPermission(PERMISSIONS.PROJECT.CREATE, 'project');
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
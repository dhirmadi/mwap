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
      return await get<PermissionResponse>(api, `${API_PATHS.PERMISSIONS.LIST}?tenantId=${tenantId}`);
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    cacheTime: 15 * 60 * 1000, // Keep in cache for 15 minutes
  });

  const hasPermission = (action: string, resource: string): boolean => {
    if (!permissions) return false;
    return permissions.permissions.some(
      p => p.action === action && 
           p.resource === resource && 
           p.tenantId === tenantId
    );
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
    refetch
  };
}
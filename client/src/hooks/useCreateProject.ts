import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi, post } from '../core/api';
import { AppError, ErrorCode, AuthError } from '../core/errors';
import { API_PATHS } from '../core/api/paths';
import { ProjectResponse, CreateProjectRequest } from '../types';
import { usePermissions } from './usePermissions';

/**
 * Hook for creating new projects
 * Automatically refreshes project list on success
 */
export function useCreateProject(tenantId: string) {
  const api = useApi();
  const queryClient = useQueryClient();

  const {
    mutate: createProject,
    isLoading,
    error
  } = useMutation<ProjectResponse, AppError, CreateProjectRequest>({
    mutationFn: async (request) => {
      // First verify token is valid
      try {
        const token = await api.defaults.headers['Authorization'];
        if (!token) {
          throw new AuthError(ErrorCode.UNAUTHORIZED, 'No valid authentication token');
        }

        // Attempt to create project
        const response = await post<ProjectResponse>(api, API_PATHS.PROJECT.CREATE, {
          ...request,
          tenantId
        }, {
          headers: {
            'X-Tenant-ID': tenantId, // Explicitly set tenant ID in header
            'X-Request-ID': `create-project-${Date.now()}` // Add request tracking
          }
        });
        return response;
      } catch (error: any) {
        if (error?.response?.status === 403) {
          throw new AuthError(
            ErrorCode.FORBIDDEN,
            'You do not have permission to create projects in this tenant. Please contact your administrator.'
          );
        }
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate projects query to trigger refresh
      queryClient.invalidateQueries({
        queryKey: ['tenant', tenantId, 'projects']
      });
    },
    onError: (error) => {
      // Log detailed error information
      console.error('Project creation failed:', {
        error,
        tenantId,
        code: error.code,
        name: error.name,
        message: error.message,
        path: API_PATHS.PROJECT.CREATE,
        timestamp: new Date().toISOString()
      });
    }
  });

  return {
    createProject,
    isLoading,
    error
  };
}
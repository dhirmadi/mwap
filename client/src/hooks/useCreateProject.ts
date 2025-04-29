import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { useApi, post } from '../core/api';
import { AppError, AuthError, ErrorCode } from '../core/errors';
import { API_PATHS } from '../core/api/paths';
import { ProjectResponse, CreateProjectRequest } from '../types';
import { debug } from '../utils/debug';

export function useCreateProject(tenantId: string) {
  const api = useApi();
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  const {
    mutate: createProject,
    isLoading,
    error
  } = useMutation<ProjectResponse, AppError, CreateProjectRequest>({
    mutationFn: async (request) => {
      try {
        // Basic validation
        if (!request?.name || !tenantId) {
          debug.error('Invalid project creation request', { request, tenantId });
          throw new Error('Invalid request data');
        }

        // Perform API call
        const project = await post<ProjectResponse>(
          api,
          API_PATHS.PROJECT.CREATE,
          { ...request, tenantId },
          {
            headers: {
              'X-Tenant-ID': tenantId,
              'X-Request-ID': `create-project-${Date.now()}`
            }
          }
        );

        if (!project?.id) {
          debug.error('Invalid project response', { project });
          throw new Error('Invalid project response');
        }

        debug.info('Project created successfully', { project });
        return project;

      } catch (error: any) {
        debug.group('PROJECT CREATION ERROR');
        debug.error('Error Status:', error?.response?.status);
        debug.error('Error Message:', error?.message);
        debug.error('Error Stack:', error?.stack);
        debug.groupEnd();

        if (error?.response?.status === 403) {
          throw new AuthError(
            ErrorCode.FORBIDDEN,
            'You do not have permission to create projects in this tenant.'
          );
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['tenant', tenantId, 'projects']
      });
    },
    onError: (error) => {
      debug.error('Project creation failed:', {
        error,
        tenantId,
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

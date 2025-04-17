import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi, post } from '../core/api';
import { AppError } from '../core/errors';
import { API_PATHS } from '../core/api/paths';
import { Project, ProjectResponse, CreateProjectRequest } from '../types';

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
      const response = await post<ProjectResponse>(api, API_PATHS.PROJECT.CREATE, {
        ...request,
        tenantId
      });
      return response;
    },
    onSuccess: () => {
      // Invalidate projects query to trigger refresh
      queryClient.invalidateQueries({
        queryKey: ['tenant', tenantId, 'projects']
      });
    }
  });

  return {
    createProject,
    isLoading,
    error
  };
}
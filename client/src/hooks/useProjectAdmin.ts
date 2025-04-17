import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApi, del, patch } from '../core/api';
import { AppError } from '../core/errors';
import { API_PATHS } from '../core/api/paths';
import { Project, ProjectResponse } from '../types';

/**
 * Hook for project administration actions
 * Provides project info and admin actions (archive/delete)
 */
export function useProjectAdmin(projectId: string) {
  const api = useApi();
  const queryClient = useQueryClient();

  const {
    data: project,
    isLoading: isLoadingProject,
    error: projectError
  } = useQuery<Project, AppError>({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const response = await api.get<ProjectResponse>(
        API_PATHS.PROJECT.GET.replace(':id', projectId)
      );
      return response.data;
    }
  });

  const {
    mutate: archiveProject,
    isLoading: isArchiving,
    error: archiveError
  } = useMutation<void, AppError>({
    mutationFn: async () => {
      await patch(api, API_PATHS.PROJECT.UPDATE.replace(':id', projectId), {
        archived: true
      });
    },
    onSuccess: () => {
      // Invalidate project queries to trigger refresh
      queryClient.invalidateQueries({
        queryKey: ['project', projectId]
      });
      queryClient.invalidateQueries({
        queryKey: ['tenant', project?.tenantId, 'projects']
      });
    }
  });

  const {
    mutate: deleteProject,
    isLoading: isDeleting,
    error: deleteError
  } = useMutation<void, AppError>({
    mutationFn: async () => {
      await del(api, API_PATHS.PROJECT.DELETE.replace(':id', projectId));
    },
    onSuccess: () => {
      // Invalidate tenant projects to trigger refresh
      queryClient.invalidateQueries({
        queryKey: ['tenant', project?.tenantId, 'projects']
      });
    }
  });

  return {
    project,
    isLoadingProject,
    projectError,
    archiveProject,
    isArchiving,
    archiveError,
    deleteProject,
    isDeleting,
    deleteError
  };
}
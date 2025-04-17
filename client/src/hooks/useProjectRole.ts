import { useQuery } from '@tanstack/react-query';
import { useApi, get } from '../core/api';
import { AppError } from '../core/errors';
import { API_PATHS } from '../core/api/paths';
import { ProjectRole } from '../types';

/**
 * Query key for project role data
 */
const PROJECT_ROLE_QUERY_KEY = (projectId: string) => ['project', projectId, 'role'] as const;

/**
 * Query configuration for project role data
 */
const PROJECT_ROLE_QUERY_CONFIG = {
  staleTime: 5 * 60 * 1000,  // 5 minutes
  cacheTime: 15 * 60 * 1000  // 15 minutes
} as const;

/**
 * Hook for getting the current user's role in a project
 * Returns undefined if project not found or user has no role
 */
export function useProjectRole(projectId: string) {
  const api = useApi();

  const {
    data: role,
    isLoading,
    error
  } = useQuery<ProjectRole, AppError>({
    queryKey: PROJECT_ROLE_QUERY_KEY(projectId),
    queryFn: async () => {
      const response = await get<{ role: ProjectRole }>(api, API_PATHS.PROJECT.ROLE(projectId));
      return response.data.role;
    },
    ...PROJECT_ROLE_QUERY_CONFIG
  });

  return {
    role,
    isLoading,
    error
  };
}
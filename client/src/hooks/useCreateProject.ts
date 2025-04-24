import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi, post } from '../core/api';
import { AppError, ErrorCode, AuthError } from '../core/errors';
import { API_PATHS } from '../core/api/paths';
import { ProjectResponse, CreateProjectRequest } from '../types';
import { usePermissions } from './usePermissions';
import { debug } from '../utils/debug';

/**
 * Hook for creating new projects
 * Automatically refreshes project list on success
 */
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
      // Debug logging for project creation request
      debug.group('PROJECT CREATION');

      // 1. Current Request Data
      debug.group('Actual Request Data');
      debug.info('Endpoint:', API_PATHS.PROJECT.CREATE);
      debug.info('Method:', 'POST');
      debug.info('Headers:', {
        'Authorization': api.defaults.headers?.['Authorization'] ? 'Bearer [REDACTED]' : 'MISSING',
        'X-Tenant-ID': tenantId,
        'X-Request-ID': `create-project-${Date.now()}`,
        'Content-Type': 'application/json'
      });
      debug.info('Body:', {
        ...request,
        tenantId
      });
      debug.groupEnd();

      // 2. API Expected Format
      debug.group('API Expected Format');
      debug.info('Required Headers:', {
        'Authorization': 'Bearer JWT_TOKEN',
        'X-Tenant-ID': 'Must match: 6808aaf66ed742686ff630b0',
        'Content-Type': 'application/json'
      });
      debug.info('Required Body Format:', {
        name: 'string (required)',
        description: 'string (optional)',
        tenantId: 'string (required, must match X-Tenant-ID header)'
      });
      debug.groupEnd();

      // 3. Authentication Context
      debug.group('Auth & Tenant Context');
      const authHeader = api.defaults.headers?.['Authorization'] as string;
      debug.info('Auth Header Present:', Boolean(authHeader));
      debug.info('Tenant ID Match:', 
        tenantId === '6808aaf66ed742686ff630b0'
      );
      debug.groupEnd();

      // 4. Validation Summary
      debug.group('Request Validation');
      debug.info('Headers Present:', {
        auth: Boolean(api.defaults.headers?.['Authorization']),
        tenantId: Boolean(tenantId),
        contentType: true
      });
      debug.info('Request Body Valid:', {
        hasName: Boolean(request.name),
        hasTenantId: Boolean(tenantId),
        nameLength: request.name?.length
      });
      debug.groupEnd();

      debug.groupEnd();

      // Get auth token before making request
      try {
        const token = await getToken();
        if (!token) {
          throw new AuthError(ErrorCode.UNAUTHORIZED, 'No auth token available');
        }

        // Attempt to create project with auth token
        const response = await post<ProjectResponse>(api, API_PATHS.PROJECT.CREATE, {
          ...request,
          tenantId
        }, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Tenant-ID': tenantId,
            'X-Request-ID': `create-project-${Date.now()}`
          }
        });
        return response;
      } catch (error: any) {
        // Debug logging for error response
        debug.group('PROJECT CREATION - ERROR RESPONSE');
        debug.error('Status:', error?.response?.status);
        debug.error('Error Data:', error?.response?.data);
        debug.error('Request Config:', {
          url: error?.config?.url,
          method: error?.config?.method,
          headers: {
            ...error?.config?.headers,
            'Authorization': error?.config?.headers?.Authorization ? 'Bearer [REDACTED]' : 'MISSING'
          }
        });
        debug.error('Full Error:', {
          name: error?.name,
          message: error?.message,
          code: error?.code,
          stack: error?.stack
        });
        debug.groupEnd();

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
      debug.error('Project creation failed:', {
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
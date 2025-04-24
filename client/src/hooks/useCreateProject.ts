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
      // Debug logging for project creation request
      console.group('[PROJECT CREATION - DEBUG]');

      // 1. Current Request Data
      console.group('Actual Request Data:');
      console.log('Endpoint:', API_PATHS.PROJECT.CREATE);
      console.log('Method:', 'POST');
      console.log('Headers:', {
        'Authorization': api.defaults.headers?.['Authorization'] ? 'Bearer [REDACTED]' : 'MISSING',
        'X-Tenant-ID': tenantId,
        'X-Request-ID': `create-project-${Date.now()}`,
        'Content-Type': 'application/json'
      });
      console.log('Body:', {
        ...request,
        tenantId
      });
      console.groupEnd();

      // 2. API Expected Format
      console.group('API Expected Format:');
      console.log('Required Headers:', {
        'Authorization': 'Bearer JWT_TOKEN',
        'X-Tenant-ID': 'Must match: 6808aaf66ed742686ff630b0',
        'Content-Type': 'application/json'
      });
      console.log('Required Body Format:', {
        name: 'string (required)',
        description: 'string (optional)',
        tenantId: 'string (required, must match X-Tenant-ID header)'
      });
      console.groupEnd();

      // 3. Authentication Context
      console.group('Auth & Tenant Context:');
      const authHeader = api.defaults.headers?.['Authorization'] as string;
      console.log('Auth Header Present:', Boolean(authHeader));
      console.log('Tenant ID Match:', 
        tenantId === '6808aaf66ed742686ff630b0'
      );
      console.groupEnd();

      // 4. Validation Summary
      console.group('Request Validation:');
      console.log('Headers Present:', {
        auth: Boolean(api.defaults.headers?.['Authorization']),
        tenantId: Boolean(tenantId),
        contentType: true
      });
      console.log('Request Body Valid:', {
        hasName: Boolean(request.name),
        hasTenantId: Boolean(tenantId),
        nameLength: request.name?.length
      });
      console.groupEnd();

      console.groupEnd();

      // Attempt to create project - auth token will be added by interceptor
      try {
        const response = await post<ProjectResponse>(api, API_PATHS.PROJECT.CREATE, {
          ...request,
          tenantId
        }, {
          headers: {
            'X-Tenant-ID': tenantId,
            'X-Request-ID': `create-project-${Date.now()}`
          }
        });
        return response;
      } catch (error: any) {
        // Debug logging for error response
        console.group('[PROJECT CREATION - ERROR RESPONSE]');
        console.log('Status:', error?.response?.status);
        console.log('Error Data:', error?.response?.data);
        console.log('Request Config:', {
          url: error?.config?.url,
          method: error?.config?.method,
          headers: {
            ...error?.config?.headers,
            'Authorization': error?.config?.headers?.Authorization ? 'Bearer [REDACTED]' : 'MISSING'
          }
        });
        console.log('Full Error:', {
          name: error?.name,
          message: error?.message,
          code: error?.code,
          stack: error?.stack
        });
        console.groupEnd();

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
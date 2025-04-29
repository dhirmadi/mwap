/**
 * @fileoverview Project submission hook
 * @module hooks/useProjectSubmission
 */

import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProjectFormData } from '../components/tenant/project-creation/types';
import { useCreateProject } from './useCreateProject';
import { handleProjectError, showSuccessNotification } from '../utils/project/errors';
import { createProjectPayload } from '../utils/project/transforms';
import { debug } from '../utils/debug';

/**
 * Project submission hook
 * @param tenantId - ID of the tenant where the project will be created
 */
export function useProjectSubmission(tenantId: string) {
  const navigate = useNavigate();
  const { createProject } = useCreateProject(tenantId);

  const submit = useCallback(async (data: ProjectFormData) => {
    try {
      // Create project payload with validation
      const payload = createProjectPayload(data, tenantId);
      if (!payload) {
        debug.error('Failed to create project payload', { data, tenantId });
        throw new Error('Invalid project payload');
      }

      // Log submission attempt
      debug.info('Submitting project creation:', {
        payload,
        tenantId,
        provider: data.provider
      });

      // Attempt to create project
      const response = await createProject(payload);
      
      // Validate response
      if (!response || !response.data) {
        debug.error('Empty project response');
        throw new Error('Project creation failed - empty response');
      }
      
      if (!response.data.id) {
        debug.error('Invalid project response - missing ID', { response });
        throw new Error('Project creation failed - invalid response');
      }

      // Show success and navigate
      showSuccessNotification();
      navigate(`/projects/${response.data.id}`);
      
      return response.data;
    } catch (error) {
      debug.error('Project submission failed:', {
        error,
        data,
        tenantId
      });
      handleProjectError(error);
      return null;
    }
  }, [createProject, navigate, tenantId]);

  return {
    submit
  };
}
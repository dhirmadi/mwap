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
        throw new Error('Invalid project payload');
      }

      // Attempt to create project
      const response = await createProject(payload);
      if (!response || !response.id) {
        throw new Error('Invalid project response');
      }

      // Show success and navigate
      showSuccessNotification();
      navigate(`/projects/${response.id}`);
      
      return response;
    } catch (error) {
      handleProjectError(error);
      return null;
    }
  }, [createProject, navigate, tenantId]);

  return {
    submit
  };
}
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
 */
export function useProjectSubmission() {
  const navigate = useNavigate();
  const { createProject } = useCreateProject();

  const submit = useCallback(async (data: ProjectFormData) => {
    try {
      const payload = createProjectPayload(data, 'default');
      const project = await createProject(payload);
      
      showSuccessNotification();
      navigate(`/projects/${project.id}`);
      
      return project;
    } catch (error) {
      handleProjectError(error);
      return null;
    }
  }, [createProject, navigate]);

  return {
    submit
  };
}
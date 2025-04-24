/**
 * @fileoverview Project data transformation utilities
 * @module utils/project/transforms
 */

import { ProjectFormData } from '../../components/tenant/project-creation/types';

/**
 * Creates project request payload from form data
 */
export function createProjectPayload(data: ProjectFormData, tenantId: string) {
  return {
    name: data.name,
    description: `Project using ${data.provider} at ${data.folderPath}`,
    provider: data.provider,
    folderPath: data.folderPath,
    tenantId
  };
}

/**
 * Formats project data for display
 */
export function formatProjectData(data: ProjectFormData) {
  return {
    name: data.name,
    provider: data.provider,
    location: data.folderPath
  };
}
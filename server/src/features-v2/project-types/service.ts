/**
 * This module uses core-v2 only
 */

import type { ProjectType } from './model';

export class ProjectTypeService {
  async createProjectType(data: Partial<ProjectType>): Promise<ProjectType> {
    throw new Error('Not implemented');
  }

  async getProjectType(id: string): Promise<ProjectType> {
    throw new Error('Not implemented');
  }

  async updateProjectType(id: string, data: Partial<ProjectType>): Promise<ProjectType> {
    throw new Error('Not implemented');
  }

  async deleteProjectType(id: string): Promise<void> {
    throw new Error('Not implemented');
  }

  async listProjectTypes(includeInactive = false): Promise<ProjectType[]> {
    throw new Error('Not implemented');
  }

  async activateProjectType(id: string): Promise<ProjectType> {
    throw new Error('Not implemented');
  }

  async deactivateProjectType(id: string): Promise<ProjectType> {
    throw new Error('Not implemented');
  }
}

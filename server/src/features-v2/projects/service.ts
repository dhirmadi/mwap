/**
 * This module uses core-v2 only
 */

import type { Project } from './model';

export class ProjectService {
  async createProject(data: Partial<Project>): Promise<Project> {
    throw new Error('Not implemented');
  }

  async getProject(id: string): Promise<Project> {
    throw new Error('Not implemented');
  }

  async updateProject(id: string, data: Partial<Project>): Promise<Project> {
    throw new Error('Not implemented');
  }

  async deleteProject(id: string): Promise<void> {
    throw new Error('Not implemented');
  }

  async listProjects(tenantId: string): Promise<Project[]> {
    throw new Error('Not implemented');
  }

  async archiveProject(id: string): Promise<Project> {
    throw new Error('Not implemented');
  }

  async restoreProject(id: string): Promise<Project> {
    throw new Error('Not implemented');
  }
}

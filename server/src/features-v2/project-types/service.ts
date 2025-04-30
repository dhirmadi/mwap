import type { ProjectTypes } from './model';

export class ProjectTypesService {
  async createProjectTypes(data: Partial<ProjectTypes>): Promise<ProjectTypes> {
    throw new Error('Not implemented');
  }

  async getProjectTypes(id: string): Promise<ProjectTypes> {
    throw new Error('Not implemented');
  }

  async updateProjectTypes(id: string, data: Partial<ProjectTypes>): Promise<ProjectTypes> {
    throw new Error('Not implemented');
  }

  async deleteProjectTypes(id: string): Promise<void> {
    throw new Error('Not implemented');
  }

  async listProjectTypess(): Promise<ProjectTypes[]> {
    throw new Error('Not implemented');
  }
}

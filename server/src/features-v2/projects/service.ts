import type { Projects } from './model';

export class ProjectsService {
  async createProjects(data: Partial<Projects>): Promise<Projects> {
    throw new Error('Not implemented');
  }

  async getProjects(id: string): Promise<Projects> {
    throw new Error('Not implemented');
  }

  async updateProjects(id: string, data: Partial<Projects>): Promise<Projects> {
    throw new Error('Not implemented');
  }

  async deleteProjects(id: string): Promise<void> {
    throw new Error('Not implemented');
  }

  async listProjectss(): Promise<Projects[]> {
    throw new Error('Not implemented');
  }
}

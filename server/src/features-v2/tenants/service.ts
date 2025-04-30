import type { Tenant } from './model';

export class TenantService {
  async createTenant(data: Partial<Tenant>): Promise<Tenant> {
    throw new Error('Not implemented');
  }

  async getTenant(id: string): Promise<Tenant> {
    throw new Error('Not implemented');
  }

  async updateTenant(id: string, data: Partial<Tenant>): Promise<Tenant> {
    throw new Error('Not implemented');
  }

  async deleteTenant(id: string): Promise<void> {
    throw new Error('Not implemented');
  }

  async listTenants(ownerId: string): Promise<Tenant[]> {
    throw new Error('Not implemented');
  }
}
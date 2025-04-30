import type { Invites } from './model';

export class InvitesService {
  async createInvites(data: Partial<Invites>): Promise<Invites> {
    throw new Error('Not implemented');
  }

  async getInvites(id: string): Promise<Invites> {
    throw new Error('Not implemented');
  }

  async updateInvites(id: string, data: Partial<Invites>): Promise<Invites> {
    throw new Error('Not implemented');
  }

  async deleteInvites(id: string): Promise<void> {
    throw new Error('Not implemented');
  }

  async listInvitess(): Promise<Invites[]> {
    throw new Error('Not implemented');
  }
}

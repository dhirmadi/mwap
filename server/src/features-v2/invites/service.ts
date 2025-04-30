/**
 * This module uses core-v2 only
 */

import type { Invite } from './model';

export class InviteService {
  async createInvite(data: Partial<Invite>): Promise<Invite> {
    throw new Error('Not implemented');
  }

  async getInvite(id: string): Promise<Invite> {
    throw new Error('Not implemented');
  }

  async updateInvite(id: string, data: Partial<Invite>): Promise<Invite> {
    throw new Error('Not implemented');
  }

  async deleteInvite(id: string): Promise<void> {
    throw new Error('Not implemented');
  }

  async listInvites(projectId: string): Promise<Invite[]> {
    throw new Error('Not implemented');
  }

  async acceptInvite(id: string): Promise<Invite> {
    throw new Error('Not implemented');
  }

  async rejectInvite(id: string): Promise<Invite> {
    throw new Error('Not implemented');
  }

  async resendInvite(id: string): Promise<Invite> {
    throw new Error('Not implemented');
  }

  async revokeInvite(id: string): Promise<Invite> {
    throw new Error('Not implemented');
  }
}

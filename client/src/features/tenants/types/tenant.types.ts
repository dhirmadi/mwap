export type TenantRole = 'admin' | 'deputy' | 'contributor';

export interface Member {
  userId: string;
  name: string;
  email: string;
  role: TenantRole;
}

export interface InviteCodeResponse {
  code: string;
  role: Exclude<TenantRole, 'admin'>;
  expiresAt: string;
}

export interface CreateInviteRequest {
  role: Exclude<TenantRole, 'admin'>;
  expiresInHours?: number;
}

export interface Tenant {
  tenantId: string;
  name: string;
  role: UserRole;
}

export interface TenantJoinResponse {
  message: string;
  tenant: Tenant;
}

export interface TenantRequestResponse {
  message: string;
  tenant: {
    id: string;
    name: string;
    status: 'pending' | 'active' | 'archived';
  };
}
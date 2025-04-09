// Common types
export type TenantRole = 'admin' | 'deputy' | 'contributor';
export type TenantStatus = 'active' | 'pending' | 'archived';

// User and tenant interfaces
export interface Tenant {
  tenantId: string;
  name: string;
  role: TenantRole;
  status: TenantStatus;
}

export interface UserProfile {
  email: string;
  name: string;
  picture: string;
  isSuperAdmin: boolean;
  tenants: Tenant[];
}

// Member management
export interface Member {
  userId: string;
  name: string;
  email: string;
  role: TenantRole;
}

// Invite management
export interface InviteCodeResponse {
  code: string;
  role: Exclude<TenantRole, 'admin'>;
  expiresAt: string;
}

export interface CreateInviteRequest {
  role: Exclude<TenantRole, 'admin'>;
  expiresInHours?: number;
}

// API responses
export interface TenantJoinResponse {
  message: string;
  tenant: Tenant;
}

export interface TenantRequestResponse {
  message: string;
  tenant: {
    id: string;
    name: string;
    status: TenantStatus;
  };
}
import { SuccessResponse } from '@core/types/responses';
import { TenantRole } from '@core/types/auth';

// Base tenant interfaces
export interface Tenant {
  id: string;
  name: string;
  ownerId: string;
  settings?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface TenantMember {
  userId: string;
  role: TenantRole;
  joinedAt: Date;
}

// Request types
export interface CreateTenantRequest {
  name: string;
  settings?: Record<string, unknown>;
}

export interface UpdateTenantRequest {
  name?: string;
  settings?: Record<string, unknown>;
}

export interface UpdateTenantMemberRequest {
  role: TenantRole;
}

// Integration types
export type IntegrationProvider = string;

export interface Integration {
  provider: IntegrationProvider;
  token: string;
  refreshToken?: string;
  expiresAt?: Date;
  connectedAt: Date;
  lastRefreshedAt?: Date;
  tenantId?: string;
  capabilities?: string[];
  settings?: {
    quotaLimits?: {
      requestsPerMinute?: number;
      storageLimit?: number;
    };
    scopes?: string[];
    customConfig?: Record<string, unknown>;
  };
}

export interface AddIntegrationRequest {
  provider: IntegrationProvider;
  token: string;
  refreshToken?: string;
  expiresAt?: Date;
  settings?: {
    quotaLimits?: {
      requestsPerMinute?: number;
      storageLimit?: number;
    };
    scopes?: string[];
    customConfig?: Record<string, unknown>;
  };
}

// Response types
export type TenantResponse = SuccessResponse<Tenant>;
export type TenantListResponse = SuccessResponse<Tenant[]>;
export type TenantMemberResponse = SuccessResponse<TenantMember>;
export type TenantMemberListResponse = SuccessResponse<TenantMember[]>;
export type IntegrationListResponse = SuccessResponse<Integration[]>;

// Query types
export interface TenantQueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
}
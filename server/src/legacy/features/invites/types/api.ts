/** @deprecated Use equivalent functionality from v2 modules instead. This module will be removed in a future release. */

import { SuccessResponse } from '@core/types/responses';
import { TenantRole } from '@core/types/auth';

// Base invite interface
export interface Invite {
  code: string;
  email: string;
  tenantId: string;
  role: TenantRole;
  expiresAt: Date;
  createdBy: string;
  createdAt: Date;
  used: boolean;
}

// Request types
export interface CreateInviteRequest {
  email: string;
  role: TenantRole;
}

export interface AcceptInviteRequest {
  code: string;
}

// Response types
export type InviteResponse = SuccessResponse<Invite>;
export type InviteListResponse = SuccessResponse<Invite[]>;
export type InviteValidationResponse = SuccessResponse<{
  valid: boolean;
  invite?: Invite;
}>;

// Query types
export interface InviteQueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  used?: boolean;
  expired?: boolean;
}
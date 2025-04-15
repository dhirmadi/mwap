import { SuccessResponse } from '../common/responses';

/**
 * Tenant role enumeration
 * Defines possible roles a user can have in a tenant
 */
export enum TenantRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER'
}

/**
 * Tenant information
 */
export interface Tenant {
  readonly id: string;
  readonly name: string;
  readonly ownerId: string;
  readonly settings?: Record<string, unknown>;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/**
 * Request to create a new tenant
 */
export interface CreateTenantRequest {
  readonly name: string;
  readonly settings?: Record<string, unknown>;
}

/**
 * Request to update an existing tenant
 */
export interface UpdateTenantRequest {
  readonly name?: string;
  readonly settings?: Record<string, unknown>;
}

/**
 * Tenant member information
 */
export interface TenantMember {
  readonly userId: string;
  readonly role: TenantRole;
  readonly joinedAt: string;
}

/**
 * Response types
 */
export type TenantResponse = SuccessResponse<Tenant>;
export type TenantListResponse = SuccessResponse<Tenant[]>;
export type TenantMemberResponse = SuccessResponse<TenantMember>;
export type TenantMemberListResponse = SuccessResponse<TenantMember[]>;
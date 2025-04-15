import { SuccessResponse } from '../common/responses';
import { ProjectRole } from '../project';

/**
 * Invite information
 */
export interface Invite {
  readonly id: string;
  readonly code: string;
  readonly projectId: string;
  readonly role: ProjectRole;
  readonly createdBy: string;
  readonly expiresAt: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/**
 * Request to create a new invite
 */
export interface CreateInviteRequest {
  readonly projectId: string;
  readonly role: ProjectRole;
  readonly expiresIn?: number; // seconds
}

/**
 * Request to redeem an invite
 */
export interface RedeemInviteRequest {
  readonly code: string;
}

/**
 * Response when redeeming an invite
 */
export interface RedeemInviteResponse {
  readonly projectId: string;
  readonly projectName: string;
  readonly role: ProjectRole;
}

/**
 * Response types
 */
export type InviteResponse = SuccessResponse<Invite>;
export type InviteListResponse = SuccessResponse<Invite[]>;
export type RedeemResponse = SuccessResponse<RedeemInviteResponse>;
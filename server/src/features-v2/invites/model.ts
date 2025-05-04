/**
 * This module uses core-v2 only
 */

import { z } from 'zod';

export const ProjectRoleSchema = z.enum(['OWNER', 'DEPUTY', 'MEMBER']);
export type ProjectRole = z.infer<typeof ProjectRoleSchema>;

export const InviteSchema = z.object({
  id: z.string().uuid(),
  code: z.string().min(8).max(12),
  projectId: z.string().uuid(),
  tenantId: z.string().uuid(),
  role: ProjectRoleSchema,
  createdBy: z.string(),
  createdAt: z.date(),
  expiresAt: z.date(),
});

export type Invite = z.infer<typeof InviteSchema>;

// Request validation schemas
export const CreateInviteSchema = InviteSchema.omit({
  id: true,
  code: true,
  createdAt: true,
  expiresAt: true,
});

// Response DTOs
export interface InviteDTO {
  code: string;
  role: ProjectRole;
  createdAt: Date;
  expiresAt: Date;
}

export interface RedeemDTO {
  projectId: string;
  role: ProjectRole;
}

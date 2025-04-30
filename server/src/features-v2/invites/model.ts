/**
 * This module uses core-v2 only
 */

import { z } from 'zod';

export const InviteSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  role: z.enum(['admin', 'deputy', 'contributor']),
  projectId: z.string().uuid(),
  status: z.enum(['pending', 'accepted', 'rejected', 'expired']),
  expiresAt: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Invite = z.infer<typeof InviteSchema>;

// Request validation schemas
export const CreateInviteSchema = InviteSchema.omit({
  id: true,
  status: true,
  expiresAt: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateInviteSchema = InviteSchema.partial().omit({
  id: true,
  projectId: true,
  createdAt: true,
  updatedAt: true,
});

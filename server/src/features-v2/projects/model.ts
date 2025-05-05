/**
 * This module uses core-v2 only
 */

import { z } from 'zod';
import { UserIdentity } from '../../core-v2/auth/userIdentity';

// Custom Zod validator for Auth0 user ID
const auth0IdSchema = z.string().refine(
  (id) => UserIdentity.validate(id), 
  { message: 'Invalid Auth0 user identifier' }
);

export const ProjectSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  ownerId: auth0IdSchema,
  tenantId: z.string().uuid(),
  typeId: z.string().uuid(),
  status: z.enum(['active', 'archived', 'deleted']),
  storageProvider: z.enum(['dropbox', 'gdrive', 'box', 'onedrive']),
  storagePath: z.string(),
  members: z.array(z.object({
    userId: auth0IdSchema,
    role: z.enum(['OWNER', 'DEPUTY', 'MEMBER']),
    joinedAt: z.date()
  })).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Project = z.infer<typeof ProjectSchema>;

// Request validation schemas
export const CreateProjectSchema = ProjectSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateProjectSchema = ProjectSchema.partial().omit({
  id: true,
  tenantId: true,
  createdAt: true,
  updatedAt: true,
});

// List response DTO
export const ProjectListItemSchema = ProjectSchema.pick({
  id: true,
  name: true,
  typeId: true,
  createdAt: true,
});

export type ProjectListItem = z.infer<typeof ProjectListItemSchema>;

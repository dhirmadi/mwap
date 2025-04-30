/**
 * This module uses core-v2 only
 */

import { z } from 'zod';

export const ProjectSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  tenantId: z.string().uuid(),
  typeId: z.string().uuid(),
  status: z.enum(['active', 'archived', 'deleted']),
  storageProvider: z.enum(['dropbox', 'gdrive', 'box', 'onedrive']),
  storagePath: z.string(),
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

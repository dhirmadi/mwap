/**
 * This module uses core-v2 only
 */

import { z } from 'zod';

export const TenantSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2).max(100),
  ownerId: z.string(),
  status: z.enum(['active', 'inactive', 'archived']),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Tenant = z.infer<typeof TenantSchema>;

// Request validation schemas
export const CreateTenantSchema = TenantSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateTenantSchema = TenantSchema.partial().omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

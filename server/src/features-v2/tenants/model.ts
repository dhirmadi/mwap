import { z } from 'zod';

export const TenantSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2).max(100),
  ownerId: z.string(),
  settings: z.object({
    allowedProviders: z.array(z.string()),
    maxProjects: z.number().int().positive(),
    features: z.record(z.boolean()),
  }).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Tenant = z.infer<typeof TenantSchema>;

// Request validation schemas
export const CreateTenantSchema = TenantSchema.omit({
  id: true,
  ownerId: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateTenantSchema = TenantSchema.partial().omit({
  id: true,
  ownerId: true,
  createdAt: true,
  updatedAt: true,
});
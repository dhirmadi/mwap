import { z } from 'zod';

export const createTenantSchema = z.object({
  body: z.object({
    name: z.string()
      .min(2, 'Tenant name must be at least 2 characters long')
      .max(100, 'Tenant name cannot exceed 100 characters')
      .trim()
  })
});

export const updateTenantSchema = z.object({
  body: z.object({
    name: z.string()
      .min(2, 'Tenant name must be at least 2 characters long')
      .max(100, 'Tenant name cannot exceed 100 characters')
      .trim()
      .optional()
  }),
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid tenant ID')
  })
});
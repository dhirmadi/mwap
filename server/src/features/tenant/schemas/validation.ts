import { z } from 'zod';

export const createTenantSchema = z.object({
  name: z.string()
    .min(2, 'Tenant name must be at least 2 characters long')
    .max(100, 'Tenant name cannot exceed 100 characters')
    .trim()
});

export const updateTenantSchema = z.object({
  name: z.string()
    .min(2, 'Tenant name must be at least 2 characters long')
    .max(100, 'Tenant name cannot exceed 100 characters')
    .trim()
    .optional()
});

export const tenantIdSchema = z.object({
  params: z.object({
    id: z.string()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid tenant ID')
  })
});

export const addIntegrationSchema = z.object({
  body: z.object({
    provider: z.enum(['gdrive', 'dropbox', 'box', 'onedrive'], {
      errorMap: () => ({ message: 'Provider must be one of: gdrive, dropbox, box, onedrive' })
    }),
    token: z.string()
      .min(1, 'Integration token is required')
      .max(1000, 'Integration token is too long')
  })
});
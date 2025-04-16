import { z } from 'zod';

/**
 * Schema for creating a tenant
 */
export const createTenantSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(3, 'Name must be at least 3 characters')
      .max(50, 'Name must be at most 50 characters')
      .regex(
        /^[a-zA-Z0-9\s\-_]+$/,
        'Name can only contain letters, numbers, spaces, hyphens and underscores'
      )
      .transform(val => val.trim())
  })
});

/**
 * Schema for updating a tenant
 */
export const updateTenantSchema = z.object({
  params: z.object({
    id: z
      .string()
      .regex(
        /^[0-9a-fA-F]{24}$/,
        'Invalid tenant ID format'
      )
  }),
  body: z.object({
    name: z
      .string()
      .min(3, 'Name must be at least 3 characters')
      .max(50, 'Name must be at most 50 characters')
      .regex(
        /^[a-zA-Z0-9\s\-_]+$/,
        'Name can only contain letters, numbers, spaces, hyphens and underscores'
      )
      .transform(val => val.trim())
      .optional(),
    archived: z
      .boolean()
      .optional()
  })
  .refine(
    data => data.name || typeof data.archived === 'boolean',
    'At least one of name or archived must be provided'
  )
});
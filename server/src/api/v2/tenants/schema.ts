import { z } from 'zod';

export const TenantCreateSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name cannot exceed 100 characters')
    .trim()
});

export const TenantUpdateSchema = TenantCreateSchema;

export type TenantCreate = z.infer<typeof TenantCreateSchema>;
export type TenantUpdate = z.infer<typeof TenantUpdateSchema>;
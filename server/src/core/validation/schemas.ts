import { z } from 'zod';
import { ProjectRole } from '@features/projects/types/roles';
import { TenantRole } from '@core/types/auth';

// Base schemas for common fields
const idSchema = z.string().uuid();
const timestampSchema = z.date();
const emailSchema = z.string().email();
const nameSchema = z.string().min(1).max(100);

// User schema
export const userSchema = z.object({
  id: idSchema,
  email: emailSchema,
  roles: z.array(z.string()),
  tenantId: z.string().optional(),
  sub: z.string(),
});

// User profile schema
export const userProfileSchema = z.object({
  id: idSchema,
  email: emailSchema,
  name: nameSchema,
  picture: z.string().url(),
  roles: z.array(z.string()),
  tenantId: z.string().optional(),
});

// Project schema
export const projectSchema = z.object({
  id: idSchema,
  name: nameSchema,
  description: z.string().max(1000).optional(),
  tenantId: z.string(),
  createdBy: z.string(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
  archived: z.boolean(),
});

// Project member schema
export const projectMemberSchema = z.object({
  userId: z.string(),
  role: z.nativeEnum(ProjectRole),
  joinedAt: timestampSchema,
});

// Project update schema
export const projectUpdateSchema = z.object({
  name: nameSchema.optional(),
  description: z.string().max(1000).optional(),
  archived: z.boolean().optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: "At least one field must be provided for update"
});

// Tenant schema
export const tenantSchema = z.object({
  id: idSchema,
  name: nameSchema,
  ownerId: z.string(),
  settings: z.record(z.unknown()).optional(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

// Tenant member schema
export const tenantMemberSchema = z.object({
  userId: z.string(),
  role: z.nativeEnum(TenantRole),
  joinedAt: timestampSchema,
});

// Tenant update schema
export const tenantUpdateSchema = z.object({
  name: nameSchema.optional(),
  settings: z.record(z.unknown()).optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: "At least one field must be provided for update"
});

// Invite schema
export const inviteSchema = z.object({
  code: z.string(),
  email: emailSchema,
  tenantId: z.string(),
  role: z.nativeEnum(TenantRole),
  expiresAt: timestampSchema,
  createdBy: z.string(),
  createdAt: timestampSchema,
  used: z.boolean(),
});

// API request schemas
export const createProjectRequestSchema = z.object({
  name: nameSchema,
  description: z.string().max(1000).optional(),
});

export const updateProjectRequestSchema = projectUpdateSchema;

export const createTenantRequestSchema = z.object({
  name: nameSchema,
  settings: z.record(z.unknown()).optional(),
});

export const updateTenantRequestSchema = tenantUpdateSchema;

export const createInviteRequestSchema = z.object({
  email: emailSchema,
  role: z.nativeEnum(TenantRole),
});

// Pagination query schema
export const paginationQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc'] as const).optional(),
}).refine(
  data => {
    if (data.page !== undefined && data.page < 1) return false;
    if (data.limit !== undefined && (data.limit < 1 || data.limit > 100)) return false;
    return true;
  },
  {
    message: "Invalid pagination parameters. Page must be >= 1, limit must be between 1 and 100"
  }
);
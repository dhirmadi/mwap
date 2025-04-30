import { z } from 'zod';
import { MWAP_ROLES } from '../middleware-v2/auth/roles';

// Common schema parts
const nameSchema = z.string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name cannot exceed 100 characters')
  .trim();

const slugSchema = z.string()
  .min(3, 'Slug must be at least 3 characters')
  .max(50, 'Slug cannot exceed 50 characters')
  .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
  .trim();

const emailSchema = z.string()
  .email('Invalid email address')
  .toLowerCase()
  .trim();

// Tenant creation schema
export const createTenantSchema = z.object({
  name: nameSchema,
  slug: slugSchema,
  settings: z.object({
    allowExternalSharing: z.boolean().default(false),
    maxProjects: z.number().int().positive().default(5),
    storageProviders: z.array(z.enum(['dropbox', 'gdrive', 'onedrive', 'box']))
      .min(1, 'At least one storage provider is required'),
  }).strict(),
}).strict();

export type CreateTenantInput = z.infer<typeof createTenantSchema>;

// Project creation schema
export const createProjectSchema = z.object({
  name: nameSchema,
  slug: slugSchema,
  description: z.string().max(500).optional(),
  settings: z.object({
    storageProvider: z.enum(['dropbox', 'gdrive', 'onedrive', 'box']),
    visibility: z.enum(['private', 'team', 'public']).default('private'),
    tags: z.array(z.string().max(30)).max(10).default([]),
  }).strict(),
  members: z.array(z.object({
    email: emailSchema,
    role: z.enum([MWAP_ROLES.OWNER, MWAP_ROLES.DEPUTY, MWAP_ROLES.MEMBER]),
  })).min(1, 'At least one member is required'),
}).strict();

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

// Invite redemption schema
export const inviteRedeemSchema = z.object({
  inviteToken: z.string().min(1, 'Invite token is required'),
  userData: z.object({
    firstName: nameSchema,
    lastName: nameSchema,
    email: emailSchema,
    password: z.string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    acceptedTerms: z.literal(true, {
      errorMap: () => ({ message: 'You must accept the terms and conditions' }),
    }),
  }).strict(),
}).strict();

export type InviteRedeemInput = z.infer<typeof inviteRedeemSchema>;
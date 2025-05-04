/**
 * This module uses core-v2 only
 */

import { z } from 'zod';

// Schema for project type configuration
export const ProjectTypeSchemaSchema = z.object({
  fields: z.array(
    z.object({
      name: z.string(),
      type: z.enum(['text', 'number', 'boolean', 'select', 'multi-select']),
      label: z.string(),
      required: z.boolean().default(false),
      options: z.array(z.string()).optional(),
      defaultValue: z.any().optional(),
      validation: z.object({
        min: z.number().optional(),
        max: z.number().optional(),
        pattern: z.string().optional(),
      }).optional(),
    })
  ),
  display: z.object({
    icon: z.string().optional(),
    color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
    layout: z.enum(['default', 'compact', 'full']).default('default'),
  }).optional(),
  behavior: z.object({
    allowMultiple: z.boolean().default(true),
    requireApproval: z.boolean().default(false),
    autoArchive: z.boolean().default(false),
  }).optional(),
});

export const ProjectTypeSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2).max(50),
  description: z.string().min(10).max(500),
  schema: ProjectTypeSchemaSchema,
  active: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ProjectType = z.infer<typeof ProjectTypeSchema>;
export type ProjectTypeSchema = z.infer<typeof ProjectTypeSchemaSchema>;

// Request validation schemas
export const CreateProjectTypeSchema = ProjectTypeSchema.omit({
  id: true,
  active: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateProjectTypeSchema = ProjectTypeSchema.partial().omit({
  id: true,
  name: true,
  createdAt: true,
  updatedAt: true,
});

// Response DTOs
export interface ProjectTypeDTO {
  id: string;
  name: string;
  description: string;
  schema: ProjectTypeSchema;
  active: boolean;
  createdAt: Date;
}

/**
 * This module uses core-v2 only
 */

import { z } from 'zod';

export const ProjectTypeSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  icon: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  isActive: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ProjectType = z.infer<typeof ProjectTypeSchema>;

// Request validation schemas
export const CreateProjectTypeSchema = ProjectTypeSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateProjectTypeSchema = ProjectTypeSchema.partial().omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

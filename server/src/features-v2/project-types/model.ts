import { z } from 'zod';

export const ProjectTypesSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2).max(100),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ProjectTypes = z.infer<typeof ProjectTypesSchema>;

// Request validation schemas
export const CreateProjectTypesSchema = ProjectTypesSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateProjectTypesSchema = ProjectTypesSchema.partial().omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

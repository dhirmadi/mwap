import { z } from 'zod';

export const ProjectsSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2).max(100),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Projects = z.infer<typeof ProjectsSchema>;

// Request validation schemas
export const CreateProjectsSchema = ProjectsSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateProjectsSchema = ProjectsSchema.partial().omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

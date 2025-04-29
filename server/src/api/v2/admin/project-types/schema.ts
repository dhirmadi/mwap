import { z } from 'zod';

const kebabCaseRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const urlRegex = /^https?:\/\/.+/;

export const ProjectTypeCreateSchema = z.object({
  projectTypeId: z
    .string()
    .min(1, 'Project type ID is required')
    .regex(kebabCaseRegex, 'Project type ID must be in kebab-case format'),
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name cannot exceed 100 characters'),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(500, 'Description cannot exceed 500 characters'),
  iconUrl: z
    .string()
    .regex(urlRegex, 'Icon URL must be a valid URL')
    .optional(),
  configSchema: z
    .record(z.unknown())
    .optional()
});

export const ProjectTypeUpdateSchema = ProjectTypeCreateSchema.partial();

export type ProjectTypeCreate = z.infer<typeof ProjectTypeCreateSchema>;
export type ProjectTypeUpdate = z.infer<typeof ProjectTypeUpdateSchema>;
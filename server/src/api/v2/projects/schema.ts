import { z } from 'zod';
import { Types } from 'mongoose';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const ProjectCreateSchema = z.object({
  name: z
    .string()
    .min(1, 'Project name is required')
    .max(100, 'Name cannot exceed 100 characters')
    .trim(),
  tenantId: z
    .string()
    .regex(objectIdRegex, 'Invalid tenant ID format'),
  projectTypeId: z
    .string()
    .min(1, 'Project type is required'),
  cloudProvider: z
    .string()
    .min(1, 'Cloud provider is required'),
  folderId: z
    .string()
    .min(1, 'Folder ID is required'),
  folderPath: z
    .string()
    .optional()
});

export const ProjectUpdateSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name cannot exceed 100 characters')
    .trim()
});

export type ProjectCreate = z.infer<typeof ProjectCreateSchema> & {
  tenantId: Types.ObjectId;
};
export type ProjectUpdate = z.infer<typeof ProjectUpdateSchema>;
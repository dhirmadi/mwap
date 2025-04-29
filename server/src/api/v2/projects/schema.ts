import { z } from 'zod';

export const ProjectCreateSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  cloudProvider: z.string().min(1, 'Cloud provider is required'),
  folderId: z.string().min(1, 'Folder ID is required'),
  projectTypeId: z.string().min(1, 'Project type is required'),
});

export type ProjectCreateInput = z.infer<typeof ProjectCreateSchema>;
export type ProjectCreateError = z.inferFormattedError<typeof ProjectCreateSchema>;
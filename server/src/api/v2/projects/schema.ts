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

export const ProjectRole = z.enum(['OWNER', 'DEPUTY', 'MEMBER']);
export type ProjectRole = z.infer<typeof ProjectRole>;

export const PROJECT_ROLE_HIERARCHY: Record<ProjectRole, number> = {
  'OWNER': 3,
  'DEPUTY': 2,
  'MEMBER': 1
};

export const UpdateMemberRoleSchema = z.object({
  role: ProjectRole
});

export type UpdateMemberRoleRequest = z.infer<typeof UpdateMemberRoleSchema>;

export const AddMemberSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  role: ProjectRole
});

export const ProjectMemberResponse = z.object({
  userId: z.string(),
  role: ProjectRole,
  joinedAt: z.date(),
  addedBy: z.string()
});

export const ProjectMemberSchema = z.object({
  userId: z.string(),
  role: ProjectRole,
  joinedAt: z.date(),
  addedBy: z.string()
});

export type ProjectCreate = z.infer<typeof ProjectCreateSchema> & {
  tenantId: Types.ObjectId;
  members?: {
    userId: Types.ObjectId;
    role: ProjectRole;
    joinedAt: Date;
    addedBy: Types.ObjectId;
  }[];
};
export type ProjectUpdate = z.infer<typeof ProjectUpdateSchema>;
export type AddMemberRequest = z.infer<typeof AddMemberSchema>;
export type ProjectMemberResponse = z.infer<typeof ProjectMemberResponse>;
export type ProjectMember = z.infer<typeof ProjectMemberSchema>;
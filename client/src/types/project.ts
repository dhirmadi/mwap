import { User } from './auth/user';

/**
 * Project role types
 */
export enum ProjectRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
  VIEWER = 'viewer'
}

/**
 * Project member information
 */
export interface ProjectMember {
  user: User;
  role: ProjectRole;
  joinedAt: string;
}

/**
 * Project information
 */
export interface Project {
  id: string;
  name: string;
  description?: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
  members: ProjectMember[];
}

/**
 * Project list response
 */
export interface ProjectListResponse {
  data: Project[];
}

/**
 * Project response
 */
export interface ProjectResponse {
  data: Project;
}

/**
 * Create project request
 */
export interface CreateProjectRequest {
  name: string;
  description?: string;
  tenantId: string;
  provider: 'GDRIVE' | 'DROPBOX' | 'BOX' | 'ONEDRIVE';
  folderPath: string;
}
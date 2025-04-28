import { SuccessResponse } from '../common/responses';
import { User } from '../auth/user';

/**
 * Project role enumeration
 * Defines possible roles a user can have in a project
 */
export enum ProjectRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  DEPUTY = 'DEPUTY',
  MEMBER = 'MEMBER',
  VIEWER = 'VIEWER'
}

/**
 * Cloud storage provider types
 */
export type CloudProvider = 'GDRIVE' | 'DROPBOX' | 'BOX' | 'ONEDRIVE';

/**
 * Project information
 */
export interface Project {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly tenantId: string;
  readonly createdBy: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly archived: boolean;
  readonly members: ProjectMember[];
}

/**
 * Project member information
 */
export interface ProjectMember {
  readonly userId: string;
  readonly user: User;
  readonly role: ProjectRole;
  readonly joinedAt: string;
}

/**
 * Request to create a new project
 */
export interface CreateProjectRequest {
  readonly name: string;
  readonly description?: string;
  readonly tenantId: string;
  readonly provider: CloudProvider;
  readonly folderPath: string;
}

/**
 * Request to update an existing project
 */
export interface UpdateProjectRequest {
  readonly name?: string;
  readonly description?: string;
  readonly archived?: boolean;
}

/**
 * Response types
 */
export type ProjectResponse = SuccessResponse<Project>;
export type ProjectListResponse = SuccessResponse<Project[]>;
export type ProjectMemberResponse = SuccessResponse<ProjectMember>;
export type ProjectMemberListResponse = SuccessResponse<ProjectMember[]>;
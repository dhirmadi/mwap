/** @deprecated Use equivalent functionality from v2 modules instead. This module will be removed in a future release. */

import { Project } from './project';
import { ProjectMember } from './roles';
import { SuccessResponse } from '@core/types/responses';

// Request types
export interface CreateProjectRequest {
  name: string;
  description?: string;
  cloudProvider: string;
  cloudFolder: {
    id: string;
    path: string;
  };
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  archived?: boolean;
}

export interface UpdateProjectMemberRequest {
  role: string;
}

// Response types
export type ProjectResponse = SuccessResponse<Project>;
export type ProjectListResponse = SuccessResponse<Project[]>;
export type ProjectMemberResponse = SuccessResponse<ProjectMember>;
export type ProjectMemberListResponse = SuccessResponse<ProjectMember[]>;

// Query types
export interface ProjectQueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  archived?: boolean;
  search?: string;
}
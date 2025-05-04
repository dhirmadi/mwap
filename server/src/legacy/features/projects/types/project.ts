/** @deprecated Use equivalent functionality from v2 modules instead. This module will be removed in a future release. */

import { ProjectMember } from './roles';

export interface Project {
  id: string;
  name: string;
  description?: string;
  tenantId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  archived: boolean;
  cloudProvider: string;
  cloudFolder: {
    id: string;
    path: string;
  };
}
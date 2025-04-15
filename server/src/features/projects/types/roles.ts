export enum ProjectRole {
  ADMIN = 'admin',
  DEPUTY = 'deputy',
  CONTRIBUTOR = 'contributor'
}

export const PROJECT_ROLE_HIERARCHY: Record<ProjectRole, number> = {
  [ProjectRole.ADMIN]: 3,
  [ProjectRole.DEPUTY]: 2,
  [ProjectRole.CONTRIBUTOR]: 1
};

export function hasHigherOrEqualRole(userRole: ProjectRole, requiredRole: ProjectRole): boolean {
  return PROJECT_ROLE_HIERARCHY[userRole] >= PROJECT_ROLE_HIERARCHY[requiredRole];
}

export interface ProjectMember {
  userId: string;
  role: ProjectRole;
  joinedAt: Date;
}
export enum ProjectRole {
  OWNER = 'OWNER',
  DEPUTY = 'DEPUTY',
  MEMBER = 'MEMBER'
}

export const PROJECT_ROLE_HIERARCHY: Record<ProjectRole, number> = {
  [ProjectRole.OWNER]: 3,
  [ProjectRole.DEPUTY]: 2,
  [ProjectRole.MEMBER]: 1
};

export function hasHigherOrEqualRole(userRole: ProjectRole, requiredRole: ProjectRole): boolean {
  return PROJECT_ROLE_HIERARCHY[userRole] >= PROJECT_ROLE_HIERARCHY[requiredRole];
}

export interface ProjectMember {
  userId: string;
  role: ProjectRole;
  joinedAt: Date;
}
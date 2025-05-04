import { z } from 'zod';

export const ProjectRole = z.enum(['owner', 'deputy', 'contributor', 'viewer']);
export type ProjectRole = z.infer<typeof ProjectRole>;

export const ProjectMemberSchema = z.object({
  userId: z.string(),
  role: ProjectRole,
  addedAt: z.date(),
  addedBy: z.string(),
});

export type ProjectMember = z.infer<typeof ProjectMemberSchema>;

export const ProjectMembersSchema = z.object({
  projectId: z.string().uuid(),
  members: z.array(ProjectMemberSchema),
});

export type ProjectMembers = z.infer<typeof ProjectMembersSchema>;

export function canAccessProject(members: ProjectMembers, userId: string): boolean {
  return members.members.some(member => member.userId === userId);
}

export function getMemberRole(members: ProjectMembers, userId: string): ProjectRole | null {
  const member = members.members.find(member => member.userId === userId);
  return member?.role || null;
}

export function hasProjectRole(members: ProjectMembers, userId: string, roles: ProjectRole | ProjectRole[]): boolean {
  const member = members.members.find(member => member.userId === userId);
  if (!member) return false;
  
  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  return allowedRoles.includes(member.role);
}

export async function verifyProjectRole(
  projectId: string,
  userId: string,
  roles: ProjectRole | ProjectRole[],
  ProjectModel: { getMembers: (id: string) => Promise<ProjectMembers> }
): Promise<void> {
  const members = await ProjectModel.getMembers(projectId);
  if (!hasProjectRole(members, userId, roles)) {
    const roleList = Array.isArray(roles) ? roles.join(' or ') : roles;
    throw new Error(`User must have role: ${roleList}`);
  }
}
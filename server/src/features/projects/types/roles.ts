export enum ProjectRole {
  ADMIN = 'admin',
  DEPUTY = 'deputy',
  CONTRIBUTOR = 'contributor'
}

export interface ProjectMember {
  userId: string;
  role: ProjectRole;
  joinedAt: Date;
}
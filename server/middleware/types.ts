import { Request } from 'express';
import { User } from '@auth0/auth0-spa-js';

// Extend Express Request with Auth0 user
export interface Auth0Request extends Request {
  user?: User & {
    sub: string; // Auth0 user ID
    email: string;
    email_verified: boolean;
  };
}

// Reusable role enum
export enum Role {
  ADMIN = 'admin',
  DEPUTY = 'deputy',
  CONTRIBUTOR = 'contributor'
}

// Type guard for role validation
export function isValidRole(role: string): role is Role {
  return Object.values(Role).includes(role as Role);
}

// Type for role hierarchy checks
export const roleHierarchy: Record<Role, number> = {
  [Role.ADMIN]: 3,
  [Role.DEPUTY]: 2,
  [Role.CONTRIBUTOR]: 1
};
import { Request } from 'express';
import { User } from '@core/types';

// Use standard Request type with Express namespace extension
export type Auth0Request = Request;

export type Role = 'owner' | 'admin' | 'deputy' | 'contributor';

export const roleHierarchy: Record<Role, number> = {
  owner: 0,
  admin: 1,
  deputy: 2,
  contributor: 3
};

export const isValidRole = (role: string): role is Role => {
  return role in roleHierarchy;
};
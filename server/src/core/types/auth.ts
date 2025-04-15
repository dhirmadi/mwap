import { Request } from 'express';

export interface User {
  id: string;
  email: string;
  roles: string[];
  tenantId?: string;
  sub: string;
}

export interface Auth0Claims {
  sub: string;
  email: string;
  email_verified: boolean;
  name: string;
  picture: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  picture: string;
  roles: string[];
  tenantId?: string;
}

export interface AuthRequest extends Request {
  user: User;
}

export enum TenantRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER'
}
import { Request } from 'express';

export interface User {
  id: string;
  email: string;
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
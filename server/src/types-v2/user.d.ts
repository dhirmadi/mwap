import type { User } from '@auth0/auth0-spa-js';
import type { MWAPRole } from '../middleware-v2/auth/roles';

export interface MWAPUser extends Partial<User> {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  authProvider?: string;
  roles: MWAPRole[];
  createdAt?: Date;
  updatedAt?: Date;
}

// Extend Express Request to include user and role
declare global {
  namespace Express {
    interface Request {
      user?: MWAPUser;
      projectRole?: MWAPRole;
    }
  }
}
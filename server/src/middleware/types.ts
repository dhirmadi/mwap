import { Request } from 'express';
import { Types } from 'mongoose';
import { Tenant, UserRole } from '../models';

export interface TenantRequest extends Request {
  tenant?: Tenant;
  userTenantRole?: UserRole;
}

// Role hierarchy for permission checks
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  'admin': 3,
  'deputy': 2,
  'contributor': 1
};
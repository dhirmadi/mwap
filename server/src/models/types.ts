import { Types } from 'mongoose';

export type TenantStatus = 'pending' | 'active' | 'archived';
export type UserRole = 'admin' | 'deputy' | 'contributor';

export interface TenantMembership {
  tenantId: Types.ObjectId;
  role: UserRole;
}

export interface EncryptedField<T> {
  value: T;
  __encrypted?: boolean;
}
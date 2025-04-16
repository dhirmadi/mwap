import { Document } from 'mongoose';

export interface TenantMember {
  userId: string;
  role: string;
}

export interface Tenant {
  name: string;
  ownerId: string;
  members: TenantMember[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TenantDocument extends Tenant, Document {}

export interface CreateTenantInput {
  name: string;
}

export interface UpdateTenantInput {
  name?: string;
}
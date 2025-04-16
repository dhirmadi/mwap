import { Document, Types } from 'mongoose';

export type TenantRole = 'owner' | 'admin' | 'member';

export interface TenantMember {
  userId: string;
  role: TenantRole;
  addedAt?: Date;
  updatedAt?: Date;
}

export interface Tenant {
  name: string;
  ownerId: Types.ObjectId;
  members: TenantMember[];
  archived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TenantDocument extends Tenant, Document {
  _id: Types.ObjectId;
}

export interface CreateTenantInput {
  name: string;
}

export interface UpdateTenantInput {
  name?: string;
  archived?: boolean;
}

export interface AddMemberInput {
  userId: string;
  role: TenantRole;
}

export interface TenantResponse {
  id: string;
  name: string;
  ownerId: string;
  members: TenantMember[];
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}
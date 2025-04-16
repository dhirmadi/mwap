import { Schema, model, Document, Model, Types } from 'mongoose';

// Tenant role enumeration
export enum TenantRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER'
}

// Member interface and schema
interface TenantMember {
  userId: string;
  role: TenantRole;
  joinedAt: Date;
}

const tenantMemberSchema = new Schema<TenantMember>({
  userId: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true,
    enum: Object.values(TenantRole)
  },
  joinedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

// TypeScript interfaces
export interface Tenant {
  name: string;
  members: TenantMember[];
  createdAt: Date;
  archived?: boolean;
}

export interface TenantDocument extends Tenant, Document {}

export interface TenantModel extends Model<TenantDocument> {}

// Mongoose schema
const tenantSchema = new Schema<TenantDocument>({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100
  },
  members: {
    type: [tenantMemberSchema],
    required: true,
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  archived: {
    type: Boolean,
    default: false,
    index: true // Index for filtering archived/active tenants
  }
});

// Add compound index for user's active/archived tenants
// This index also covers simple userId lookups
tenantSchema.index({ 'members.userId': 1, archived: 1 });

export const TenantModel = model<TenantDocument, TenantModel>('Tenant', tenantSchema);

// Export validation schemas
export * from './validation';
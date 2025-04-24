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

// Integration type
export type IntegrationProvider = 'gdrive' | 'dropbox' | 'box' | 'onedrive';

export interface Integration {
  provider: IntegrationProvider;
  token: string;
  connectedAt: Date;
}

const integrationSchema = new Schema<Integration>({
  provider: {
    type: String,
    required: true,
    enum: ['gdrive', 'dropbox', 'box', 'onedrive']
  },
  token: {
    type: String,
    required: true
  },
  connectedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

// TypeScript interfaces
export interface Tenant {
  name: string;
  ownerId: string;
  members: TenantMember[];
  integrations: Integration[];
  settings: Map<string, any>;
  createdAt: Date;
  updatedAt: Date;
  archived: boolean;
}

export interface TenantDocument extends Tenant, Document {
  _id: Types.ObjectId;
  __v: number;
}

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
  ownerId: {
    type: String,
    required: true
  },
  members: {
    type: [tenantMemberSchema],
    required: true,
    default: []
  },
  integrations: {
    type: [integrationSchema],
    required: true,
    default: []
  },
  settings: {
    type: Map,
    of: Schema.Types.Mixed,
    default: new Map()
  },
  archived: {
    type: Boolean,
    default: false,
    index: true // Index for filtering archived/active tenants
  }
}, {
  timestamps: true
});

// Add compound index for user's active/archived tenants
// This index also covers simple userId lookups
tenantSchema.index({ 'members.userId': 1, archived: 1 });

export const TenantModel = model<TenantDocument, TenantModel>('Tenant', tenantSchema);

// Export validation schemas
export * from './validation';
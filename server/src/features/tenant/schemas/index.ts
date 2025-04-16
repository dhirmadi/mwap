import { Schema, model, Document, Model, Types } from 'mongoose';

// Member interface and schema
interface TenantMember {
  userId: string;
  role: string;
}

const tenantMemberSchema = new Schema<TenantMember>({
  userId: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true,
    enum: ['owner', 'admin', 'member']
  }
}, { _id: false });

// TypeScript interfaces
export interface Tenant {
  ownerId: Types.ObjectId;
  name: string;
  members: TenantMember[];
  createdAt: Date;
  archived?: boolean;
}

export interface TenantDocument extends Tenant, Document {}

export interface TenantModel extends Model<TenantDocument> {}

// Mongoose schema
const tenantSchema = new Schema<TenantDocument>({
  ownerId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User',
    index: true // Index for faster owner lookups
  },
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

// Create compound indexes
tenantSchema.index({ ownerId: 1, archived: 1 });
tenantSchema.index({ 'members.userId': 1 }); // Index for member lookups

// Ensure owner is always a member with owner role
tenantSchema.pre('save', function(next) {
  const tenant = this;
  const ownerExists = tenant.members.some(member => 
    member.userId === tenant.ownerId.toString() && member.role === 'owner'
  );
  
  if (!ownerExists) {
    tenant.members.push({ userId: tenant.ownerId.toString(), role: 'owner' });
  }
  next();
});

export const TenantModel = model<TenantDocument, TenantModel>('Tenant', tenantSchema);
import { Schema, model, Document, Model, Types } from 'mongoose';

// TypeScript interfaces
export interface Tenant {
  ownerId: Types.ObjectId;
  name: string;
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
    trim: true
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

// Create compound index for owner + archived status queries
tenantSchema.index({ ownerId: 1, archived: 1 });

export const TenantModel = model<TenantDocument, TenantModel>('Tenant', tenantSchema);
import { Schema, model, Document, Types } from 'mongoose';

export interface Tenant {
  name: string;
  ownerId: Types.ObjectId;
  archived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TenantDocument extends Tenant, Document {}

const tenantSchema = new Schema<TenantDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    archived: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Index for fast lookups by owner
tenantSchema.index({ ownerId: 1 });
// Compound index to enforce one active tenant per owner
tenantSchema.index(
  { ownerId: 1, archived: 1 },
  { 
    unique: true,
    partialFilterExpression: { archived: false }
  }
);

export const TenantModel = model<TenantDocument>('Tenant', tenantSchema);
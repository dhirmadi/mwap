import { Schema, model, Types } from 'mongoose';
import { TenantStatus } from './types';

interface ITenant {
  name: string;
  owner: Types.ObjectId;
  status: TenantStatus;
  createdBy: Types.ObjectId;  // Redundant with owner but useful for analytics
  archivedReason?: string;
  archivedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const tenantSchema = new Schema<ITenant>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
      // Add case-insensitive unique index
      set: (v: string) => v.toLowerCase(),  // Store names in lowercase
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'archived'],
      default: 'pending',
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    archivedReason: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    archivedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    // Disable version key to reduce document size
    versionKey: false,
    // Ensure toJSON transforms remove any sensitive data
    toJSON: {
      transform: (_, ret) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes for faster lookups and constraints
tenantSchema.index({ owner: 1 });
tenantSchema.index({ name: 1 }, { unique: true }); // Case-insensitive unique names (due to lowercase setter)
tenantSchema.index({ status: 1, createdAt: -1 }); // For status-based queries
tenantSchema.index({ archivedAt: 1 }, { sparse: true }); // For archived tenants lookup

// Ensure one user can only own one tenant
tenantSchema.index(
  { owner: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $ne: 'archived' } },
  }
);

export const Tenant = model<ITenant>('Tenant', tenantSchema);
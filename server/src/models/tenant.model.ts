import { Schema, model, Types } from 'mongoose';
import { TenantStatus } from './types';

interface ITenant {
  name: string;
  owner: Types.ObjectId;
  status: TenantStatus;
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

// Index for faster tenant lookup
tenantSchema.index({ owner: 1 });

// Ensure one user can only own one tenant
tenantSchema.index(
  { owner: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $ne: 'archived' } },
  }
);

export const Tenant = model<ITenant>('Tenant', tenantSchema);
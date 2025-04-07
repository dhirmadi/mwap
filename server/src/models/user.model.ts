import { Schema, model, Types } from 'mongoose';
import { TenantMembership, EncryptedField, UserRole } from './types';

interface IUser {
  auth0Id: string;
  email: EncryptedField<string>;
  name?: string;
  tenants: TenantMembership[];
  createdAt: Date;
  updatedAt: Date;
}

const tenantMembershipSchema = new Schema<TenantMembership>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
    },
    role: {
      type: String,
      enum: ['admin', 'deputy', 'contributor'],
      required: true,
    },
  },
  { _id: false }
);

const userSchema = new Schema<IUser>(
  {
    auth0Id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      value: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
      },
      __encrypted: {
        type: Boolean,
        default: true,
      },
    },
    name: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    tenants: {
      type: [tenantMembershipSchema],
      default: [],
      validate: {
        validator: function(tenants: TenantMembership[]) {
          // Ensure unique tenantIds
          const tenantIds = tenants.map(t => t.tenantId.toString());
          return new Set(tenantIds).size === tenantIds.length;
        },
        message: 'User cannot have duplicate tenant memberships',
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: (_, ret) => {
        delete ret.__v;
        // Don't expose encryption metadata
        if (ret.email?.__encrypted) {
          ret.email = ret.email.value;
        }
        return ret;
      },
    },
  }
);

// Indexes for faster lookups
userSchema.index({ auth0Id: 1 });
userSchema.index({ 'email.value': 1 });
userSchema.index({ 'tenants.tenantId': 1 });

export const User = model<IUser>('User', userSchema);
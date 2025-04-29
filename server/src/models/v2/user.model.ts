import { Schema, model, Document, Types } from 'mongoose';

export type AuthProvider = 'google' | 'dropbox' | 'microsoft';

export interface User {
  email: string;
  name: string;
  avatarUrl: string;
  authProvider: AuthProvider;
  tenantId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserDocument extends User, Document {}

const userSchema = new Schema<UserDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    avatarUrl: {
      type: String,
      trim: true,
      default: ''
    },
    authProvider: {
      type: String,
      enum: ['google', 'dropbox', 'microsoft'],
      required: true
    },
    tenantId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Tenant'
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Indexes for common queries
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ tenantId: 1 });
userSchema.index({ authProvider: 1 });

export const UserModel = model<UserDocument>('User', userSchema);
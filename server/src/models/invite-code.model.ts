import { Schema, model, Types } from 'mongoose';
import { UserRole } from './types';

interface IInviteCode {
  code: string;
  tenantId: Types.ObjectId;
  role: Exclude<UserRole, 'admin'>;
  createdBy: Types.ObjectId;
  expiresAt: Date;
  used: boolean;
  usedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const inviteCodeSchema = new Schema<IInviteCode>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['deputy', 'contributor'],
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    used: {
      type: Boolean,
      default: false,
    },
    usedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: (_, ret) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound index for faster invite code lookups
inviteCodeSchema.index({ tenantId: 1, used: 1 });
inviteCodeSchema.index({ expiresAt: 1, used: 1 });

export const InviteCode = model<IInviteCode>('InviteCode', inviteCodeSchema);
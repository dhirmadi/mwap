import { Schema, model, Document, Model, Types } from 'mongoose';
import { ProjectRole } from '@features/projects/schemas';

// TypeScript interfaces
export interface InviteCode {
  code: string;
  projectId: Types.ObjectId;
  role: ProjectRole;
  expiresAt: Date;
  redeemedBy?: Types.ObjectId;
  createdAt: Date;
}

export interface InviteCodeDocument extends InviteCode, Document {}

export interface InviteCodeModel extends Model<InviteCodeDocument> {}

// Mongoose schema
const inviteCodeSchema = new Schema<InviteCodeDocument>({
  code: {
    type: String,
    required: true,
    unique: true, // Unique index on code
    trim: true
  },
  projectId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Project',
    index: true // Index for project lookups
  },
  role: {
    type: String,
    required: true,
    enum: Object.values(ProjectRole)
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true // TTL index will be created below
  },
  redeemedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true // Index for user lookups
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create TTL index on expiresAt
inviteCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Create compound index for project + expiry queries
inviteCodeSchema.index({ projectId: 1, expiresAt: 1 });

export const InviteCodeModel = model<InviteCodeDocument, InviteCodeModel>('InviteCode', inviteCodeSchema);
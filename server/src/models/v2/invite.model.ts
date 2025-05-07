import { Schema, model, Document, Types } from 'mongoose';

export interface Invite {
  projectId: Types.ObjectId;
  email: string;
  role: string;
  code: string;
  expiresAt?: Date;
  redeemed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface InviteDocument extends Invite, Document {}

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const inviteSchema = new Schema<InviteDocument>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: (value: string) => emailRegex.test(value),
        message: 'Invalid email format'
      }
    },
    role: {
      type: String,
      required: true,
      trim: true
    },
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    expiresAt: {
      type: Date,
      required: false
    },
    redeemed: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Indexes for common queries
inviteSchema.index({ code: 1 }, { unique: true });
inviteSchema.index({ projectId: 1 });
inviteSchema.index({ email: 1 });
inviteSchema.index({ expiresAt: 1 });

// Virtual for checking if invite is expired
inviteSchema.virtual('isExpired').get(function(this: InviteDocument) {
  if (!this.expiresAt) return false;
  return this.expiresAt < new Date();
});

// Virtual for checking if invite is archived (redeemed or expired)
inviteSchema.virtual('isArchived').get(function(this: InviteDocument) {
  return this.redeemed || (this.expiresAt ? this.expiresAt < new Date() : false);
});

// Method to check if invite is valid
inviteSchema.methods.isValid = function(this: InviteDocument): boolean {
  return !this.redeemed && !this.isExpired;
};

export const InviteModel = model<InviteDocument>('Invite', inviteSchema);
/** @deprecated Use equivalent functionality from v2 modules instead. This module will be removed in a future release. */

import { Schema, model, Document, Model, Types } from 'mongoose';

// TypeScript interfaces
export interface SuperAdmin {
  userId: Types.ObjectId;
  createdAt: Date;
}

export interface SuperAdminDocument extends SuperAdmin, Document {}

export interface SuperAdminModel extends Model<SuperAdminDocument> {
  // Add any static methods here if needed for admin management
}

// Mongoose schema
const superAdminSchema = new Schema<SuperAdminDocument>({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User',
    unique: true // Enforce uniqueness on userId
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create index for faster lookups
superAdminSchema.index({ userId: 1 });

export const SuperAdminModel = model<SuperAdminDocument, SuperAdminModel>('SuperAdmin', superAdminSchema);
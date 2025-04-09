import { Schema, model } from 'mongoose';

interface ISuperAdmin {
  auth0Id: string;
  createdAt: Date;
}

const superAdminSchema = new Schema<ISuperAdmin>(
  {
    auth0Id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Index for faster lookups
superAdminSchema.index({ auth0Id: 1 });

export const SuperAdmin = model<ISuperAdmin>('SuperAdmin', superAdminSchema);
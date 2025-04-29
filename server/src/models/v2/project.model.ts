import { Schema, model, Document, Types } from 'mongoose';

export interface Project {
  name: string;
  cloudProvider: string;
  folderId: string;
  projectTypeId: string;
  ownerId: Types.ObjectId;
  tenantId: Types.ObjectId;
  archived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectDocument extends Project, Document {}

const projectSchema = new Schema<ProjectDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    cloudProvider: {
      type: String,
      required: true,
      trim: true
    },
    folderId: {
      type: String,
      required: true,
      trim: true
    },
    projectTypeId: {
      type: String,
      required: true,
      trim: true
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    tenantId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Tenant'
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

// Indexes for common queries
projectSchema.index({ tenantId: 1, folderId: 1 }, { unique: true });
projectSchema.index({ ownerId: 1 });
projectSchema.index({ archived: 1 });

export const ProjectModel = model<ProjectDocument>('Project', projectSchema);
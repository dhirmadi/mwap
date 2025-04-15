import { Schema, model, Document, Model, Types } from 'mongoose';

// Project member role enum
export enum ProjectRole {
  ADMIN = 'admin',
  DEPUTY = 'deputy',
  CONTRIBUTOR = 'contributor'
}

// TypeScript interfaces
export interface ProjectMember {
  userId: Types.ObjectId;
  role: ProjectRole;
}

export interface Project {
  tenantId: Types.ObjectId;
  name: string;
  createdAt: Date;
  members: ProjectMember[];
  archived?: boolean;
}

export interface ProjectDocument extends Project, Document {}

export interface ProjectModel extends Model<ProjectDocument> {}

// Mongoose schema for project member
const projectMemberSchema = new Schema<ProjectMember>({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  role: {
    type: String,
    required: true,
    enum: Object.values(ProjectRole)
  }
}, { _id: false }); // Disable _id for subdocuments

// Mongoose schema for project
const projectSchema = new Schema<ProjectDocument>({
  tenantId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Tenant',
    index: true // Index for tenant lookups
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  members: [projectMemberSchema],
  archived: {
    type: Boolean,
    default: false,
    index: true // Index for filtering archived/active projects
  }
});

// Index for members.userId lookups
projectSchema.index({ 'members.userId': 1 });

// Compound indexes for common queries
projectSchema.index({ tenantId: 1, archived: 1 }); // Tenant's active/archived projects
projectSchema.index({ 'members.userId': 1, archived: 1 }); // User's active/archived projects

export const ProjectModel = model<ProjectDocument, ProjectModel>('Project', projectSchema);
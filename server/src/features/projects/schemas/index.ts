import { Schema, model, Document, Model, Types } from 'mongoose';

// Project member role enum
export enum ProjectRole {
  OWNER = 'OWNER',
  DEPUTY = 'DEPUTY',
  MEMBER = 'MEMBER'
}

// TypeScript interfaces
export interface ProjectMember {
  userId: string;
  role: ProjectRole;
}

export interface Project {
  tenantId: Types.ObjectId;
  name: string;
  description?: string;
  createdAt: Date;
  members: ProjectMember[];
  archived?: boolean;
  cloudProvider: string;
  cloudFolder: {
    id: string;
    path: string;
  };
}

export interface ProjectDocument extends Project, Document {}

export interface ProjectModel extends Model<ProjectDocument> {}

// Mongoose schema for project member
const projectMemberSchema = new Schema<ProjectMember>({
  userId: {
    type: String,
    required: true
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
  description: {
    type: String,
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
  },
  cloudProvider: {
    type: String,
    required: true,
    enum: ['gdrive', 'dropbox', 'box', 'onedrive']
  },
  cloudFolder: {
    id: {
      type: String,
      required: true
    },
    path: {
      type: String,
      required: true
    }
  }
});

// Compound indexes for common queries
projectSchema.index({ tenantId: 1, archived: 1 }); // Tenant's active/archived projects
projectSchema.index({ 'members.userId': 1, archived: 1 }); // User's active/archived projects

export const ProjectModel = model<ProjectDocument, ProjectModel>('Project', projectSchema);
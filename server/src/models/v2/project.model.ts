import { Schema, model, Document, Types } from 'mongoose';

export type ProjectRole = 'OWNER' | 'DEPUTY' | 'MEMBER';

export interface ProjectMember {
  userId: Types.ObjectId;
  role: ProjectRole;
  joinedAt: Date;
  addedBy: Types.ObjectId;
}

export interface Project {
  name: string;
  cloudProvider: string;
  folderId: string;
  folderPath?: string;
  projectTypeId: string;
  ownerId: Types.ObjectId;
  tenantId: Types.ObjectId;
  archived: boolean;
  members: ProjectMember[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectDocument extends Project, Document {}

const projectMemberSchema = new Schema<ProjectMember>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['OWNER', 'DEPUTY', 'MEMBER'],
    required: true
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  addedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { _id: false });

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
    folderPath: {
      type: String,
      required: false,
      trim: true
    },
    archived: {
      type: Boolean,
      default: false
    },
    members: {
      type: [projectMemberSchema],
      default: []
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
projectSchema.index({ 'members.userId': 1 });

// Validation for members
projectSchema.pre('save', function(next) {
  // Ensure no duplicate members
  const uniqueMembers = new Set();
  this.members = this.members.filter(member => {
    const key = member.userId.toString();
    if (uniqueMembers.has(key)) {
      return false;
    }
    uniqueMembers.add(key);
    return true;
  });

  // Limit total number of members
  if (this.members.length > 20) {
    next(new Error('Maximum number of project members (20) exceeded'));
    return;
  }

  next();
});

export const ProjectModel = model<ProjectDocument>('Project', projectSchema);
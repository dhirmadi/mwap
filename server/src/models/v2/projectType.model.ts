import { Schema, model, Document } from 'mongoose';

export interface ProjectType {
  projectTypeId: string;
  name: string;
  description: string;
  iconUrl?: string;
  configSchema?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectTypeDocument extends ProjectType, Document {}

const projectTypeSchema = new Schema<ProjectTypeDocument>(
  {
    projectTypeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      validate: {
        validator: (v: string) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v),
        message: 'projectTypeId must be in kebab-case format'
      }
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    },
    iconUrl: {
      type: String,
      trim: true,
      validate: {
        validator: (v: string) => !v || /^https?:\/\/.+/.test(v),
        message: 'iconUrl must be a valid URL'
      }
    },
    configSchema: {
      type: Schema.Types.Mixed,
      validate: {
        validator: (v: unknown) => !v || (typeof v === 'object' && v !== null),
        message: 'configSchema must be a valid JSON schema object'
      }
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Index for fast lookups
projectTypeSchema.index({ projectTypeId: 1 }, { unique: true });

export const ProjectTypeModel = model<ProjectTypeDocument>('ProjectType', projectTypeSchema);
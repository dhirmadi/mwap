import { Schema, model, Document } from 'mongoose';

export type AuthType = 'OAuth2' | 'APIKey';

export interface CloudProvider {
  providerId: string;
  name: string;
  authType: AuthType;
  clientId?: string;
  clientSecret?: string;
  redirectUri?: string;
  configOptions?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CloudProviderDocument extends CloudProvider, Document {}

const cloudProviderSchema = new Schema<CloudProviderDocument>(
  {
    providerId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      validate: {
        validator: (v: string) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v),
        message: 'providerId must be in kebab-case format'
      }
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    authType: {
      type: String,
      required: true,
      enum: ['OAuth2', 'APIKey']
    },
    clientId: {
      type: String,
      trim: true,
      required: function(this: CloudProviderDocument) {
        return this.authType === 'OAuth2';
      }
    },
    clientSecret: {
      type: String,
      trim: true,
      required: function(this: CloudProviderDocument) {
        return this.authType === 'OAuth2';
      }
    },
    redirectUri: {
      type: String,
      trim: true,
      required: function(this: CloudProviderDocument) {
        return this.authType === 'OAuth2';
      },
      validate: {
        validator: (v: string) => !v || /^https?:\/\/.+/.test(v),
        message: 'redirectUri must be a valid URL'
      }
    },
    configOptions: {
      type: Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Index for fast lookups
cloudProviderSchema.index({ providerId: 1 }, { unique: true });

export const CloudProviderModel = model<CloudProviderDocument>('CloudProvider', cloudProviderSchema);
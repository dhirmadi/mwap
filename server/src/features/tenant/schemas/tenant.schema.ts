import { Schema, model } from 'mongoose';
import { Integration, TenantMember } from '../types/api';

const integrationSchema = new Schema<Integration>({
  provider: {
    type: String,
    required: true,
    enum: ['gdrive', 'dropbox', 'box', 'onedrive']
  },
  token: {
    type: String,
    required: true
  },
  refreshToken: {
    type: String,
    required: false
  },
  expiresAt: {
    type: Date,
    required: false
  },
  connectedAt: {
    type: Date,
    default: Date.now
  },
  lastRefreshedAt: {
    type: Date,
    required: false
  }
});

const tenantMemberSchema = new Schema<TenantMember>({
  userId: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true,
    enum: ['owner', 'admin', 'member']
  },
  joinedAt: {
    type: Date,
    default: Date.now
  }
});

const tenantSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  ownerId: {
    type: String,
    required: true
  },
  settings: {
    type: Map,
    of: Schema.Types.Mixed,
    default: new Map()
  },
  members: [tenantMemberSchema],
  integrations: [integrationSchema]
}, {
  timestamps: true
});

export const TenantModel = model('Tenant', tenantSchema);
export type { Integration };
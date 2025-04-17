import { Schema, model } from 'mongoose';
import { OAuthProvider } from '../core/auth/oauth-config';

interface Integration {
  provider: OAuthProvider;
  token: string;
  connectedAt: Date;
}

interface TenantDocument {
  name: string;
  integrations: Integration[];
}

const tenantSchema = new Schema<TenantDocument>({
  name: { type: String, required: true },
  integrations: [{
    provider: { type: String, enum: ['GDRIVE', 'DROPBOX', 'BOX', 'ONEDRIVE'], required: true },
    token: { type: String, required: true },
    connectedAt: { type: Date, required: true },
  }],
});

export const Tenant = model<TenantDocument>('Tenant', tenantSchema);
import { Tenant } from '../models/tenant';
import { OAuthProvider } from '../core/auth/oauth-config';
import { AppError } from '../core/errors';

interface Integration {
  provider: OAuthProvider;
  token: string;
  connectedAt: Date;
}

export async function updateTenantIntegration(tenantId: string, integration: Integration): Promise<void> {
  try {
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      throw new AppError('Tenant not found', 404);
    }

    // Remove existing integration for this provider if it exists
    tenant.integrations = tenant.integrations.filter(i => i.provider !== integration.provider);
    
    // Add new integration
    tenant.integrations.push(integration);
    
    await tenant.save();
  } catch (error) {
    throw new AppError('Failed to update tenant integration', 500, { cause: error });
  }
}

export async function removeTenantIntegration(tenantId: string, provider: OAuthProvider): Promise<void> {
  try {
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      throw new AppError('Tenant not found', 404);
    }

    tenant.integrations = tenant.integrations.filter(i => i.provider !== provider);
    await tenant.save();
  } catch (error) {
    throw new AppError('Failed to remove tenant integration', 500, { cause: error });
  }
}
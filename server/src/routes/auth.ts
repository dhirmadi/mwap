import { Router } from 'express';
import { AppError } from '../core/errors';
import { logger } from '../core/logging';
import { OAuthProvider, getOAuthConfig } from '../core/auth/oauth-config';
import { exchangeCodeForToken } from '../core/auth/oauth-client';
import { updateTenantIntegration } from '../services/tenant';

const router = Router();

/**
 * Redirect to provider's OAuth consent screen
 */
router.get('/:provider', (req, res) => {
  try {
    const provider = req.params.provider.toUpperCase() as OAuthProvider;
    const tenantId = req.query.tenantId as string;
    
    if (!tenantId) {
      throw new AppError('tenantId is required', 400);
    }

    const config = getOAuthConfig(provider);
    const state = Buffer.from(JSON.stringify({ tenantId })).toString('base64');
    
    const authUrl = new URL(config.authUrl);
    authUrl.searchParams.append('client_id', config.clientId);
    authUrl.searchParams.append('redirect_uri', config.redirectUri);
    authUrl.searchParams.append('scope', config.scope);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('state', state);

    res.redirect(authUrl.toString());
  } catch (error: unknown) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

/**
 * Handle OAuth callback and store integration
 */
router.get('/:provider/callback', async (req, res) => {
  try {
    const provider = req.params.provider.toUpperCase() as OAuthProvider;
    const { code, state } = req.query;
    
    if (!code || !state) {
      throw new AppError('Invalid callback parameters', 400);
    }

    // Decode state to get tenantId
    const { tenantId } = JSON.parse(Buffer.from(state as string, 'base64').toString());
    
    // Exchange code for token
    const token = await exchangeCodeForToken(provider, code as string);
    
    // Store integration
    await updateTenantIntegration(tenantId, {
      provider,
      token,
      connectedAt: new Date()
    });

    logger.info(`Successfully connected ${provider} for tenant ${tenantId}`);
    
    // Redirect back to tenant management page
    res.redirect(`/tenant/${tenantId}/manage`);
  } catch (error: unknown) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

export default router;
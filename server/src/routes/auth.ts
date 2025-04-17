import { Router } from 'express';
import { AppError, ValidationError } from '../core/types/errors';
import { logger } from '../core/logging';
import { OAuthProvider, getOAuthConfig, PROVIDER_ALIASES } from '../core/auth/oauth-config';
import { exchangeCodeForToken } from '../core/auth/oauth-client';
import { TenantService } from '@features/tenant/services';

const router = Router();

/**
 * Redirect to provider's OAuth consent screen
 */
router.get('/:provider', (req, res) => {
  const requestId = req.headers['x-request-id'] as string;
  
  try {
    const provider = req.params.provider;
    const tenantId = req.query.tenantId as string;
    
    if (!tenantId) {
      throw new ValidationError('tenantId is required');
    }

    logger.info('OAuth flow started', {
      provider,
      tenantId,
      requestId
    });

    const config = getOAuthConfig(provider, requestId);
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
 * Extract and validate tenant ID from OAuth state parameter
 * @throws {AppError} If state is invalid or missing tenantId
 */
function extractTenantId(state: string, requestId: string): string {
  try {
    const decoded = Buffer.from(state, 'base64').toString();
    const data = JSON.parse(decoded);

    if (!data.tenantId) {
      logger.error('Missing tenantId in state', { requestId, decoded });
      throw new ValidationError('Invalid OAuth state');
    }

    return data.tenantId;
  } catch (error) {
    logger.error('Failed to decode state', { 
      requestId,
      state,
      error: error instanceof Error ? error.message : String(error)
    });
    throw new ValidationError('Invalid OAuth state');
  }
}

/**
 * Handle OAuth callback and store integration
 */
router.get('/:provider/callback', async (req, res) => {
  const requestId = req.headers['x-request-id'] as string;
  const startTime = Date.now();

  try {
    const provider = req.params.provider;
    const { code, state, error: oauthError } = req.query;

    logger.debug('Received OAuth callback', {
      requestId,
      provider,
      hasCode: !!code,
      hasState: !!state,
      error: oauthError,
      query: req.query
    });

    // Check for OAuth errors
    if (oauthError) {
      logger.error('OAuth provider error', {
        requestId,
        provider,
        error: oauthError,
        errorDescription: req.query.error_description
      });
      throw new ValidationError('OAuth provider error');
    }
    
    if (!code || !state) {
      logger.error('Missing callback parameters', {
        requestId,
        provider,
        hasCode: !!code,
        hasState: !!state
      });
      throw new ValidationError('Invalid callback parameters');
    }

    // Extract and validate tenantId
    const tenantId = extractTenantId(state as string, requestId);
    
    // Exchange code for token
    const token = await exchangeCodeForToken(provider, code as string, requestId);
    
    // Get normalized provider key from config
    const config = getOAuthConfig(provider, requestId);
    const normalizedProvider = provider.toLowerCase();
    const providerKey = PROVIDER_ALIASES[normalizedProvider];
    
    if (!providerKey) {
      logger.error('Invalid provider in callback', {
        provider,
        normalizedProvider,
        requestId,
        supportedProviders: Object.keys(PROVIDER_ALIASES)
      });
      throw new ValidationError(`Unsupported OAuth provider: ${provider}`);
    }
    
    // Store integration
    const tenantService = new TenantService();
    await tenantService.updateTenant(tenantId, {
      integrations: [{
        provider: providerKey,
        token,
        connectedAt: new Date()
      }]
    });

    const duration = Date.now() - startTime;
    logger.info('Successfully connected provider', {
      requestId,
      provider,
      tenantId,
      durationMs: duration
    });
    
    // Redirect back to tenant management page
    res.redirect(`/tenant/${tenantId}/manage`);
  } catch (error: unknown) {
    const duration = Date.now() - startTime;
    
    if (error instanceof AppError) {
      logger.error('OAuth callback failed', {
        requestId,
        error: error.message,
        stack: error.stack,
        statusCode: error.statusCode,
        durationMs: duration,
        query: req.query
      });
      
      res.status(error.statusCode).json({ error: error.message });
    } else {
      logger.error('Unexpected error in OAuth callback', {
        requestId,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        durationMs: duration,
        query: req.query
      });
      
      res.status(500).json({ error: 'OAuth callback failed' });
    }
  }
});

export default router;
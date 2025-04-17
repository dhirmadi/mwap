import axios, { AxiosError } from 'axios';
import { OAuthProvider, getOAuthConfig } from './oauth-config';
import { AppError } from '../errors';
import { logger } from '../logging';

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  refresh_token?: string;
}

/**
 * Exchange OAuth authorization code for access token
 * @throws {AppError} If exchange fails or response is invalid
 */
export async function exchangeCodeForToken(
  provider: OAuthProvider,
  code: string,
  requestId?: string
): Promise<string> {
  try {
    const config = getOAuthConfig(provider);
    
    // Validate required config
    if (!config.clientId || !config.clientSecret) {
      logger.error('Missing OAuth credentials', {
        provider,
        requestId,
        hasClientId: !!config.clientId,
        hasClientSecret: !!config.clientSecret
      });
      throw new AppError.internal('OAuth configuration error');
    }

    const params = new URLSearchParams();
    params.append('client_id', config.clientId);
    params.append('client_secret', config.clientSecret);
    params.append('code', code);
    params.append('grant_type', 'authorization_code');
    params.append('redirect_uri', config.redirectUri);

    logger.debug('Exchanging code for token', {
      provider,
      requestId,
      tokenUrl: config.tokenUrl,
      redirectUri: config.redirectUri
    });

    const response = await axios.post<TokenResponse>(config.tokenUrl, params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    // Log token response without sensitive data
    logger.debug('Received token response', {
      provider,
      requestId,
      tokenType: response.data.token_type,
      expiresIn: response.data.expires_in,
      scope: response.data.scope,
      hasRefreshToken: !!response.data.refresh_token
    });

    if (!response.data.access_token) {
      logger.error('Invalid token response', {
        provider,
        requestId,
        status: response.status,
        data: JSON.stringify(response.data)
      });
      throw new AppError.internal('Invalid token response');
    }

    return response.data.access_token;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    const axiosError = error as AxiosError;
    logger.error('Token exchange failed', {
      provider,
      requestId,
      status: axiosError.response?.status,
      error: axiosError.message,
      response: axiosError.response?.data
    });
    
    throw new AppError.internal('Failed to exchange code for token', { cause: error });
  }
}
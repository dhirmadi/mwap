import axios from 'axios';
import { OAuthProvider, getOAuthConfig } from './oauth-config';
import { AppError } from '../errors';

export async function exchangeCodeForToken(provider: OAuthProvider, code: string): Promise<string> {
  try {
    const config = getOAuthConfig(provider);
    
    const params = new URLSearchParams();
    params.append('client_id', config.clientId);
    params.append('client_secret', config.clientSecret);
    params.append('code', code);
    params.append('grant_type', 'authorization_code');
    params.append('redirect_uri', config.redirectUri);

    const response = await axios.post(config.tokenUrl, params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    return response.data.access_token;
  } catch (error) {
    throw new AppError('Failed to exchange code for token', 500, { cause: error });
  }
}
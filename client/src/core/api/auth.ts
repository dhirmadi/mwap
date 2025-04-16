import { useAuth0 } from '@auth0/auth0-react';
import { AxiosRequestConfig } from 'axios';
import { AuthError, ErrorCode } from '../errors';

/**
 * Get access token from Auth0
 */
export async function getAccessToken(): Promise<string> {
  const { getAccessTokenSilently } = useAuth0();
  try {
    return await getAccessTokenSilently();
  } catch (error) {
    throw new AuthError(
      ErrorCode.UNAUTHORIZED,
      'Failed to get access token',
      error
    );
  }
}

/**
 * Add auth token to request config
 */
export async function addAuthToken(
  config: AxiosRequestConfig
): Promise<AxiosRequestConfig> {
  try {
    const token = await getAccessToken();
    return {
      ...config,
      headers: {
        ...config.headers,
        Authorization: `Bearer ${token}`
      }
    };
  } catch (error) {
    // Let the request proceed without token
    // The server will handle unauthorized requests
    return config;
  }
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiresAt = payload.exp * 1000;
    return Date.now() >= expiresAt;
  } catch {
    // If we can't parse the token, consider it expired
    return true;
  }
}

/**
 * Refresh auth token
 */
export async function refreshToken(): Promise<string> {
  const { getAccessTokenSilently } = useAuth0();
  try {
    return await getAccessTokenSilently({
      timeoutInSeconds: 60,
      detailedResponse: true
    });
  } catch (error) {
    throw new AuthError(
      ErrorCode.UNAUTHORIZED,
      'Failed to refresh token',
      error
    );
  }
}
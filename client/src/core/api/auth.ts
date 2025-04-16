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
  // Skip auth for health check and public endpoints
  if (config.url?.endsWith('/health') || config.url?.includes('/public/')) {
    return config;
  }

  try {
    // Get token from Auth0
    const token = await getAccessToken();
    if (!token) {
      throw new AuthError(
        ErrorCode.UNAUTHORIZED,
        'No auth token available'
      );
    }

    // Check token expiration
    if (isTokenExpired(token)) {
      // Try to refresh token
      const newToken = await refreshToken();
      return {
        ...config,
        headers: {
          ...config.headers,
          Authorization: `Bearer ${newToken}`,
          'Content-Type': 'application/json',
          Accept: 'application/json'
        }
      };
    }

    // Add token and standard headers
    return {
      ...config,
      headers: {
        ...config.headers,
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json'
      }
    };
  } catch (error) {
    // Log error for debugging
    console.error('Auth token error:', error);

    // Don't silently fail - throw error to trigger auth flow
    throw new AuthError(
      ErrorCode.UNAUTHORIZED,
      'Authentication required. Please log in.',
      error
    );
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
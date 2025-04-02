import { AuthUser } from '../../types/api';
import { TestClient } from './setup';

/**
 * Test user data
 */
export const testUsers = {
  regular: {
    sub: 'auth0|123456789',
    email: 'user@example.com',
    name: 'Regular User',
    picture: 'https://example.com/avatar1.jpg'
  },
  admin: {
    sub: 'auth0|987654321',
    email: 'admin@example.com',
    name: 'Admin User',
    picture: 'https://example.com/avatar2.jpg'
  }
} as const;

/**
 * Generate a valid JWT token for testing
 */
export function generateTestToken(user: AuthUser = testUsers.regular): string {
  return 'valid-token';
}

/**
 * Get auth headers for a test user
 */
export function getAuthHeaders(user: AuthUser = testUsers.regular) {
  return {
    Authorization: `Bearer ${generateTestToken(user)}`
  };
}

/**
 * Test helper to make authenticated requests
 */
export async function authenticatedRequest(
  api: TestClient,
  method: 'get' | 'post' | 'put' | 'delete' | 'patch',
  url: string,
  data?: unknown,
  user: AuthUser = testUsers.regular
) {
  const request = api[method](url).set(getAuthHeaders(user));
  if (data) {
    request.send(data);
  }
  return request;
}

/**
 * Validate error response structure
 */
export function validateErrorResponse(response: any) {
  expect(response.body).toMatchObject({
    message: expect.any(String)
  });
  if (response.body.error) {
    expect(typeof response.body.error).toBe('string');
  }
  if (response.body.code) {
    expect(typeof response.body.code).toBe('string');
  }
}
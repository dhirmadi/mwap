import { AuthUser } from '../../types/api';
import { TestClient } from './setup';

/**
 * Test user data
 */
export const testUsers = {
  regular: {
    sub: 'auth0|123456789',
    email: 'test@example.com',
    name: 'Test User',
    picture: 'https://example.com/avatar.jpg'
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
  return `valid-token-${user.sub}`;
}

/**
 * Get auth headers for a test user
 */
export function getAuthHeaders(user: AuthUser = testUsers.regular) {
  return {
    'Authorization': `Bearer ${generateTestToken(user)}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  };
}

/**
 * Test helper to make authenticated requests
 */
export function authenticatedRequest(
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
  // Check for error field
  if (response.body.error) {
    expect(response.body).toMatchObject({
      error: expect.any(String)
    });
    return;
  }

  // Check for message field
  if (response.body.message) {
    expect(response.body).toMatchObject({
      message: expect.any(String)
    });
    return;
  }

  // If neither error nor message, fail
  throw new Error('Response body must contain either error or message field');
}

/**
 * Validate response time header
 */
export function validateResponseTime(response: any) {
  const responseTime = response.headers['x-response-time'];
  expect(responseTime).toBeDefined();
  expect(responseTime).toMatch(/^\d+ms$/);
  
  // Extract duration and verify it's reasonable
  const duration = parseInt(responseTime.replace('ms', ''), 10);
  expect(duration).toBeGreaterThanOrEqual(0);
  expect(duration).toBeLessThan(10000); // Should not take more than 10 seconds
}

/**
 * Validate user profile response
 */
export function validateUserProfile(response: any, user: AuthUser = testUsers.regular) {
  expect(response.body).toMatchObject({
    id: user.sub,
    email: user.email,
    name: user.name,
    picture: user.picture
  });
}
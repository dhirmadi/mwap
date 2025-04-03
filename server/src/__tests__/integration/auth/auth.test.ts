import { createTestClient, TestClient } from '../../utils/setup';
import { testUsers, getAuthHeaders, validateErrorResponse } from '../../utils/testUtils';

describe('Auth Middleware', () => {
  let api: TestClient;

  beforeEach(() => {
    api = createTestClient();
  });

  describe('Protected Routes', () => {
    it('should return 401 for missing token', async () => {
      const response = await api
        .get('/api/users/me')
        .expect(401);

      validateErrorResponse(response);
    });

    it('should return 401 for invalid token format', async () => {
      const response = await api
        .get('/api/users/me')
        .set('Authorization', 'NotBearer token123')
        .expect(401);

      validateErrorResponse(response);
    });

    it('should return 401 for invalid token', async () => {
      const response = await api
        .get('/api/users/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      validateErrorResponse(response);
    });

    it('should allow access with valid token', async () => {
      const response = await api
        .get('/api/users/me')
        .set(getAuthHeaders(testUsers.regular))
        .expect(200);

      expect(response.body).toEqual({
        id: testUsers.regular.sub,
        email: 'test@example.com',
        name: 'Test User',
        picture: 'https://example.com/avatar.jpg'
      });
    });
  });

  describe('Public Routes', () => {
    it('should allow access without token', async () => {
      await api
        .get('/health')
        .expect(200);
    });

    it('should allow access with invalid token', async () => {
      await api
        .get('/health')
        .set('Authorization', 'Bearer invalid-token')
        .expect(200);
    });
  });
});
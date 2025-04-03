import { createTestClient, TestClient } from '../../utils/setup';
import { validateErrorResponse, validateResponseTime, authenticatedRequest, testUsers, getAuthHeaders } from '../../utils/testUtils';

describe('Users API', () => {
  let api: TestClient;

  beforeEach(() => {
    api = createTestClient();
  });

  describe('GET /api/users/me', () => {
    it('should return 401 when not authenticated', async () => {
      const response = await api
        .get('/api/users/me')
        .set('Accept', 'application/json')
        .expect(401);

      expect(response.body).toEqual({ error: 'Unauthorized - No token provided' });
      validateResponseTime(response);
    });

    it('should return 401 with invalid token', async () => {
      const response = await api
        .get('/api/users/me')
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body).toEqual({ error: 'Unauthorized - Invalid token format' });
      validateResponseTime(response);
    });

    it('should return user profile when authenticated', async () => {
      const response = await api
        .get('/api/users/me')
        .set(getAuthHeaders(testUsers.regular))
        .expect(200)
        .expect('Content-Type', /application\/json/);

      expect(response.body).toEqual({
        id: testUsers.regular.sub,
        email: 'test@example.com',
        name: 'Test User',
        picture: 'https://example.com/avatar.jpg'
      });
      validateResponseTime(response);
    });
  });
});
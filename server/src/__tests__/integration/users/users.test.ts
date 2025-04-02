import { createTestClient, TestClient } from '../../utils/setup';
import { UserProfile } from '../../../types/api';
import { testUsers, authenticatedRequest, validateErrorResponse } from '../../utils/testUtils';

describe('Users API', () => {
  let api: TestClient;

  beforeEach(() => {
    api = createTestClient();
  });

  describe('GET /api/users/me', () => {
    it('should return 401 when not authenticated', async () => {
      const response = await api
        .get('/api/users/me')
        .expect(401);

      validateErrorResponse(response);
    });

    it('should return 401 with invalid token', async () => {
      const response = await api
        .get('/api/users/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      validateErrorResponse(response);
    });

    it('should return user profile when authenticated', async () => {
      const response = await authenticatedRequest(api, 'get', '/api/users/me');
      
      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/application\/json/);

      const body = response.body as UserProfile;
      expect(body).toMatchObject({
        id: testUsers.regular.sub,
        email: testUsers.regular.email,
        name: testUsers.regular.name,
        picture: testUsers.regular.picture
      });
    });

    it('should include response time header', async () => {
      const response = await authenticatedRequest(api, 'get', '/api/users/me');
      expect(response.headers['x-response-time']).toMatch(/^\d+ms$/);
    });
  });
});
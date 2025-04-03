import { createTestClient, TestClient } from '../../utils/setup';
import { 
  testUsers, 
  authenticatedRequest, 
  validateErrorResponse,
  validateResponseTime,
  validateUserProfile
} from '../../utils/testUtils';

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

      validateErrorResponse(response);
    });

    it('should return 401 with invalid token', async () => {
      const response = await api
        .get('/api/users/me')
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      validateErrorResponse(response);
    });

    it('should return user profile when authenticated', async () => {
      const response = await authenticatedRequest(api, 'get', '/api/users/me');
      
      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/application\/json/);

      validateUserProfile(response, testUsers.regular);
      validateResponseTime(response);
    });
  });
});
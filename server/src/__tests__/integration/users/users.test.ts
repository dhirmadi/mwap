import { createTestClient, TestClient } from '../../utils/setup';
import { getAuthHeaders } from '../../utils/auth';
import { testUsers } from '../../fixtures/users';

describe('Users API', () => {
  let api: TestClient;

  beforeEach(() => {
    api = createTestClient();
  });

  describe('GET /api/users/me', () => {
    it('should return 401 when not authenticated', async () => {
      await api
        .get('/api/users/me')
        .expect(401);
    });

    it('should return user profile when authenticated', async () => {
      await api
        .get('/api/users/me')
        .set(getAuthHeaders())
        .expect(200)
        .expect('Content-Type', /application\/json/)
        .then(response => {
          expect(response.body).toMatchObject({
            id: expect.any(String),
            email: expect.any(String),
            name: expect.any(String)
          });
        });
    });
  });
});
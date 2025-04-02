import { createTestClient, TestClient } from '../../utils/setup';

// Mock user data
const mockUser = {
  sub: 'auth0|123456789',
  email: 'test@example.com',
  name: 'Test User',
  picture: 'https://example.com/avatar.jpg'
};

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
        .set('Authorization', 'Bearer valid-token')
        .expect(200)
        .expect('Content-Type', /application\/json/)
        .then(response => {
          expect(response.body).toMatchObject({
            id: mockUser.sub,
            email: mockUser.email,
            name: mockUser.name,
            picture: mockUser.picture
          });
        });
    });
  });
});
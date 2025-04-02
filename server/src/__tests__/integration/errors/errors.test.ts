import { createTestClient, TestClient } from '../../utils/setup';
import { validateErrorResponse } from '../../utils/testUtils';

describe('Error Handling', () => {
  let api: TestClient;

  beforeEach(() => {
    api = createTestClient();
  });

  describe('404 Not Found', () => {
    it('should handle non-existent API routes', async () => {
      const response = await api
        .get('/api/non-existent')
        .expect(404);

      validateErrorResponse(response);
    });

    it('should handle non-existent API methods', async () => {
      const response = await api
        .post('/api/users/me')
        .expect(404);

      validateErrorResponse(response);
    });
  });

  describe('Content Type Validation', () => {
    it('should reject invalid content type', async () => {
      const response = await api
        .post('/api/users/me')
        .set('Content-Type', 'text/plain')
        .send('invalid data')
        .expect(415);

      validateErrorResponse(response);
      expect(response.body.message).toMatch(/application\/json/i);
    });
  });

  describe('Request Validation', () => {
    it('should handle malformed JSON', async () => {
      const response = await api
        .post('/api/users/me')
        .set('Content-Type', 'application/json')
        .send('{invalid json')
        .expect(400);

      validateErrorResponse(response);
    });

    it('should handle payload too large', async () => {
      // Create a large payload (>10kb)
      const largeData = { data: 'x'.repeat(11 * 1024) };

      const response = await api
        .post('/api/users/me')
        .send(largeData)
        .expect(413);

      validateErrorResponse(response);
    });
  });
});
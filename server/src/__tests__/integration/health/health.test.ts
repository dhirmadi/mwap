import { createTestClient, TestClient } from '../../utils/setup';
import { HealthCheckResponse } from '../../../types/api';
import { validateResponseTime } from '../../utils/testUtils';

describe('Health Check API', () => {
  let api: TestClient;

  beforeEach(() => {
    api = createTestClient();
  });

  describe('GET /health', () => {
    it('should return healthy status', async () => {
      const response = await api
        .get('/health')
        .set('Accept', 'application/json')
        .expect(200)
        .expect('Content-Type', /application\/json/);

      const body = response.body as HealthCheckResponse;
      expect(body).toMatchObject({
        status: 'healthy',
        environment: expect.any(String),
        timestamp: expect.any(String),
        uptime: expect.any(Number)
      });

      // Validate timestamp format
      expect(() => new Date(body.timestamp)).not.toThrow();
      
      // Validate uptime is positive
      expect(body.uptime).toBeGreaterThan(0);

      // Validate response time header
      validateResponseTime(response);
    });
  });
});
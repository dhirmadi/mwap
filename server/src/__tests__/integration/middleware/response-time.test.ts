import { createTestClient, TestClient } from '../../utils/setup';
import { validateResponseTime } from '../../utils/testUtils';

describe('Response Time Middleware', () => {
  let api: TestClient;

  beforeEach(() => {
    api = createTestClient();
  });

  it('should add response time header to health check endpoint', async () => {
    const response = await api
      .get('/health')
      .set('Accept', 'application/json')
      .expect(200);

    validateResponseTime(response);
  });

  it('should add response time header to API endpoints', async () => {
    const response = await api
      .get('/api/users/me')
      .set('Accept', 'application/json')
      .expect(401); // Unauthorized is fine, we just want to check the header

    validateResponseTime(response);
  });

  it('should add response time header to error responses', async () => {
    const response = await api
      .get('/api/non-existent')
      .set('Accept', 'application/json')
      .expect(404);

    validateResponseTime(response);
  });

  it('should measure time accurately for slow responses', async () => {
    // Create a slow endpoint for testing
    const start = Date.now();
    const slowResponse = await api
      .get('/health')
      .set('Accept', 'application/json')
      .expect(200);

    validateResponseTime(slowResponse);

    const duration = parseInt(slowResponse.headers['x-response-time'].replace('ms', ''), 10);
    const actualDuration = Date.now() - start;
    
    // Duration should be within 50ms of actual time
    expect(Math.abs(duration - actualDuration)).toBeLessThan(50);
  });

  it('should handle concurrent requests correctly', async () => {
    // Make multiple concurrent requests with artificial delays
    const requests = Array(5).fill(null).map((_, i) => 
      new Promise(resolve => {
        setTimeout(async () => {
          // Add artificial processing time
          const start = Date.now();
          while (Date.now() - start < i * 50) {
            // Busy wait to simulate processing
          }
          const response = await api
            .get('/health')
            .set('Accept', 'application/json')
            .expect(200);
          resolve(response);
        }, 0);
      })
    );

    const responses = await Promise.all(requests);

    // Each response should have its own timing
    responses.forEach(response => {
      validateResponseTime(response as any);
    });

    // Times should be different for each request
    const times = responses.map(r => 
      parseInt((r as any).headers['x-response-time'].replace('ms', ''), 10)
    );
    const uniqueTimes = new Set(times);
    expect(uniqueTimes.size).toBeGreaterThan(1); // At least some times should be different

    // Verify times are in ascending order (since each request takes longer)
    const sortedTimes = [...times].sort((a, b) => a - b);
    expect(times).toEqual(sortedTimes);
  });
});
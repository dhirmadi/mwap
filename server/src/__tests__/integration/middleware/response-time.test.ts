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

  it('should measure time accurately', async () => {
    // Add artificial delay to simulate processing
    const delay = 100; // 100ms delay
    const start = process.hrtime();

    // Make request with artificial delay
    const response = await new Promise((resolve) => {
      setTimeout(async () => {
        const result = await api
          .get('/health')
          .set('Accept', 'application/json')
          .expect(200);
        resolve(result);
      }, delay);
    });

    // Calculate actual time taken
    const [seconds, nanoseconds] = process.hrtime(start);
    const actualDuration = Math.round((seconds * 1000) + (nanoseconds / 1000000));

    // Get response time from header
    const responseTime = parseInt((response as any).headers['x-response-time'].replace('ms', ''), 10);

    // Response time should be close to actual duration
    expect(Math.abs(responseTime - actualDuration)).toBeLessThan(50);
    expect(responseTime).toBeGreaterThanOrEqual(delay);
  });

  it('should handle concurrent requests with different delays', async () => {
    // Make multiple requests with increasing delays
    const delays = [50, 100, 150, 200, 250];
    const requests = delays.map(delay => 
      new Promise((resolve) => {
        setTimeout(async () => {
          const start = process.hrtime();
          const response = await api
            .get('/health')
            .set('Accept', 'application/json')
            .expect(200);

          // Calculate actual duration
          const [seconds, nanoseconds] = process.hrtime(start);
          const actualDuration = Math.round((seconds * 1000) + (nanoseconds / 1000000));

          resolve({
            response,
            delay,
            actualDuration
          });
        }, delay);
      })
    );

    const results = await Promise.all(requests);

    // Verify each response
    results.forEach(({ response, delay, actualDuration }) => {
      const responseTime = parseInt((response as any).headers['x-response-time'].replace('ms', ''), 10);
      
      // Response time should be valid
      validateResponseTime(response as any);

      // Response time should be close to actual duration
      expect(Math.abs(responseTime - actualDuration)).toBeLessThan(50);

      // Response time should be at least the artificial delay
      expect(responseTime).toBeGreaterThanOrEqual(delay - 50);
    });

    // Times should be different and roughly in order
    const times = results.map(r => 
      parseInt((r.response as any).headers['x-response-time'].replace('ms', ''), 10)
    );

    // Should have unique times
    const uniqueTimes = new Set(times);
    expect(uniqueTimes.size).toBeGreaterThan(1);

    // Times should generally increase (allow some variance)
    for (let i = 1; i < times.length; i++) {
      expect(times[i]).toBeGreaterThan(times[i-1] - 50);
    }
  });
});
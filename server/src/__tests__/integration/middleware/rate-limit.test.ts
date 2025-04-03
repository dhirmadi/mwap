import { createTestClient, TestClient } from '../../utils/setup';

describe('Rate Limiting Middleware', () => {
  let api: TestClient;

  beforeEach(() => {
    api = createTestClient();
    // Reset rate limit by waiting
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Overall Rate Limiting', () => {
    it('should allow requests within the overall rate limit', async () => {
      // Make multiple requests within limit (250 per minute)
      for (let i = 0; i < 10; i++) {
        const response = await api
          .get('/health')
          .set('Accept', 'application/json');

        expect(response.status).toBe(200);
        expect(response.headers['x-ratelimit-limit']).toBeDefined();
        expect(response.headers['x-ratelimit-remaining']).toBeDefined();
        expect(response.headers['x-ratelimit-reset']).toBeDefined();
      }
    });

    it('should block requests when overall rate limit is exceeded', async () => {
      // Make requests to exceed limit
      const requests = Array.from({ length: 251 }, () =>
        api.get('/health').set('Accept', 'application/json')
      );

      const responses = await Promise.all(requests);
      const blockedResponses = responses.filter(r => r.status === 429);

      expect(blockedResponses.length).toBeGreaterThan(0);
      expect(blockedResponses[0].body).toEqual({
        error: 'Too many requests, please try again later.'
      });
    });

    it('should reset rate limit after window expires', async () => {
      // Make requests to approach limit
      const requests = Array.from({ length: 245 }, () =>
        api.get('/health').set('Accept', 'application/json')
      );
      await Promise.all(requests);

      // Advance time by rate limit window
      jest.advanceTimersByTime(60 * 1000); // 1 minute

      // Should be able to make requests again
      const response = await api
        .get('/health')
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);
    });
  });

  describe('API Endpoint Rate Limiting', () => {
    it('should apply specific limit to API endpoints', async () => {
      // Make requests to approach API endpoint limit (100 per minute)
      const requests = Array.from({ length: 101 }, () =>
        api.get('/api/users/me')
          .set('Accept', 'application/json')
          .set('Authorization', 'valid-token-123')
      );

      const responses = await Promise.all(requests);
      const blockedResponses = responses.filter(r => r.status === 429);

      expect(blockedResponses.length).toBeGreaterThan(0);
    });

    it('should track API limits separately from overall limits', async () => {
      // Make API requests up to limit
      const apiRequests = Array.from({ length: 100 }, () =>
        api.get('/api/users/me')
          .set('Accept', 'application/json')
          .set('Authorization', 'valid-token-123')
      );
      await Promise.all(apiRequests);

      // Should still be able to make non-API requests
      const response = await api
        .get('/health')
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);
    });
  });

  describe('Auth Endpoint Rate Limiting', () => {
    it('should apply stricter limit to auth endpoints', async () => {
      // Make requests to exceed auth endpoint limit (25 per 15 minutes)
      const requests = Array.from({ length: 26 }, () =>
        api.post('/api/auth/login')
          .set('Accept', 'application/json')
          .send({ username: 'test', password: 'test' })
      );

      const responses = await Promise.all(requests);
      const blockedResponses = responses.filter(r => r.status === 429);

      expect(blockedResponses.length).toBeGreaterThan(0);
    });

    it('should maintain auth limit across the longer window', async () => {
      // Make requests up to auth limit
      const requests = Array.from({ length: 25 }, () =>
        api.post('/api/auth/login')
          .set('Accept', 'application/json')
          .send({ username: 'test', password: 'test' })
      );
      await Promise.all(requests);

      // Advance time by less than window
      jest.advanceTimersByTime(10 * 60 * 1000); // 10 minutes

      // Additional request should be blocked
      const response = await api
        .post('/api/auth/login')
        .set('Accept', 'application/json')
        .send({ username: 'test', password: 'test' });

      expect(response.status).toBe(429);
    });

    it('should reset auth limit after window expires', async () => {
      // Make requests up to auth limit
      const requests = Array.from({ length: 25 }, () =>
        api.post('/api/auth/login')
          .set('Accept', 'application/json')
          .send({ username: 'test', password: 'test' })
      );
      await Promise.all(requests);

      // Advance time beyond window
      jest.advanceTimersByTime(15 * 60 * 1000); // 15 minutes

      // Should be able to make request again
      const response = await api
        .post('/api/auth/login')
        .set('Accept', 'application/json')
        .send({ username: 'test', password: 'test' });

      expect(response.status).not.toBe(429);
    });
  });

  describe('Rate Limit Headers', () => {
    it('should include correct rate limit headers', async () => {
      const response = await api
        .get('/api/users/me')
        .set('Accept', 'application/json')
        .set('Authorization', 'valid-token-123');

      expect(response.headers).toMatchObject({
        'x-ratelimit-limit': expect.any(String),
        'x-ratelimit-remaining': expect.any(String),
        'x-ratelimit-reset': expect.any(String)
      });

      // Verify header values are numbers
      expect(Number(response.headers['x-ratelimit-limit'])).toBeGreaterThan(0);
      expect(Number(response.headers['x-ratelimit-remaining'])).toBeGreaterThan(0);
      expect(Number(response.headers['x-ratelimit-reset'])).toBeGreaterThan(0);
    });

    it('should update remaining requests in headers', async () => {
      // Make initial request
      const firstResponse = await api
        .get('/api/users/me')
        .set('Accept', 'application/json')
        .set('Authorization', 'valid-token-123');

      const firstRemaining = Number(firstResponse.headers['x-ratelimit-remaining']);

      // Make another request
      const secondResponse = await api
        .get('/api/users/me')
        .set('Accept', 'application/json')
        .set('Authorization', 'valid-token-123');

      const secondRemaining = Number(secondResponse.headers['x-ratelimit-remaining']);

      expect(secondRemaining).toBe(firstRemaining - 1);
    });
  });

  describe('IP-based Rate Limiting', () => {
    it('should track limits by IP address', async () => {
      // Make requests with different IP addresses
      const response1 = await api
        .get('/api/users/me')
        .set('Accept', 'application/json')
        .set('Authorization', 'valid-token-123')
        .set('X-Forwarded-For', '1.2.3.4');

      const response2 = await api
        .get('/api/users/me')
        .set('Accept', 'application/json')
        .set('Authorization', 'valid-token-123')
        .set('X-Forwarded-For', '5.6.7.8');

      expect(response1.headers['x-ratelimit-remaining'])
        .toBe(response2.headers['x-ratelimit-remaining']);
    });

    it('should handle X-Forwarded-For header correctly', async () => {
      // Make requests to exceed limit from one IP
      const requests = Array.from({ length: 101 }, () =>
        api.get('/api/users/me')
          .set('Accept', 'application/json')
          .set('Authorization', 'valid-token-123')
          .set('X-Forwarded-For', '1.2.3.4')
      );

      const responses = await Promise.all(requests);
      const blockedResponses = responses.filter(r => r.status === 429);

      expect(blockedResponses.length).toBeGreaterThan(0);

      // Should still be able to make request from different IP
      const response = await api
        .get('/api/users/me')
        .set('Accept', 'application/json')
        .set('Authorization', 'valid-token-123')
        .set('X-Forwarded-For', '5.6.7.8');

      expect(response.status).not.toBe(429);
    });
  });
});
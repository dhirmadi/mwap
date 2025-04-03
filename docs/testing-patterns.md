# Testing Patterns and Best Practices

This document outlines common testing patterns and best practices used in the MWAP project.

## Table of Contents
- [Rate Limit Testing](#rate-limit-testing)
- [Authentication Testing](#authentication-testing)
- [Error Handling Testing](#error-handling-testing)

## Rate Limit Testing

### Overview
Rate limiting is a critical security feature that prevents abuse of our API endpoints. Our testing approach ensures that rate limits are correctly enforced while maintaining a good developer experience.

### Rate Limit Configuration
```typescript
// Example rate limit configuration
app.use('/api/auth', createLimiter(15 * 60 * 1000, 25, 'auth:')); // 25 requests per 15 minutes
app.use('/api', createLimiter(60 * 1000, 100, 'api:')); // 100 requests per minute
app.use(createLimiter(60 * 1000, 250)); // 250 requests per minute overall
```

### Testing Patterns

#### 1. Basic Rate Limit Verification
```typescript
describe('Rate Limiting', () => {
  it('should allow requests within limit', async () => {
    const response = await api
      .get('/api/endpoint')
      .set('Accept', 'application/json');

    expect(response.status).not.toBe(429);
    expect(response.headers['x-ratelimit-remaining']).toBeDefined();
  });
});
```

#### 2. Testing Rate Limit Headers
```typescript
it('should include correct rate limit headers', async () => {
  const response = await api.get('/api/endpoint');
  
  expect(response.headers).toMatchObject({
    'x-ratelimit-limit': expect.any(String),
    'x-ratelimit-remaining': expect.any(String),
    'x-ratelimit-reset': expect.any(String)
  });
});
```

#### 3. Testing Limit Exceeded
```typescript
it('should block requests when limit exceeded', async () => {
  // Make multiple requests to exceed limit
  const requests = Array.from({ length: LIMIT + 1 }, () =>
    api.get('/api/endpoint')
  );

  const responses = await Promise.all(requests);
  const blockedResponses = responses.filter(r => r.status === 429);

  expect(blockedResponses.length).toBeGreaterThan(0);
});
```

#### 4. Testing Time Windows
```typescript
describe('Rate Limit Windows', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should reset limits after window expires', async () => {
    // Make requests up to limit
    await makeRequestsToLimit();

    // Advance time beyond window
    jest.advanceTimersByTime(WINDOW_MS);

    // Should be able to make requests again
    const response = await api.get('/api/endpoint');
    expect(response.status).not.toBe(429);
  });
});
```

#### 5. Testing IP-Based Limits
```typescript
it('should track limits by IP address', async () => {
  const response1 = await api
    .get('/api/endpoint')
    .set('X-Forwarded-For', '1.2.3.4');

  const response2 = await api
    .get('/api/endpoint')
    .set('X-Forwarded-For', '5.6.7.8');

  expect(response1.headers['x-ratelimit-remaining'])
    .toBe(response2.headers['x-ratelimit-remaining']);
});
```

### Best Practices

1. **Mock Time in Tests**
   - Use `jest.useFakeTimers()` for time-dependent tests
   - Reset timers after each test
   - Use `jest.advanceTimersByTime()` to simulate window expiration

2. **Test Header Values**
   - Verify presence of all rate limit headers
   - Check header values are numbers
   - Verify remaining count decrements correctly

3. **Handle Concurrent Requests**
   - Use `Promise.all()` for testing multiple concurrent requests
   - Test both sequential and parallel request patterns
   - Verify rate limit behavior under load

4. **Test Different Endpoints**
   - Test overall application limits
   - Test specific endpoint limits
   - Verify limits don't interfere across endpoints

5. **IP Address Testing**
   - Test with and without X-Forwarded-For header
   - Verify separate limits per IP
   - Test proxy IP handling

### Common Pitfalls

1. **Time Dependencies**
   - Don't rely on real time in tests
   - Always use timer mocking
   - Be careful with async operations and timers

2. **Test Isolation**
   - Reset rate limits between tests
   - Don't let rate limits from one test affect others
   - Clean up any test-specific rate limit data

3. **Concurrent Request Handling**
   - Be aware of race conditions in tests
   - Handle Promise rejections properly
   - Consider request timing in assertions

### Example Test Structure
```typescript
describe('Rate Limiting Middleware', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Basic Rate Limiting', () => {
    // Test normal operation
  });

  describe('Limit Exceeded', () => {
    // Test limit exceeded cases
  });

  describe('Time Windows', () => {
    // Test window expiration
  });

  describe('Headers', () => {
    // Test rate limit headers
  });

  describe('IP-Based Limiting', () => {
    // Test IP-specific behavior
  });
});
```

### Debugging Tips

1. **Header Inspection**
   ```typescript
   console.log({
     limit: response.headers['x-ratelimit-limit'],
     remaining: response.headers['x-ratelimit-remaining'],
     reset: response.headers['x-ratelimit-reset']
   });
   ```

2. **Timer Debugging**
   ```typescript
   const before = Date.now();
   jest.advanceTimersByTime(60000);
   const after = Date.now();
   console.log(`Time advanced by: ${after - before}ms`);
   ```

3. **Request Tracking**
   ```typescript
   const responses = await Promise.all(requests);
   console.log({
     total: responses.length,
     successful: responses.filter(r => r.status === 200).length,
     blocked: responses.filter(r => r.status === 429).length
   });
   ```

## Future Considerations

1. **Load Testing Integration**
   - Consider adding k6 or Artillery tests
   - Test rate limiting under real load
   - Measure performance impact

2. **Dynamic Rate Limits**
   - Test rate limit adjustments
   - User-specific rate limits
   - Role-based rate limits

3. **Monitoring Integration**
   - Rate limit metrics collection
   - Alert testing
   - Dashboard integration
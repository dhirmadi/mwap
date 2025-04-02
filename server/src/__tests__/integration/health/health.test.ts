import { createTestClient, TestClient } from '../../utils/setup';

describe('Health Check API', () => {
  let api: TestClient;

  beforeEach(() => {
    api = createTestClient();
  });

  it('should return healthy status', async () => {
    const response = await api
      .get('/health')
      .expect(200)
      .expect('Content-Type', /application\/json/);

    expect(response.body).toMatchObject({
      status: 'healthy',
      environment: expect.any(String),
      timestamp: expect.any(String),
      uptime: expect.any(Number)
    });
  });
});
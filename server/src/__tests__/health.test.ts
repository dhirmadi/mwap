import request from 'supertest';
import express from 'express';
import { env } from '../config/environment';

const app = express();

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    environment: env.getEnvironmentName(),
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

describe('Health Check Endpoint', () => {
  it('should return 200 and correct response structure', async () => {
    const response = await request(app).get('/health');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'healthy');
    expect(response.body).toHaveProperty('environment', 'test');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('uptime');
  });
});
import { Router } from 'express';
import logger from '@core/logging/config';

/**
 * Health check response type
 */
interface HealthResponse {
  ok: boolean;
  uptime: number;
  timestamp: string;
  version: string;
  memory: {
    used: number;
    total: number;
    rss: number;
  };
}

/**
 * Format memory usage in MB
 */
const formatMemory = (bytes: number): number => {
  return Math.round(bytes / 1024 / 1024 * 100) / 100;
};

/**
 * Get memory usage statistics
 */
const getMemoryStats = () => {
  const memoryUsage = process.memoryUsage();
  return {
    used: formatMemory(memoryUsage.heapUsed),
    total: formatMemory(memoryUsage.heapTotal),
    rss: formatMemory(memoryUsage.rss)
  };
};

/**
 * Health check router
 * - Returns service status
 * - Includes uptime and memory stats
 * - No caching allowed
 */
export const healthRouter = Router();

healthRouter.get('/health', (req, res) => {
  // Log health check
  logger.debug('Health check requested', {
    ip: req.ip,
    user_agent: req.headers['user-agent']
  });

  // Get health data
  const health: HealthResponse = {
    ok: true,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '0.0.0',
    memory: getMemoryStats()
  };

  // Set no-cache headers
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Pragma', 'no-cache');

  // Send response
  res.json(health);
});
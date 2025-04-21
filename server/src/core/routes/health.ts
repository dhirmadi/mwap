import { Router } from 'express';
import logger from '@core/logging/config';
import mongoose from 'mongoose';

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
  mongodb: {
    state: number;
    status: string;
    host?: string;
  };
}

/**
 * Format memory usage in MB
 */
const formatMemory = (bytes: number): number => {
  return Math.round(bytes / 1024 / 1024 * 100) / 100;
};

/**
 * Get MongoDB connection status string
 */
const getMongoStatus = (state: number): string => {
  switch (state) {
    case 0: return 'disconnected';
    case 1: return 'connected';
    case 2: return 'connecting';
    case 3: return 'disconnecting';
    case 99: return 'uninitialized';
    default: return 'unknown';
  }
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
    memory: getMemoryStats(),
    mongodb: {
      state: mongoose.connection.readyState,
      status: getMongoStatus(mongoose.connection.readyState),
      host: mongoose.connection.host || undefined
    }
  };

  // Set no-cache headers
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Pragma', 'no-cache');

  // Send response
  res.json(health);
});
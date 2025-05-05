import { Request, Response, NextFunction } from 'express';
import { logger } from '../logger';

interface RequestMetric {
  path: string;
  method: string;
  statusCode: number;
  duration: number;
  timestamp: string;
}

let metrics: RequestMetric[] = [];

/**
 * Collect request metrics middleware
 */
export function collectMetrics() {
  return (req: Request, res: Response, next: NextFunction) => {
    const start = process.hrtime();

    res.on('finish', () => {
      const [seconds, nanoseconds] = process.hrtime(start);
      const duration = seconds * 1000 + nanoseconds / 1000000;

      const metric: RequestMetric = {
        path: req.path,
        method: req.method,
        statusCode: res.statusCode,
        duration,
        timestamp: new Date().toISOString()
      };

      metrics.push(metric);
      logger.debug('Request metrics:', metric);
    });

    next();
  };
}

/**
 * Get all collected metrics
 */
export function getMetrics(): RequestMetric[] {
  return metrics;
}

/**
 * Clear all metrics
 */
export function clearMetrics(): void {
  metrics = [];
}

/**
 * Calculate average response time by path
 */
export function getAverageResponseTime(): Record<string, number> {
  const totals: Record<string, { sum: number; count: number }> = {};

  metrics.forEach((metric) => {
    if (!totals[metric.path]) {
      totals[metric.path] = { sum: 0, count: 0 };
    }
    totals[metric.path].sum += metric.duration;
    totals[metric.path].count++;
  });

  const averages: Record<string, number> = {};
  for (const [path, { sum, count }] of Object.entries(totals)) {
    averages[path] = Math.round(sum / count);
  }

  return averages;
}

/**
 * Calculate error rate by path (percentage)
 */
export function getErrorRate(): Record<string, number> {
  const totals: Record<string, { errors: number; total: number }> = {};

  metrics.forEach((metric) => {
    if (!totals[metric.path]) {
      totals[metric.path] = { errors: 0, total: 0 };
    }
    if (metric.statusCode >= 400) {
      totals[metric.path].errors++;
    }
    totals[metric.path].total++;
  });

  const rates: Record<string, number> = {};
  for (const [path, { errors, total }] of Object.entries(totals)) {
    rates[path] = Math.round((errors / total) * 100);
  }

  return rates;
}
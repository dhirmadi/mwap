import "@jest/globals";
import { Request, Response } from 'express';
import { collectMetrics, getMetrics, clearMetrics, getAverageResponseTime, getErrorRate } from '../../monitoring/metrics';
import { mockLoggerFactory } from '../utils/mockLogger';

describe('Monitoring Metrics Module', () => {
  const mockLogger = mockLoggerFactory();

  beforeEach(() => {
    clearMetrics();
    jest.clearAllMocks();
  });

  describe('collectMetrics middleware', () => {
    it('should collect request metrics', (done) => {
      const middleware = collectMetrics();
      const req = {
        path: '/test',
        method: 'GET'
      } as Request;
      
      const res = {
        statusCode: 200,
        on: (event: string, callback: Function) => {
          if (event === 'finish') {
            setTimeout(() => {
              callback();
              
              const metrics = getMetrics();
              expect(metrics).toHaveLength(1);
              expect(metrics[0]).toMatchObject({
                path: '/test',
                method: 'GET',
                statusCode: 200
              });
              expect(metrics[0].duration).toBeGreaterThan(0);
              expect(metrics[0].timestamp).toBeDefined();
              
              expect(mockLogger.debug).toHaveBeenCalledWith(
                'Request metrics:',
                expect.any(Object)
              );
              
              done();
            }, 10);
          }
        }
      } as unknown as Response;

      const next = jest.fn();
      middleware(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('getAverageResponseTime', () => {
    it('should calculate average response time by path', () => {
      const metrics = [
        { path: '/api/v1', duration: 100, method: 'GET', statusCode: 200, timestamp: new Date().toISOString() },
        { path: '/api/v1', duration: 200, method: 'GET', statusCode: 200, timestamp: new Date().toISOString() },
        { path: '/api/v2', duration: 150, method: 'GET', statusCode: 200, timestamp: new Date().toISOString() }
      ];

      metrics.forEach(metric => {
        const middleware = collectMetrics();
        const req = { path: metric.path, method: metric.method } as Request;
        const res = {
          statusCode: metric.statusCode,
          on: (event: string, callback: Function) => {
            if (event === 'finish') callback();
          }
        } as unknown as Response;
        
        middleware(req, res, jest.fn());
      });

      const averages = getAverageResponseTime();
      expect(averages).toEqual({
        '/api/v1': 150,
        '/api/v2': 150
      });
    });

    it('should handle empty metrics', () => {
      const averages = getAverageResponseTime();
      expect(averages).toEqual({});
    });
  });

  describe('getErrorRate', () => {
    it('should calculate error rate by path', () => {
      const metrics = [
        { path: '/api/v1', duration: 100, method: 'GET', statusCode: 200, timestamp: new Date().toISOString() },
        { path: '/api/v1', duration: 200, method: 'GET', statusCode: 500, timestamp: new Date().toISOString() },
        { path: '/api/v2', duration: 150, method: 'GET', statusCode: 404, timestamp: new Date().toISOString() }
      ];

      metrics.forEach(metric => {
        const middleware = collectMetrics();
        const req = { path: metric.path, method: metric.method } as Request;
        const res = {
          statusCode: metric.statusCode,
          on: (event: string, callback: Function) => {
            if (event === 'finish') callback();
          }
        } as unknown as Response;
        
        middleware(req, res, jest.fn());
      });

      const errorRates = getErrorRate();
      expect(errorRates).toEqual({
        '/api/v1': 50, // 1 out of 2 requests failed
        '/api/v2': 100 // 1 out of 1 request failed
      });
    });

    it('should handle empty metrics', () => {
      const errorRates = getErrorRate();
      expect(errorRates).toEqual({});
    });
  });

  describe('clearMetrics', () => {
    it('should clear all collected metrics', () => {
      const middleware = collectMetrics();
      const req = { path: '/test', method: 'GET' } as Request;
      const res = {
        statusCode: 200,
        on: (event: string, callback: Function) => {
          if (event === 'finish') callback();
        }
      } as unknown as Response;

      middleware(req, res, jest.fn());
      expect(getMetrics()).toHaveLength(1);

      clearMetrics();
      expect(getMetrics()).toHaveLength(0);
    });
  });
});
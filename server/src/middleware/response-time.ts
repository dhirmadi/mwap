import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to add response time header to all responses
 */
export const responseTime = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    const start = process.hrtime();

    // Override res.send to add timing header
    const originalSend = res.send;
    res.send = function(...args: any[]) {
      const [seconds, nanoseconds] = process.hrtime(start);
      const ms = Math.max(1, Math.round((seconds * 1000) + (nanoseconds / 1000000)));
      res.setHeader('x-response-time', ms.toString());
      return originalSend.apply(res, args);
    };

    // Override res.json to add timing header
    const originalJson = res.json;
    res.json = function(...args: any[]) {
      const [seconds, nanoseconds] = process.hrtime(start);
      const ms = Math.max(1, Math.round((seconds * 1000) + (nanoseconds / 1000000)));
      res.setHeader('x-response-time', ms.toString());
      return originalJson.apply(res, args);
    };

    // Override res.end to add timing header
    const originalEnd = res.end;
    res.end = function(...args: any[]) {
      const [seconds, nanoseconds] = process.hrtime(start);
      const ms = Math.max(1, Math.round((seconds * 1000) + (nanoseconds / 1000000)));
      res.setHeader('x-response-time', ms.toString());
      return originalEnd.apply(res, args);
    };

    // Override res.status to add timing header
    const originalStatus = res.status;
    res.status = function(...args: any[]) {
      const [seconds, nanoseconds] = process.hrtime(start);
      const ms = Math.max(1, Math.round((seconds * 1000) + (nanoseconds / 1000000)));
      res.setHeader('x-response-time', ms.toString());
      return originalStatus.apply(res, args);
    };

    // Override res.writeHead to add timing header
    const originalWriteHead = res.writeHead;
    res.writeHead = function(...args: any[]) {
      const [seconds, nanoseconds] = process.hrtime(start);
      const ms = Math.max(1, Math.round((seconds * 1000) + (nanoseconds / 1000000)));
      res.setHeader('x-response-time', ms.toString());
      return originalWriteHead.apply(res, args);
    };

    next();
  };
};
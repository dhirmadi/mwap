import { Request, Response, NextFunction } from 'express';

export const transformResponse = (
  _req: Request,
  res: Response,
  next: NextFunction
): void => {
  const originalJson = res.json;
  res.json = function(body: any): Response {
    if (body && !body.hasOwnProperty('success')) {
      body = {
        success: true,
        data: body
      };
    }
    return originalJson.call(this, body);
  };
  next();
};
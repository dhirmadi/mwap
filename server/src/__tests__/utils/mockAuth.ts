import { Request, Response, NextFunction } from 'express';

// Mock user data
export const mockUser = {
  sub: 'auth0|123456789',
  email: 'test@example.com',
  name: 'Test User',
  picture: 'https://example.com/avatar.jpg'
};

// Mock Auth0 middleware
export const mockAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token === 'valid-token') {
    req.auth = mockUser;
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

// Mock the auth module
jest.mock('express-oauth2-jwt-bearer', () => ({
  auth: () => mockAuthMiddleware
}));

// Mock error handler to not log errors in tests
jest.mock('../../../middleware/errors.js', () => ({
  errorHandler: (err: any, _req: any, res: any, _next: any) => {
    if (err.status) {
      res.status(err.status).json({ error: err.message });
    } else {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}));
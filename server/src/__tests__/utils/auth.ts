import { Request, Response, NextFunction } from 'express';

// Mock user data
export const mockUser = {
  sub: 'auth0|123456789',
  email: 'test@example.com',
  name: 'Test User',
  picture: 'https://example.com/avatar.jpg'
};

// Mock Auth0 middleware
export const mockAuthMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  req.auth = mockUser;
  next();
};

// Generate test tokens
export const getTestToken = () => 'test-token';

// Auth headers helper
export const getAuthHeaders = () => ({
  Authorization: `Bearer ${getTestToken()}`
});
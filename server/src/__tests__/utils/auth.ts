import { Request, Response, NextFunction } from 'express';

// Mock user data
export const mockUser = {
  sub: 'auth0|123456789',
  email: 'test@example.com',
  name: 'Test User',
  picture: 'https://example.com/avatar.jpg'
};

// Mock Auth0 middleware
export const mockAuth = jest.fn((req: Request, _res: Response, next: NextFunction) => {
  req.auth = {
    ...mockUser,
    header: {},
    payload: mockUser,
    token: 'mock-token'
  };
  next();
});

// Mock the auth middleware module
jest.mock('express-oauth2-jwt-bearer', () => ({
  auth: () => mockAuth
}));

// Generate test tokens
export const getTestToken = () => 'test-token';

// Auth headers helper
export const getAuthHeaders = () => ({
  Authorization: `Bearer ${getTestToken()}`
});
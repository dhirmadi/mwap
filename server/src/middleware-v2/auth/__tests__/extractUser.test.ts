import "@jest/globals";
import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { AppError } from '../../../core-v2/errors';
import extractUser, { MWAPUser } from '../extractUser';

// Mock jwks-rsa
jest.mock('jwks-rsa');

// Mock environment variables
process.env.AUTH0_DOMAIN = 'test.auth0.com';
process.env.AUTH0_AUDIENCE = 'https://api.test.com';

// Test key pair (only for testing)
const testKeyPair = {
  privateKey: `-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEAwaZ3afW0/zYy3HfJwAAr83PDdZIN3k5qQd/OB7K7Mb6U5ZIP
6hH8yoZHZp0FnhGqxD4WJM9vOkjGwI4a2mL3zOzXPIWz9tmSIz9/2qe6M+XeWP+R
Vj1/KHczGo1JCvP/xvJ9Du7yqjWVjhX9h+VKZDqpW0TVYVtqO4MgX0QzGZKQh8IW
3Z94h3mQG9bl7QWi1zGGWpECKvc4CFZLjS0J4zOYVvO55BxHB8Yp6tzqrw4e4+DR
JLYBvXE6nmABFdTpgqV4Fl8XgZYxjGWvH2woQzVVwKdkdjnY8rJXnEUwVR8/Yj9t
VZbXYjKqwIHHZjvXTh7DTh1buxiNOKgbGzx3GwIDAQABAoIBAQCBzxwgy8OLrgXG
OvE/zzwTtEZRVW3XzY+tfHSCW4ORbGYm4HW3OGRzYu90YlqxRPwQr0Eww4GZKLnp
Kq8Yt9V+oqm5cavwDCXqK6m2f/q4EGtKH7vnbHhNvV8B1qyP6PZtNdd0Gx0YGj5x
Gy0kR4ExiJk8yvzIbNth6qVN2NZRl3i2GjKGPHE+PhkQ1NXcQaZi/V3z7ihZGUFy
Lz3yfRrmCMXU7jBaNIxVOYr5MQF8L/wj/C5yA5+WQW+oOBGrFXxWBKS2BG5A9iVz
0XEGXjxzXWxQ5EC4vJnV9LHdcGXTzJGxBX8R8wtLJLlRUGo9HBHHzlqCXIVTCOiJ
RAMxvqVhAoGBAOxRZol8LXYRk2tg6N1t5Z3o/Rw7wHHxZFgz3wlk4OvxhMJdPHK4
p/RPvKn1QQEqzGJQXpqVHCGp+5QWqww5YxJ3YUG1N7BYvVHcpVyBVrHKP6/17zVj
TP6AW+/7s3H0z6nCLVRJHvn9Ctcf+ODrTOtNI4/3HGKDQCULEEXNtJDrAoGBANHk
2WZbDYAKY3aeMaffeRqKGz5F2lXYK6XNwqB7wN5V/oMhQgXn+yGf0h98qb4gFb+v
p7Y24CStIHBLZph/4UvZB+xHnHJgF+pHvPmznEJSVHOqHDmjqwAQsFrsnWxvqQKs
1J6AgF+M8nkj0T+19L9L4HCEQDhLh0/vc6wB4+RxAoGAHu4/HVv9wC/aN8K1GvRD
h/ksm/sME9BEOsqBp3HrJOSo1wQ4e6AZZqKWz+TGPGxGWNJdRaQpCx7UDj/NL+Jl
Lm5dXH9C2wDYqpvf6gAmTJkq4H0M0CLjL/XeYQbJ6C+VxHPfmcnE4yxhgKAVmRYn
BLQf0AP1ljOZMYEkJ5ECgYBv94xUvF5bEe/+9FoCp+LFQGgVX3ABM2aNH66pxY8N
qyB5BUq168Yh+2p17+H3HUvRvjj9VGh3Rt8cZHg+7JGgqPrH4f3KD1QEpGjZj8g3
TZbQxCf3rZ6JlLEfqEqy+J3p1HzCfdhP5FrA6IZLYyV3Yzn8oGBAYQXKZvwXgPZe
8QKBgCqxS7HRe4a+RLGGPyQBhJ5MH/JQj96ZbYdire1p0+yN5NpBMT/V7z4c9p+L
Qm6u1RtaHZPSh7BE0bqV9x+FEyhw1n8zVjhfW8sQ5VECXkJ6XcHZeNp+mPRxgnD1
D1yL1Rf/qJ8TE1+F/0h8Kj/mmKRVvtL6WuQYQw0yVxGP1QZd
-----END RSA PRIVATE KEY-----`,
  publicKey: `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwaZ3afW0/zYy3HfJwAAr
83PDdZIN3k5qQd/OB7K7Mb6U5ZIP6hH8yoZHZp0FnhGqxD4WJM9vOkjGwI4a2mL3
zOzXPIWz9tmSIz9/2qe6M+XeWP+RVj1/KHczGo1JCvP/xvJ9Du7yqjWVjhX9h+VK
ZDqpW0TVYVtqO4MgX0QzGZKQh8IW3Z94h3mQG9bl7QWi1zGGWpECKvc4CFZLjS0J
4zOYVvO55BxHB8Yp6tzqrw4e4+DRJLYBvXE6nmABFdTpgqV4Fl8XgZYxjGWvH2wo
QzVVwKdkdjnY8rJXnEUwVR8/Yj9tVZbXYjKqwIHHZjvXTh7DTh1buxiNOKgbGzx3
GwIDAQAB
-----END PUBLIC KEY-----`,
};

// Mock JWKS client response
const mockGetSigningKey = jest.fn().mockImplementation(() => ({
  getPublicKey: () => testKeyPair.publicKey,
}));

(jwksClient as jest.Mock).mockImplementation(() => ({
  getSigningKey: mockGetSigningKey,
}));

describe('extractUser Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockReq = {
      headers: {},
    };
    mockRes = {};
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  const createTestToken = (payload: Partial<MWAPUser> & { exp?: number }, kid = 'test-key-id'): string => {
    const defaultPayload = {
      sub: 'auth0|123',
      email: 'test@example.com',
      roles: ['user'],
      tenantId: 'tenant-123',
      iss: `https://${process.env.AUTH0_DOMAIN}/`,
      aud: process.env.AUTH0_AUDIENCE,
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
      ...payload,
    };

    return jwt.sign(defaultPayload, testKeyPair.privateKey, {
      algorithm: 'RS256',
      header: { kid },
    });
  };

  it('should successfully extract user from valid token', async () => {
    // Create a valid token
    const testUser: MWAPUser = {
      sub: 'auth0|123',
      email: 'test@example.com',
      roles: ['user', 'admin'],
      tenantId: 'tenant-123',
    };
    const token = createTestToken(testUser);

    // Set up request with token
    mockReq.headers = {
      authorization: `Bearer ${token}`,
    };

    // Execute middleware
    await extractUser(mockReq as Request, mockRes as Response, mockNext);

    // Verify JWKS client was called
    expect(mockGetSigningKey).toHaveBeenCalledWith('test-key-id');

    // Verify user was attached to request
    expect(mockReq.user).toEqual(testUser);

    // Verify next was called without error
    expect(mockNext).toHaveBeenCalledWith();
    expect(mockNext).toHaveBeenCalledTimes(1);
  });

  it('should handle missing authorization header', async () => {
    // Execute middleware without auth header
    await extractUser(mockReq as Request, mockRes as Response, mockNext);

    // Verify error handling
    expect(mockNext).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'No token provided',
        code: 'AUTH_NO_TOKEN',
        statusCode: 401,
      })
    );
  });

  it('should handle invalid token format', async () => {
    // Set up request with invalid token
    mockReq.headers = {
      authorization: 'Bearer invalid.token.format',
    };

    // Execute middleware
    await extractUser(mockReq as Request, mockRes as Response, mockNext);

    // Verify error handling
    expect(mockNext).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Invalid token',
        code: 'AUTH_INVALID_TOKEN',
        statusCode: 401,
      })
    );
  });

  it('should handle expired token', async () => {
    // Create an expired token
    const token = createTestToken({
      exp: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
    });

    // Set up request with expired token
    mockReq.headers = {
      authorization: `Bearer ${token}`,
    };

    // Execute middleware
    await extractUser(mockReq as Request, mockRes as Response, mockNext);

    // Verify error handling
    expect(mockNext).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Invalid token',
        code: 'AUTH_INVALID_TOKEN',
        statusCode: 401,
      })
    );
  });

  it('should handle JWKS client errors', async () => {
    // Mock JWKS client error
    mockGetSigningKey.mockRejectedValueOnce(new Error('JWKS client error'));

    // Create a valid token
    const token = createTestToken({});

    // Set up request
    mockReq.headers = {
      authorization: `Bearer ${token}`,
    };

    // Execute middleware
    await extractUser(mockReq as Request, mockRes as Response, mockNext);

    // Verify error handling
    expect(mockNext).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Failed to fetch signing key',
        code: 'AUTH_KEY_ERROR',
        statusCode: 500,
      })
    );
  });

  it('should handle missing user fields', async () => {
    // Create token with minimal fields
    const token = createTestToken({
      sub: 'auth0|123',
      email: 'test@example.com',
      roles: undefined as any, // Test handling of missing roles
      tenantId: undefined,
    });

    // Set up request
    mockReq.headers = {
      authorization: `Bearer ${token}`,
    };

    // Execute middleware
    await extractUser(mockReq as Request, mockRes as Response, mockNext);

    // Verify user was attached with defaults
    expect(mockReq.user).toEqual({
      sub: 'auth0|123',
      email: 'test@example.com',
      roles: [], // Should default to empty array
      tenantId: undefined,
    });

    // Verify next was called without error
    expect(mockNext).toHaveBeenCalledWith();
  });

  it('should handle invalid signing algorithm', async () => {
    // Create token with wrong algorithm
    const token = jwt.sign(
      {
        sub: 'auth0|123',
        email: 'test@example.com',
      },
      'secret', // Use symmetric key instead of RS256
      { algorithm: 'HS256' }
    );

    // Set up request
    mockReq.headers = {
      authorization: `Bearer ${token}`,
    };

    // Execute middleware
    await extractUser(mockReq as Request, mockRes as Response, mockNext);

    // Verify error handling
    expect(mockNext).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Invalid token',
        code: 'AUTH_INVALID_TOKEN',
        statusCode: 401,
      })
    );
  });
});
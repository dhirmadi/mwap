import { Types } from 'mongoose';
import {
  userFactory,
  profileFactory,
  tokenFactory,
  errorFactory,
  requestFactory
} from './factories';

describe('Test Data Factories', () => {
  describe('User Factory', () => {
    it('should create a user with default values', () => {
      const user = userFactory.create();
      expect(user).toMatchObject({
        sub: expect.stringMatching(/^auth0\|[0-9a-f]{24}$/),
        email: expect.stringMatching(/^test\.\d+\.[a-z0-9]+@example\.com$/),
        name: expect.stringMatching(/^Test User \d+\.[a-z0-9]+$/),
        picture: expect.stringMatching(/^https:\/\/example\.com\/avatar\/\d+\.[a-z0-9]+\.jpg$/)
      });
    });

    it('should create a user with overrides', () => {
      const overrides = {
        sub: 'auth0|custom123',
        email: 'custom@example.com'
      };
      const user = userFactory.create(overrides);
      expect(user).toMatchObject(overrides);
    });

    it('should create multiple unique users', () => {
      const users = userFactory.createMany(3);
      expect(users).toHaveLength(3);
      
      // Check uniqueness
      const subs = new Set(users.map(u => u.sub));
      const emails = new Set(users.map(u => u.email));
      expect(subs.size).toBe(3);
      expect(emails.size).toBe(3);
    });
  });

  describe('Profile Factory', () => {
    it('should create a profile from a user', () => {
      const user = userFactory.create();
      const profile = profileFactory.create(user);

      expect(profile).toMatchObject({
        id: user.sub,
        email: user.email,
        name: user.name,
        picture: user.picture,
        preferences: {
          theme: 'light',
          notifications: true,
          language: 'en'
        }
      });

      // Verify dates
      expect(new Date(profile.createdAt).getTime()).toBeLessThanOrEqual(Date.now());
      expect(new Date(profile.updatedAt).getTime()).toBeLessThanOrEqual(Date.now());
    });

    it('should create multiple unique profiles', () => {
      const profiles = profileFactory.createMany(3);
      expect(profiles).toHaveLength(3);
      
      // Check uniqueness
      const ids = new Set(profiles.map(p => p.id));
      const emails = new Set(profiles.map(p => p.email));
      expect(ids.size).toBe(3);
      expect(emails.size).toBe(3);
    });
  });

  describe('Token Factory', () => {
    it('should create tokens for a user', () => {
      const user = userFactory.create();
      const tokens = tokenFactory.create(user);

      expect(tokens).toMatchObject({
        accessToken: expect.stringContaining(user.sub),
        idToken: expect.stringContaining(user.sub),
        expiresIn: expect.any(Number),
        tokenType: 'Bearer'
      });
    });

    it('should create tokens with default user if none provided', () => {
      const tokens = tokenFactory.create();
      expect(tokens).toMatchObject({
        accessToken: expect.stringMatching(/^valid-token-auth0\|[0-9a-f]{24}$/),
        idToken: expect.stringMatching(/^id-token-auth0\|[0-9a-f]{24}$/),
        expiresIn: 86400,
        tokenType: 'Bearer'
      });
    });
  });

  describe('Error Factory', () => {
    it('should create standard error responses', () => {
      const notFound = errorFactory.notFound();
      expect(notFound).toEqual({
        error: 'Not Found',
        message: 'Resource not found'
      });

      const unauthorized = errorFactory.unauthorized();
      expect(unauthorized).toEqual({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    });

    it('should create custom error responses', () => {
      const error = errorFactory.create(409, 'User already exists');
      expect(error).toEqual({
        error: 'Conflict',
        message: 'User already exists'
      });
    });
  });

  describe('Request Factory', () => {
    it('should create request headers', () => {
      const headers = requestFactory.headers();
      expect(headers).toEqual({
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      });
    });

    it('should create auth headers for a user', () => {
      const user = userFactory.create();
      const headers = requestFactory.authHeaders(user);
      expect(headers).toMatchObject({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': expect.stringContaining(user.sub)
      });
    });

    it('should merge extra headers', () => {
      const headers = requestFactory.headers('token123', {
        'X-Custom': 'value'
      });
      expect(headers).toMatchObject({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer token123',
        'X-Custom': 'value'
      });
    });
  });
});
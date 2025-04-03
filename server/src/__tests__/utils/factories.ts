import { Types } from 'mongoose';
import { AuthUser } from '../../types/api';

/**
 * Base factory type for creating test data
 */
interface Factory<T> {
  create(overrides?: Partial<T>): T;
  createMany(count: number, overrides?: Partial<T>): T[];
}

/**
 * User factory for creating test user data
 */
export const userFactory: Factory<AuthUser> = {
  create(overrides = {}) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const defaultUser: AuthUser = {
      sub: `auth0|${new Types.ObjectId().toString()}`,
      email: `test.${timestamp}.${random}@example.com`,
      name: `Test User ${timestamp}.${random}`,
      picture: `https://example.com/avatar/${timestamp}.${random}.jpg`
    };
    return { ...defaultUser, ...overrides };
  },

  createMany(count, overrides = {}) {
    return Array(count).fill(null).map((_, i) => {
      const uniqueOverrides = {
        ...overrides,
        email: overrides.email || `test.${Date.now()}.${i}@example.com`,
        name: overrides.name || `Test User ${Date.now()}.${i}`,
      };
      return this.create(uniqueOverrides);
    });
  }
};

/**
 * Profile data factory for creating test profile data
 */
export const profileFactory = {
  create(user: AuthUser, overrides = {}) {
    const defaultProfile = {
      id: user.sub,
      email: user.email,
      name: user.name,
      picture: user.picture,
      preferences: {
        theme: 'light',
        notifications: true,
        language: 'en'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    return { ...defaultProfile, ...overrides };
  },

  createMany(count: number, overrides = {}) {
    return Array(count)
      .fill(null)
      .map(() => this.create(userFactory.create(), overrides));
  }
};

/**
 * Token factory for creating test tokens
 */
export const tokenFactory = {
  create(user: AuthUser = userFactory.create()) {
    return {
      accessToken: `valid-token-${user.sub}`,
      idToken: `id-token-${user.sub}`,
      expiresIn: 86400,
      tokenType: 'Bearer'
    };
  }
};

/**
 * Error factory for creating test error responses
 */
export const errorFactory = {
  create(status: number, message: string) {
    const errors = {
      400: { error: 'Bad Request', message },
      401: { error: 'Unauthorized', message },
      403: { error: 'Forbidden', message },
      404: { error: 'Not Found', message },
      409: { error: 'Conflict', message },
      413: { error: 'Payload Too Large', message },
      422: { error: 'Unprocessable Entity', message },
      429: { error: 'Too Many Requests', message },
      500: { error: 'Internal Server Error', message }
    };
    return errors[status] || { error: 'Unknown Error', message };
  },

  badRequest(message = 'Invalid request parameters') {
    return this.create(400, message);
  },

  unauthorized(message = 'Unauthorized - No token provided') {
    return { error: message };
  },

  forbidden(message = 'Access denied') {
    return this.create(403, message);
  },

  notFound(message = 'Resource not found') {
    return this.create(404, message);
  },

  tooManyRequests(message = 'Rate limit exceeded') {
    return this.create(429, message);
  }
};

/**
 * Request factory for creating test request data
 */
export const requestFactory = {
  headers(token?: string, extraHeaders = {}) {
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...extraHeaders
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  },

  authHeaders(user: AuthUser = userFactory.create()) {
    return this.headers(tokenFactory.create(user).accessToken);
  }
};
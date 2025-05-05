import jwt from 'jsonwebtoken';
import { AuthenticatedUser, SystemRole } from '../auth/types';

interface TokenOptions {
  sub?: string;
  email?: string;
  name?: string;
  roles?: SystemRole[];
  tenantId?: string;
  expiresIn?: number;
}

export class IntegrationTestAuth {
  // Generate a mock JWT token for testing
  static generateToken(options: TokenOptions = {}): string {
    const defaultUser: AuthenticatedUser = {
      sub: options.sub || `auth0|test-${Date.now()}`,
      email: options.email || 'test@example.com',
      name: options.name || 'Test User',
      roles: options.roles || ['USER'],
      permissions: [],
      isAdmin: options.roles?.includes('ADMIN') || false,
      tenantId: options.tenantId
    };

    return jwt.sign(
      {
        ...defaultUser,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (options.expiresIn || 3600)
      }, 
      process.env.JWT_SECRET || 'test-secret'
    );
  }

  // Create test users with different roles
  static createTestUsers() {
    return {
      superAdmin: this.generateToken({ 
        roles: ['SUPER_ADMIN'], 
        name: 'Super Admin',
        email: 'superadmin@test.com'
      }),
      admin: this.generateToken({ 
        roles: ['ADMIN'], 
        name: 'Admin User',
        email: 'admin@test.com'
      }),
      user: this.generateToken({ 
        roles: ['USER'], 
        name: 'Regular User',
        email: 'user@test.com'
      }),
      guest: this.generateToken({ 
        roles: ['GUEST'], 
        name: 'Guest User',
        email: 'guest@test.com'
      })
    };
  }

  // Validate token generation
  static validateToken(token: string): boolean {
    try {
      jwt.verify(token, process.env.JWT_SECRET || 'test-secret');
      return true;
    } catch {
      return false;
    }
  }
}

// Utility for mocking authenticated requests
export function mockAuthenticatedRequest(
  app: any, 
  method: string, 
  path: string, 
  token: string
) {
  const request = (method === 'get' ? app.get(path) : app.post(path))
    .set('Authorization', `Bearer ${token}`);
  
  return request;
}
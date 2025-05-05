import { 
  AuthenticatedUserSchema, 
  SystemRole, 
  hasRole, 
  getUserCapabilities 
} from './types';

describe('Authentication System', () => {
  describe('User Schema Validation', () => {
    it('should validate a complete user object', () => {
      const validUser = {
        sub: 'auth0|123456',
        email: 'test@example.com',
        name: 'Test User',
        roles: ['USER'],
        permissions: ['read:profile'],
        isAdmin: false
      };

      const result = AuthenticatedUserSchema.safeParse(validUser);
      expect(result.success).toBe(true);
    });

    it('should reject invalid user objects', () => {
      const invalidUsers = [
        { sub: '' }, // Missing required fields
        { 
          sub: 'auth0|123456', 
          email: 'invalid-email' // Invalid email
        }
      ];

      invalidUsers.forEach(user => {
        const result = AuthenticatedUserSchema.safeParse(user);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('Role Hierarchy', () => {
    const testCases = [
      { 
        userRoles: ['SUPER_ADMIN'], 
        checkRoles: ['ADMIN', 'USER', 'GUEST'],
        expected: true 
      },
      { 
        userRoles: ['ADMIN'], 
        checkRoles: ['USER', 'GUEST'],
        expected: true 
      },
      { 
        userRoles: ['USER'], 
        checkRoles: ['GUEST'],
        expected: true 
      },
      { 
        userRoles: ['GUEST'], 
        checkRoles: ['SUPER_ADMIN'],
        expected: false 
      }
    ];

    testCases.forEach(({ userRoles, checkRoles, expected }) => {
      it(`should ${expected ? 'allow' : 'deny'} roles for ${userRoles}`, () => {
        const user = {
          sub: 'test-user',
          email: 'test@example.com',
          name: 'Test User',
          roles: userRoles as SystemRole[]
        };

        const result = checkRoles.every(role => 
          hasRole(user, role as SystemRole) === expected
        );

        expect(result).toBe(true);
      });
    });
  });

  describe('User Capabilities', () => {
    it('should extract user capabilities correctly', () => {
      const user = {
        sub: 'auth0|123456',
        email: 'admin@example.com',
        name: 'Admin User',
        roles: ['ADMIN'],
        permissions: ['read:users', 'write:users'],
        isAdmin: true
      };

      const capabilities = getUserCapabilities(user);

      expect(capabilities).toEqual({
        roles: ['ADMIN'],
        permissions: ['read:users', 'write:users'],
        isAdmin: true
      });
    });
  });
});
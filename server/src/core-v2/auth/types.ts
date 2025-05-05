import { z } from 'zod';

// Enum for system-wide roles
export const SystemRole = z.enum([
  'SUPER_ADMIN', 
  'ADMIN', 
  'USER', 
  'GUEST'
]);
export type SystemRole = z.infer<typeof SystemRole>;

// Comprehensive user schema with runtime validation
export const AuthenticatedUserSchema = z.object({
  sub: z.string(), // Auth0 unique identifier
  email: z.string().email(),
  name: z.string(),
  picture: z.string().url().optional(), // Profile picture URL
  roles: z.array(SystemRole).default(['USER']),
  permissions: z.array(z.string()).default([]),
  tenantId: z.string().optional(),
  isAdmin: z.boolean().default(false)
});

export type AuthenticatedUser = z.infer<typeof AuthenticatedUserSchema>;

// Type guard for user validation
export function isValidUser(user: unknown): user is AuthenticatedUser {
  return AuthenticatedUserSchema.safeParse(user).success;
}

// Utility for extracting roles and permissions
export function getUserCapabilities(user: AuthenticatedUser) {
  return {
    roles: user.roles,
    permissions: user.permissions,
    isAdmin: user.isAdmin
  };
}

// Role hierarchy and inheritance
export const ROLE_HIERARCHY: Record<SystemRole, string[]> = {
  'SUPER_ADMIN': ['ADMIN', 'USER', 'GUEST'],
  'ADMIN': ['USER', 'GUEST'],
  'USER': ['GUEST'],
  'GUEST': []
};

// Check if a user has a specific role
export function hasRole(user: AuthenticatedUser, requiredRole: SystemRole): boolean {
  return user.roles.includes(requiredRole) || 
         user.roles.some(role => 
           ROLE_HIERARCHY[role as SystemRole]?.includes(requiredRole)
         );
}

// Check if a user has any of the specified roles
export function hasAnyRole(user: AuthenticatedUser, requiredRoles: SystemRole[]): boolean {
  return requiredRoles.some(role => hasRole(user, role));
}
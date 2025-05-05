import { Request } from 'express';
import { AuthenticatedUserSchema, AuthenticatedUser } from './types';
import { AppError } from '../errors/AppError';

// Extract authenticated user from request
export function extractUser(req: Request): AuthenticatedUser {
  if (!req.auth) {
    throw AppError.unauthorized('No authentication information available');
  }

  const userValidation = AuthenticatedUserSchema.safeParse({
    sub: req.auth.sub,
    email: req.auth.email || 'unknown@example.com',
    name: req.auth.name || 'Unknown User',
    picture: req.auth.picture,
    roles: req.auth.roles || ['USER'],
    tenantId: req.auth.tenantId
  });

  if (!userValidation.success) {
    throw AppError.forbidden('Invalid user profile');
  }

  return userValidation.data;
}

// Get user ID safely
export function getUserId(req: Request): string {
  const user = extractUser(req);
  return user.sub;
}

// Check if user is an admin
export function isAdmin(req: Request): boolean {
  const user = extractUser(req);
  return user.isAdmin || user.roles.includes('ADMIN');
}

// Safely get user's tenant ID
export function getUserTenantId(req: Request): string | undefined {
  const user = extractUser(req);
  return user.tenantId;
}
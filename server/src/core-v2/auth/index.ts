// Centralized exports for authentication module
export { 
  UserIdentity, 
  assertValidUserId, 
  userIdentityConfig 
} from './userIdentity';

export { 
  AuthenticatedUser, 
  AuthenticatedUserSchema, 
  SystemRole,
  isValidUser,
  getUserCapabilities,
  hasRole,
  hasAnyRole
} from './types';

export { 
  jwtCheck,
  requireAuth, 
  requireRoles,
  requireTenantOwner 
} from './middleware';

export { 
  extractUser, 
  getUserId, 
  isAdmin,
  getUserTenantId 
} from './utils';
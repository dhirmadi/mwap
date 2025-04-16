// Auth types
export type { 
  User,
  Auth0Claims,
  UserProfile,
  AuthRequest
} from './auth';

// Middleware types
export type {
  AsyncHandler,
  RoleHandler,
  AuthMiddleware,
  ValidationMiddleware,
  TenantMiddleware
} from './middleware';

// Error types
export type { ErrorMetadata } from './errors/base';
export { BaseError } from './errors/base';

// Response types
export type {
  ErrorResponseBase,
  ValidationErrorResponse,
  DuplicateKeyErrorResponse,
  SuccessResponse,
  PaginationMeta,
  ResponseMetadata,
  OrderDirection,
  MongoError,
  MongoValidationError,
  ValidatorError
} from './responses';

// Express types
export type {
  AsyncRequestHandler,
  AsyncController
} from './express';
/** @deprecated Use equivalent functionality from v2 modules instead. This module will be removed in a future release. */

import { Handler, Request, Response, NextFunction, RequestHandler } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';
import { CorsOptions } from 'cors';

export type AsyncHandler = (
  req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
  res: Response<any, Record<string, any>>,
  next: NextFunction
) => Promise<void>;

export type RoleHandler = (roles: string[]) => AsyncHandler;

export interface AuthMiddleware {
  // Basic token validation and user extraction
  validateToken: Handler;
  extractUser: Handler;
  validateRequest: Handler[];

  // Role-based access control
  requireRoles: RoleHandler;
  requireAdmin: Handler[];
  requireSuperAdmin: Handler[];

  // User validation
  requireUser: Handler;
  requireUserAndToken: Handler[];

  // Tenant role combinations
  requireTenantAdmin: Handler[];
  requireTenantMember: Handler[];
  requireTenantOwner: Handler[];
}

export interface ValidationMiddleware {
  validateRequest: (schema: any) => Handler;
}

export interface TenantMiddleware {
  requireNoTenant: () => Handler;
  requireTenantAccess: (role?: string) => Handler;
}

// Security middleware
export interface SecurityMiddleware {
  configureCors: () => RequestHandler;
  corsConfig: CorsOptions;
}
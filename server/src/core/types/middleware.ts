import { Handler, Request, Response, NextFunction } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';

export type AsyncHandler = (
  req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
  res: Response<any, Record<string, any>>,
  next: NextFunction
) => Promise<void>;

export type RoleHandler = (roles: string[]) => AsyncHandler;

export interface AuthMiddleware {
  // Basic token validation
  validateToken: Handler;

  // Role-based access control
  requireRoles: RoleHandler;
  requireAdmin: Handler[];
  requireSuperAdmin: Handler[];

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
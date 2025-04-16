import { Router, Request, Response, NextFunction, RequestHandler } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';

/**
 * Type-safe router that accepts both standard Request and AuthRequest handlers
 */
export interface TypedRouter extends Router {
  get: RouterMethod;
  post: RouterMethod;
  put: RouterMethod;
  delete: RouterMethod;
  patch: RouterMethod;
}

type RouterMethod = ((
  path: string,
  ...handlers: Array<
    | RequestHandler<ParamsDictionary, any, any, ParsedQs, Record<string, any>>
    | ((req: Request, res: Response, next: NextFunction) => Promise<void> | void)
  >
) => Router);

/**
 * Create a type-safe router instance
 */
export function createRouter(): TypedRouter {
  return Router() as TypedRouter;
}
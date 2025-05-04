/** @deprecated Use equivalent functionality from v2 modules instead. This module will be removed in a future release. */

import { Router, Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Type-safe router that accepts both standard Request and AuthRequest handlers
 */
export type TypedRouter = Router;

/**
 * Create a type-safe router instance
 */
export function createRouter(): TypedRouter {
  return Router();
}
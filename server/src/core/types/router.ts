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
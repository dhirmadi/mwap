import { Request, Response } from 'express';
import { User } from '@core/types/auth';

/**
 * Extended Express Request with auth user and request ID
 */
export interface AuthRequest extends Request {
  user: User;  // Required after auth middleware
  id: string;  // Request ID from middleware
}

export type AsyncRequestHandler = (
  req: AuthRequest,
  res: Response
) => Promise<void> | void;

export type AsyncController = {
  [key: string]: AsyncRequestHandler;
};
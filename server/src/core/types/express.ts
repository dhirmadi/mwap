import { Request, Response } from 'express';
import { User } from '@core/types/auth';

export interface AuthRequest extends Request {
  user?: User;
}

export type AsyncRequestHandler = (
  req: AuthRequest,
  res: Response
) => Promise<Response | void> | Response | void;

export type AsyncController = {
  [key: string]: AsyncRequestHandler;
};
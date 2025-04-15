import { Request, Response } from 'express';
import { User } from '@core/types/auth';

export interface AuthRequest extends Request {
  user?: User;
}

export type AsyncRequestHandler = (
  req: AuthRequest,
  res: Response
) => Promise<any> | any;

export type AsyncController = {
  [key: string]: AsyncRequestHandler;
};
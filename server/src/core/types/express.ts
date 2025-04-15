import { Request, Response } from 'express';

export type AsyncRequestHandler = (
  req: Request,
  res: Response
) => Promise<void> | void;

export type AsyncController = {
  [key: string]: AsyncRequestHandler;
};
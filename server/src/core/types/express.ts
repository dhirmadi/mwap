import { Request, Response } from 'express';

export type AsyncRequestHandler = (
  req: Request,
  res: Response
) => Promise<any> | any;

export type AsyncController = {
  [key: string]: AsyncRequestHandler;
};
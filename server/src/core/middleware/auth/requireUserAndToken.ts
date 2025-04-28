import { Request, Response, NextFunction } from 'express';
import { validateToken } from './validateToken';
import { requireUser } from './requireUser';

export const requireUserAndToken = [validateToken, requireUser];
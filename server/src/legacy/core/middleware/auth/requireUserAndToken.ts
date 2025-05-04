/** @deprecated Use equivalent functionality from v2 modules instead. This module will be removed in a future release. */

import { Request, Response, NextFunction } from 'express';
import { validateToken } from './validateToken';
import { requireUser } from './requireUser';

export const requireUserAndToken = [validateToken, requireUser];
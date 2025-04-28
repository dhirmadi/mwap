import { Request, Response, NextFunction } from 'express';
import { requireRoles } from './requireRoles';

export const requireAdmin = requireRoles('admin', 'superadmin');
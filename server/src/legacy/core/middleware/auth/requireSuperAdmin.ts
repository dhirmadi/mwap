/** @deprecated Use equivalent functionality from v2 modules instead. This module will be removed in a future release. */

import { Request, Response, NextFunction } from 'express';
import { requireRoles } from './requireRoles';

export const requireSuperAdmin = requireRoles('superadmin');
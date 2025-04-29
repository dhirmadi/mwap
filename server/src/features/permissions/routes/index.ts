import { Router } from 'express';
import { validateToken } from '@core/middleware/auth/validateToken';
import { extractUser } from '@core/middleware/auth/extractUser';
import { requireUser } from '@core/middleware/auth/requireUser';
import { validateRequest } from '@core/middleware/validation/requestValidation';
import { tenantQuerySchema } from '@features/tenant/schemas/validation';
import { PermissionController } from '../controllers';

const router = Router();

// Common middleware chains
const requireAuth = [validateToken, extractUser, requireUser];

// Get user permissions for a tenant
router.get(
  '/',
  validateRequest(tenantQuerySchema),
  ...requireAuth,
  PermissionController.getPermissions
);

export default router;
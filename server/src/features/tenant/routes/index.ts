import { Router } from 'express';
import { TenantController } from '@features/tenant/controllers';
import { auth } from '@core/middleware/auth';
import { validateRequest } from '@core/middleware/validation';
import { logger } from '@core/utils/logger';
import { 
  createTenantSchema,
  updateTenantSchema
} from '../schemas';

const router = Router();

// Create new tenant (requires auth)
router.post(
  '/',
  auth.validateToken,

  validateRequest(createTenantSchema),
  TenantController.createTenant
);

// Get current user's tenant
router.get(
  '/me',
  auth.validateToken,
  TenantController.getCurrentTenant
);

// Update tenant (requires auth + tenant ownership)
router.patch(
  '/:id',
  ...auth.requireTenantOwner,
  validateRequest(updateTenantSchema),
  TenantController.updateTenant
);

// Delete tenant (requires auth + tenant ownership)
router.delete(
  '/:id',
  ...auth.requireTenantOwner,
  TenantController.archiveTenant
);

// Health check (no auth required)
router.get('/health', (_req, res) => {
  res.json({ 
    ok: true,
    timestamp: new Date().toISOString()
  });
});

export { router as tenantRoutes };
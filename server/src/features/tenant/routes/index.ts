import { Router } from 'express';
import { TenantController } from './controller';
import { auth } from '../../core/middleware/auth';

const router = Router();

// Create new tenant (requires auth + no existing tenant)
router.post(
  '/tenant',
  auth.validateToken,
  TenantController.createTenant
);

// Get current user's tenant
router.get(
  '/tenant/me',
  auth.validateToken,
  TenantController.getCurrentTenant
);

// Update tenant (requires auth + tenant ownership)
router.patch(
  '/tenant/:id',
  auth.requireTenantAdmin,
  TenantController.updateTenant
);

export { router };

router.get('/health', (req, res) => {
  res.json({ ok: true });
});
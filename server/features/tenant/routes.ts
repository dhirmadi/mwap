import { Router } from 'express';
import { TenantController } from './controller';
import { withAuth } from '../../middleware/auth';
import { requireNoTenant, requireTenantOwner } from '../../middleware/tenant';

const router = Router();

// Create new tenant (requires auth + no existing tenant)
router.post(
  '/tenant',
  withAuth(),
  requireNoTenant(),
  TenantController.createTenant
);

// Get current user's tenant
router.get(
  '/tenant/me',
  withAuth(),
  TenantController.getCurrentTenant
);

// Update tenant (requires auth + tenant ownership)
router.patch(
  '/tenant/:id',
  withAuth(),
  requireTenantOwner(),
  TenantController.updateTenant
);

export { router };

router.get('/health', (req, res) => {
  res.json({ ok: true });
});
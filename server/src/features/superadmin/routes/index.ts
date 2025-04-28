import { Router } from 'express';
import { SuperAdminController } from '@features/superadmin/controllers';
import { validateToken } from '@core/middleware/auth/validateToken';
import { requireSuperAdmin } from '@core/middleware/auth/requireSuperAdmin';

const router = Router();

// List all tenants (paginated)
router.get(
  '/admin/tenants',
  validateToken,
  requireSuperAdmin(),
  SuperAdminController.listTenants
);

// List all projects (paginated)
router.get(
  '/admin/projects',
  validateToken,
  requireSuperAdmin(),
  SuperAdminController.listProjects
);

// Archive tenant and all its projects
router.patch(
  '/admin/tenant/:id/archive',
  validateToken,
  requireSuperAdmin(),
  SuperAdminController.archiveTenant
);

export { router as adminRoutes };
import { Router } from 'express';
import { SuperAdminController } from '@features/superadmin/controllers';
import { auth } from '@core/middleware/auth';
import { requireSuperAdmin } from '@core/middleware/admin';

const router = Router();

// List all tenants (paginated)
router.get(
  '/admin/tenants',
  auth.validateToken,
  requireSuperAdmin(),
  SuperAdminController.listTenants
);

// List all projects (paginated)
router.get(
  '/admin/projects',
  auth.validateToken,
  requireSuperAdmin(),
  SuperAdminController.listProjects
);

// Archive tenant and all its projects
router.patch(
  '/admin/tenant/:id/archive',
  auth.validateToken,
  requireSuperAdmin(),
  SuperAdminController.archiveTenant
);

export { router };
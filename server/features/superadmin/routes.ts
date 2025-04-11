import { Router } from 'express';
import { SuperAdminController } from './controller';
import { withAuth } from '../../middleware/auth';
import { requireSuperAdmin } from '../../middleware/admin';

const router = Router();

// List all tenants (paginated)
router.get(
  '/admin/tenants',
  withAuth(),
  requireSuperAdmin(),
  SuperAdminController.listTenants
);

// List all projects (paginated)
router.get(
  '/admin/projects',
  withAuth(),
  requireSuperAdmin(),
  SuperAdminController.listProjects
);

// Archive tenant and all its projects
router.patch(
  '/admin/tenant/:id/archive',
  withAuth(),
  requireSuperAdmin(),
  SuperAdminController.archiveTenant
);

export { router };
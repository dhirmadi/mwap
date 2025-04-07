import { Router } from 'express';
import { TenantController } from '../controllers/tenant.controller';
import { asyncHandler } from '../utils/async-handler';

const router = Router();

// Public tenant routes (still requires authentication)
router.post('/tenants/request', asyncHandler(TenantController.requestTenant));

// Admin-only routes
router.get('/admin/tenants/pending', asyncHandler(TenantController.listPendingTenants));
router.post('/admin/tenants/:id/approve', asyncHandler(TenantController.approveTenant));
router.post('/admin/tenants/:id/archive', asyncHandler(TenantController.archiveTenant));

export const tenantRoutes = router;
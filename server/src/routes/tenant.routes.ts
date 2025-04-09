import { Router } from 'express';
import { TenantController } from '../controllers/tenant.controller';
import { asyncHandler } from '../utils/async-handler';

const router = Router();

// Add debug logging to tenant request handler
const requestTenantWithLogging = async (req, res, next) => {
  console.log('Tenant creation requested by:', req.user?.auth0Id);
  return TenantController.requestTenant(req, res, next);
};

// Public tenant routes (still requires authentication)
router.post('/request', asyncHandler(requestTenantWithLogging));

// Admin-only routes
router.get('/pending', asyncHandler(TenantController.listPendingTenants));
router.post('/:id/approve', asyncHandler(TenantController.approveTenant));
router.post('/:id/archive', asyncHandler(TenantController.archiveTenant));

// Export both names for compatibility
module.exports = {
  tenantRouter: router,
  tenantRoutes: router
};
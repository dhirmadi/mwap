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

// Log all requests to tenant routes
router.use((req, res, next) => {
  logger.debug('Tenant route accessed', {
    method: req.method,
    path: req.path,
    originalUrl: req.originalUrl,
    baseUrl: req.baseUrl,
    body: req.body,
    headers: {
      'content-type': req.headers['content-type'],
      'authorization': req.headers.authorization ? 'present' : 'missing'
    },
    routes: router.stack
      .filter((r: any) => r.route)
      .map((r: any) => ({
        path: r.route.path,
        methods: Object.keys(r.route.methods)
      }))
  });
  next();
});

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
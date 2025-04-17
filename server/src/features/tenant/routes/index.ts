import { Router } from 'express';
import { TenantController } from '@features/tenant/controllers';
import { auth } from '@core/middleware/auth';
import { validateRequest } from '@core/middleware/validation';
import { logger } from '@core/utils/logger';
import { 
  createTenantSchema,
  updateTenantSchema,
  tenantIdSchema
} from '../schemas/validation';
import integrationRoutes from './integrations.routes';

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
  auth.requireUserAndToken,
  validateRequest(createTenantSchema),
  TenantController.createTenant
);

// Get current user's tenant
router.get(
  '/me',
  auth.requireUserAndToken,
  TenantController.getCurrentTenant
);

// Get specific tenant (requires auth + tenant ownership)
router.get(
  '/:id',
  ...auth.requireTenantOwner,
  validateRequest(tenantIdSchema, 'params'),
  TenantController.getTenant
);

// Update tenant (requires auth + tenant ownership)
router.patch(
  '/:id',
  ...auth.requireTenantOwner,
  validateRequest(tenantIdSchema, 'params'),
  validateRequest(updateTenantSchema, 'body'),
  TenantController.updateTenant
);

// Delete tenant (requires auth + tenant ownership)
router.delete(
  '/:id',
  ...auth.requireTenantOwner,
  validateRequest(tenantIdSchema, 'params'),
  TenantController.archiveTenant
);

// Health check (no auth required)
router.get('/health', (_req, res) => {
  res.json({ 
    ok: true,
    timestamp: new Date().toISOString()
  });
});

// Integration routes (requires auth + tenant ownership)
router.use(
  '/:id/integrations',
  auth.requireUserAndToken,
  validateRequest(tenantIdSchema, 'params'),
  integrationRoutes
);

export { router as tenantRoutes };
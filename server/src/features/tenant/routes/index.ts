import { Router } from 'express';
import { TenantController } from '@features/tenant/controllers';
import { validateToken } from '@core/middleware/auth/validateToken';
import { extractUser } from '@core/middleware/auth/extractUser';
import { requireUser } from '@core/middleware/auth/requireUser';
import { verifyTenantOwner } from '@core/middleware/scoping/verifyTenantOwner';
import { validateRequest } from '@core/middleware/validation/requestValidation';
import { logger } from '@core/utils/logger';
import { createTenantSchema, updateTenantSchema } from '@features/tenant/validation';
import { tenantIdSchema } from '../schemas/validation';
import integrationRoutes from './integrations.routes';

const router = Router();

// Common middleware chains
const requireAuth = [validateToken, extractUser, requireUser];
const requireTenantOwner = [validateToken, validateRequest(tenantIdSchema), extractUser, verifyTenantOwner];

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
  ...requireAuth,
  validateRequest(createTenantSchema),
  TenantController.createTenant
);

// Get current user's tenant
router.get(
  '/me',
  ...requireAuth,
  TenantController.getCurrentTenant
);

// Get specific tenant (requires auth + tenant ownership)
router.get(
  '/:id',
  ...requireTenantOwner,
  TenantController.getTenant
);

// Update tenant (requires auth + tenant ownership)
router.patch(
  '/:id',
  ...requireTenantOwner,
  validateRequest(updateTenantSchema),
  TenantController.updateTenant
);

// Delete tenant (requires auth + tenant ownership)
router.delete(
  '/:id',
  ...requireTenantOwner,
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
  ...requireTenantOwner,
  integrationRoutes
);

export { router as tenantRoutes };
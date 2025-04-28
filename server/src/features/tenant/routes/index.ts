import { Router } from 'express';
import { TenantController } from '@features/tenant/controllers';
import { validateToken } from '@core/middleware/auth/validateToken';
import { extractUser } from '@core/middleware/auth/extractUser';
import { requireUser } from '@core/middleware/auth/requireUser';
import { verifyTenantOwner } from '@core/middleware/scoping/verifyTenantOwner';
import { validateRequest } from '@core/middleware/validation/requestValidation';
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
  validateToken,
  validateRequest(createTenantSchema),
  TenantController.createTenant
);

// Get current user's tenant
router.get(
  '/me',
  validateToken,
  extractUser,  
  requireUser, 
  TenantController.getCurrentTenant
);

// Get specific tenant (requires auth + tenant ownership)
router.get(
  '/:id',
  validateToken,
  extractUser,
  verifyTenantOwner,
  validateRequest(tenantIdSchema),
  TenantController.getTenant
);

// Update tenant (requires auth + tenant ownership)
router.patch(
  '/:id',
  validateToken,
  extractUser,
  verifyTenantOwner,
  validateRequest(tenantIdSchema),
  validateRequest(updateTenantSchema),
  TenantController.updateTenant
);

// Delete tenant (requires auth + tenant ownership)
router.delete(
  '/:id',
  validateToken,
  extractUser,
  verifyTenantOwner,
  validateRequest(tenantIdSchema),
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
  validateToken,
  validateRequest(tenantIdSchema),
  integrationRoutes
);

export { router as tenantRoutes };
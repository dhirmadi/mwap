import { Router } from 'express';
import { TenantController } from './controller';
import { requireAuth } from '@core/middleware/auth';
import { requireTenantOwner } from './middleware';

const router = Router();

// Apply authentication to all routes
router.use(requireAuth);

router.post('/', TenantController.createTenant);
router.get('/:id', requireTenantOwner, TenantController.getTenant);
router.patch('/:id', requireTenantOwner, TenantController.updateTenant);
router.delete('/:id', requireTenantOwner, TenantController.archiveTenant);

export default router;
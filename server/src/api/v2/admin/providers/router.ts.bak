import { Router } from 'express';
import { CloudProviderController } from './controller';
import { requireAuth } from '@core-v2/auth';
import { requireRole } from '@core-v2/auth/roles';

const router = Router();

// Apply authentication and admin role check to all routes
router.use(requireAuth);
router.use(requireRole(['superadmin']));

router.post('/', CloudProviderController.createCloudProvider);
router.get('/', CloudProviderController.listCloudProviders);
router.patch('/:id', CloudProviderController.updateCloudProvider);
router.delete('/:id', CloudProviderController.deleteCloudProvider);

export default router;
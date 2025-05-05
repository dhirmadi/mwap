import { Router } from 'express';
import { ProjectTypeController } from './controller';
import { requireAuth } from '@core-v2/auth';
import { requireRole } from '@core-v2/auth/roles';

const router = Router();

// Apply authentication and admin role check to all routes
router.use(requireAuth);
router.use(requireRole(['superadmin']));

router.post('/', ProjectTypeController.createProjectType);
router.get('/', ProjectTypeController.listProjectTypes);
router.patch('/:id', ProjectTypeController.updateProjectType);
router.delete('/:id', ProjectTypeController.deleteProjectType);

export default router;
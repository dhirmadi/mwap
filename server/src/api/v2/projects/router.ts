import { Router } from 'express';
import { ProjectController } from './controller';
import { requireAuth } from '@core/middleware/auth';
import { requireTenantOwner } from '@core/middleware/auth/requireTenantOwner';

const router = Router();

router.use(requireAuth);
router.use(requireTenantOwner);

router.post('/', ProjectController.createProject);
router.get('/:id', ProjectController.getProject);
router.patch('/:id', ProjectController.updateProject);
router.delete('/:id', ProjectController.archiveProject);

export default router;
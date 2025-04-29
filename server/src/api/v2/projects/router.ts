import { Router } from 'express';
import { ProjectController } from './controller';
import { requireAuth } from '../../../middleware/auth';
import { requireTenantOwner } from '../../../middleware/tenant';

const router = Router();

router.use(requireAuth);
router.use(requireTenantOwner);

router.post('/', ProjectController.createProject);
router.get('/:id', ProjectController.getProject);
router.patch('/:id', ProjectController.updateProject);
router.delete('/:id', ProjectController.archiveProject);

export default router;
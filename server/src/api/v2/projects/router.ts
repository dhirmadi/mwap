import { Router } from 'express';
import { ProjectController } from './controller';
import { requireAuth } from '@core/middleware/auth';
import { requireTenantOwner } from '@core/middleware/auth/requireTenantOwner';
import { verifyProjectRole } from '@core/middleware/auth/verifyProjectRole';

const router = Router();

router.use(requireAuth);
router.use(requireTenantOwner);

router.post('/', ProjectController.createProject);
router.get('/:id', ProjectController.getProject);
router.patch('/:id', ProjectController.updateProject);
router.delete('/:id', ProjectController.archiveProject);

// Member management
router.post(
  '/:id/members',
  verifyProjectRole(['OWNER', 'DEPUTY']),
  ProjectController.addMember
);

router.delete(
  '/:id/members/:userId',
  verifyProjectRole(['OWNER', 'DEPUTY']),
  ProjectController.removeMember
);

router.patch(
  '/:id/members/:userId',
  verifyProjectRole(['OWNER', 'DEPUTY']),
  ProjectController.updateMemberRole
);

export default router;
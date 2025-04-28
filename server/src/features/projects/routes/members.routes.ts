import { Router } from 'express';
import { ProjectMemberController } from '../controllers/members.controller';
import { validateToken } from '@core/middleware/auth/validateToken';
import { verifyProjectRole } from '@core/middleware/scoping/verifyProjectRole';
import { ProjectRole } from '@features/projects/schemas';

const router = Router();

// Update member role (requires admin/deputy role)
router.patch(
  '/projects/:id/members/:userId',
  validateToken,
  verifyProjectRole([ProjectRole.OWNER, ProjectRole.DEPUTY]),
  ProjectMemberController.updateMemberRole
);

// Remove member (requires admin/deputy role)
router.delete(
  '/projects/:id/members/:userId',
  validateToken,
  verifyProjectRole([ProjectRole.OWNER, ProjectRole.DEPUTY]),
  ProjectMemberController.removeMember
);

export { router };
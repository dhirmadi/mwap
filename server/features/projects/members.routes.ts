import { Router } from 'express';
import { ProjectMemberController } from './members.controller';
import { withAuth } from '../../middleware/auth';
import { requireProjectRole } from '../../middleware/tenant';

const router = Router();

// Update member role (requires admin/deputy role)
router.patch(
  '/projects/:id/members/:userId',
  withAuth(),
  requireProjectRole(['admin', 'deputy']),
  ProjectMemberController.updateMemberRole
);

// Remove member (requires admin/deputy role)
router.delete(
  '/projects/:id/members/:userId',
  withAuth(),
  requireProjectRole(['admin', 'deputy']),
  ProjectMemberController.removeMember
);

export { router };
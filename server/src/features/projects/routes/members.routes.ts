import { Router } from 'express';
import { ProjectMemberController } from '../controllers/members.controller';
import { auth } from '@core/middleware/auth';
import { requireProjectRole } from '@core/middleware/tenant';

const router = Router();

// Update member role (requires admin/deputy role)
router.patch(
  '/projects/:id/members/:userId',
  auth.validateToken,
  requireProjectRole(['admin', 'deputy']),
  ProjectMemberController.updateMemberRole
);

// Remove member (requires admin/deputy role)
router.delete(
  '/projects/:id/members/:userId',
  auth.validateToken,
  requireProjectRole(['admin', 'deputy']),
  ProjectMemberController.removeMember
);

export { router };
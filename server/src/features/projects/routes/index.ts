import { Router } from 'express';
import { ProjectController } from '@features/projects/controllers';
import { ProjectMemberController } from '@features/projects/controllers/members.controller';
import { auth } from '@core/middleware/auth';
import { requireTenantOwner, requireProjectRole } from '@core/middleware/tenant';

const router = Router();

// Project Management Routes

// Create new project (requires tenant owner)
router.post(
  '/',
  auth.validateToken,
  requireTenantOwner(),
  ProjectController.createProject
);

// List all projects user has access to
router.get(
  '/',
  auth.validateToken,
  requireProjectRole(),
  ProjectController.listProjects
);

// Get project by ID
router.get(
  '/:id',
  auth.validateToken,
  requireProjectRole(),
  ProjectController.getProject
);

// Update project (requires admin role)
router.patch(
  '/:id',
  auth.validateToken,
  requireProjectRole('admin'),
  ProjectController.updateProject
);

// Delete project (requires admin role)
router.delete(
  '/:id',
  auth.validateToken,
  requireProjectRole('admin'),
  ProjectController.deleteProject
);

// Project Member Management Routes

// Update member role (requires admin/deputy role)
router.patch(
  '/:id/members/:userId',
  auth.validateToken,
  requireProjectRole(['admin', 'deputy']),
  ProjectMemberController.updateMemberRole
);

// Remove member (requires admin/deputy role)
router.delete(
  '/:id/members/:userId',
  auth.validateToken,
  requireProjectRole(['admin', 'deputy']),
  ProjectMemberController.removeMember
);

export { router as projectRoutes };
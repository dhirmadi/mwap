import { Router } from 'express';
import { ProjectController } from '@features/projects/controllers';
import { ProjectMemberController } from '@features/projects/controllers/members.controller';
import { auth } from '@core/middleware/auth';
import { requireTenantOwner, requireProjectRole } from '@core/middleware/tenant';
import { ProjectRole } from '@features/projects/schemas';

const router = Router();

// Project Management Routes

// Create new project (requires tenant owner)
router.post(
  '/',
  ...auth.validateRequest,
  requireTenantOwner(),
  ProjectController.createProject
);

// List all projects user has access to
router.get(
  '/',
  ...auth.validateRequest,  // Only need auth, no role check needed as the query will filter by user
  ProjectController.listProjects
);

// Get project by ID
router.get(
  '/:id',
  ...auth.validateRequest,
  requireProjectRole([ProjectRole.OWNER, ProjectRole.DEPUTY, ProjectRole.MEMBER]),
  ProjectController.getProject
);

// Update project (requires admin role)
router.patch(
  '/:id',
  ...auth.validateRequest,
  requireProjectRole([ProjectRole.OWNER]),
  ProjectController.updateProject
);

// Delete project (requires admin role)
router.delete(
  '/:id',
  ...auth.validateRequest,
  requireProjectRole([ProjectRole.OWNER]),
  ProjectController.deleteProject
);

// Project Member Management Routes

// Update member role (requires admin/deputy role)
router.patch(
  '/:id/members/:userId',
  ...auth.validateRequest,
  requireProjectRole([ProjectRole.OWNER, ProjectRole.DEPUTY]),
  ProjectMemberController.updateMemberRole
);

// Remove member (requires admin/deputy role)
router.delete(
  '/:id/members/:userId',
  ...auth.validateRequest,
  requireProjectRole([ProjectRole.OWNER, ProjectRole.DEPUTY]),
  ProjectMemberController.removeMember
);

export { router as projectRoutes };
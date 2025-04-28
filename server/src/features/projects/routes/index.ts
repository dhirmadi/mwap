import { Router } from 'express';
import { ProjectController } from '@features/projects/controllers';
import { ProjectMemberController } from '@features/projects/controllers/members.controller';
import { validateToken } from '@core/middleware/auth/validateToken';
import { verifyTenantOwner } from '@core/middleware/scoping/verifyTenantOwner';
import { verifyProjectRole } from '@core/middleware/scoping/verifyProjectRole';
import { ProjectRole } from '@features/projects/schemas';

const router = Router();

// Project Management Routes

// Create new project (requires tenant owner)
router.post(
  '/',
  validateToken,
  verifyTenantOwner,
  ProjectController.createProject
);

// List all projects user has access to
router.get(
  '/',
  validateToken,  // Only need auth, no role check needed as the query will filter by user
  ProjectController.listProjects
);

// Get project by ID
router.get(
  '/:id',
  validateToken,
  verifyProjectRole([ProjectRole.OWNER, ProjectRole.DEPUTY, ProjectRole.MEMBER]),
  ProjectController.getProject
);

// Update project (requires admin role)
router.patch(
  '/:id',
  validateToken,
  verifyProjectRole([ProjectRole.OWNER]),
  ProjectController.updateProject
);

// Delete project (requires admin role)
router.delete(
  '/:id',
  validateToken,
  verifyProjectRole([ProjectRole.OWNER]),
  ProjectController.deleteProject
);

// Project Member Management Routes

// Update member role (requires admin/deputy role)
router.patch(
  '/:id/members/:userId',
  validateToken,
  verifyProjectRole([ProjectRole.OWNER, ProjectRole.DEPUTY]),
  ProjectMemberController.updateMemberRole
);

// Remove member (requires admin/deputy role)
router.delete(
  '/:id/members/:userId',
  validateToken,
  verifyProjectRole([ProjectRole.OWNER, ProjectRole.DEPUTY]),
  ProjectMemberController.removeMember
);

export { router as projectRoutes };
import { Router } from 'express';
import { ProjectController } from './controller';
import { withAuth } from '../../middleware/auth';
import { requireTenantOwner, requireProjectRole } from '../../middleware/tenant';

const router = Router();

// Create new project (requires tenant owner)
router.post(
  '/projects',
  withAuth(),
  requireTenantOwner(),
  ProjectController.createProject
);

// List all projects user has access to
router.get(
  '/projects',
  withAuth(),
  requireProjectRole(),
  ProjectController.listProjects
);

// Get project by ID
router.get(
  '/projects/:id',
  withAuth(),
  requireProjectRole(),
  ProjectController.getProject
);

// Update project (requires admin role)
router.patch(
  '/projects/:id',
  withAuth(),
  requireProjectRole('admin'),
  ProjectController.updateProject
);

// Delete project (requires admin role)
router.delete(
  '/projects/:id',
  withAuth(),
  requireProjectRole('admin'),
  ProjectController.deleteProject
);

export { router };
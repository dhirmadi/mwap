import { Router } from 'express';
import { ProjectController } from '@features/projects/controllers';
import { auth } from '@core/middleware/auth';
import { requireTenantOwner, requireProjectRole } from '@core/middleware/tenant';

const router = Router();

// Create new project (requires tenant owner)
router.post(
  '/projects',
  auth.validateToken,
  requireTenantOwner(),
  ProjectController.createProject
);

// List all projects user has access to
router.get(
  '/projects',
  auth.validateToken,
  requireProjectRole(),
  ProjectController.listProjects
);

// Get project by ID
router.get(
  '/projects/:id',
  auth.validateToken,
  requireProjectRole(),
  ProjectController.getProject
);

// Update project (requires admin role)
router.patch(
  '/projects/:id',
  auth.validateToken,
  requireProjectRole('admin'),
  ProjectController.updateProject
);

// Delete project (requires admin role)
router.delete(
  '/projects/:id',
  auth.validateToken,
  requireProjectRole('admin'),
  ProjectController.deleteProject
);

export { router };
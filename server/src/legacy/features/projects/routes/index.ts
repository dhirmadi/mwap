/** @deprecated Use equivalent functionality from v2 modules instead. This module will be removed in a future release. */

import { Router } from 'express';
import { ProjectController } from '@features/projects/controllers';
import { ProjectMemberController } from '@features/projects/controllers/members.controller';
import { validateToken } from '@core/middleware/auth/validateToken';
import { extractUser } from '@core/middleware/auth/extractUser';
import { requireUser } from '@core/middleware/auth/requireUser';
import { verifyTenantOwner } from '@core/middleware/scoping/verifyTenantOwner';
import { verifyProjectRole } from '@core/middleware/scoping/verifyProjectRole';
import { validateRequest } from '@core/middleware/validation/requestValidation';
import { ProjectRole } from '@features/projects/schemas';
import { idParamSchema, userIdParamSchema } from '@features/tenant/schemas/validation';
import { z } from 'zod';

const router = Router();

// Common middleware chains
const requireAuth = [validateToken, extractUser, requireUser];
const requireProjectOwner = [...requireAuth, verifyProjectRole([ProjectRole.OWNER])];
const requireProjectAdmin = [...requireAuth, verifyProjectRole([ProjectRole.OWNER, ProjectRole.DEPUTY])];
const requireProjectAccess = [...requireAuth, verifyProjectRole([ProjectRole.OWNER, ProjectRole.DEPUTY, ProjectRole.MEMBER])];

// Project Management Routes

// Create new project (requires tenant owner)
router.post(
  '/',
  validateRequest(z.object({
    body: z.object({
      tenantId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid tenant ID format'),
      name: z.string().min(1, 'Project name is required'),
      description: z.string().optional()
    })
  })),
  ...requireAuth,
  verifyTenantOwner,
  ProjectController.createProject
);

// List all projects user has access to
router.get(
  '/',
  ...requireAuth,
  ProjectController.listProjects
);

// Get project by ID
router.get(
  '/:id',
  validateRequest(idParamSchema),
  ...requireProjectAccess,
  ProjectController.getProject
);

// Update project (requires owner role)
router.patch(
  '/:id',
  validateRequest(idParamSchema),
  ...requireProjectOwner,
  ProjectController.updateProject
);

// Delete project (requires owner role)
router.delete(
  '/:id',
  validateRequest(idParamSchema),
  ...requireProjectOwner,
  ProjectController.deleteProject
);

// Project Member Management Routes

// Update member role (requires admin/deputy role)
router.patch(
  '/:id/members/:userId',
  validateRequest(idParamSchema),
  validateRequest(userIdParamSchema),
  ...requireProjectAdmin,
  ProjectMemberController.updateMemberRole
);

// Remove member (requires admin/deputy role)
router.delete(
  '/:id/members/:userId',
  validateRequest(idParamSchema),
  validateRequest(userIdParamSchema),
  ...requireProjectAdmin,
  ProjectMemberController.removeMember
);

export { router as projectRoutes };
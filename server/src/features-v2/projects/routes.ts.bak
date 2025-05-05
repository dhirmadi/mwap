/**
 * This module uses core-v2 only
 */

import { Router } from 'express';
import { requireRoles, MWAP_ROLES } from '../../../middleware-v2/auth/roles';
import { ProjectController } from './controller';
import { ProjectService } from './service';

export function createProjectRouter(): Router {
  const router = Router();
  const service = new ProjectService();
  const controller = new ProjectController(service);

  router.post('/',
    requireRoles(MWAP_ROLES.OWNER),
    controller.createProject.bind(controller)
  );

  router.get('/:id',
    requireRoles(MWAP_ROLES.MEMBER),
    controller.getProject.bind(controller)
  );

  router.patch('/:id',
    requireRoles(MWAP_ROLES.OWNER),
    controller.updateProject.bind(controller)
  );

  router.delete('/:id',
    requireRoles(MWAP_ROLES.OWNER),
    controller.deleteProject.bind(controller)
  );

  router.get('/',
    requireRoles(MWAP_ROLES.MEMBER),
    controller.listProjects.bind(controller)
  );

  router.post('/:id/archive',
    requireRoles(MWAP_ROLES.OWNER),
    controller.archiveProject.bind(controller)
  );

  router.post('/:id/restore',
    requireRoles(MWAP_ROLES.OWNER),
    controller.restoreProject.bind(controller)
  );

  return router;
}

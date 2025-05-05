/**
 * This module uses core-v2 only
 */

import { Router } from 'express';
import { requireRoles, MWAP_ROLES } from '../../../middleware-v2/auth/roles';
import { ProjectTypeController } from './controller';
import { ProjectTypeService } from './service';

export function createProjectTypeRouter(): Router {
  const router = Router();
  const service = new ProjectTypeService();
  const controller = new ProjectTypeController(service);

  router.post('/',
    requireRoles(MWAP_ROLES.OWNER),
    controller.createProjectType.bind(controller)
  );

  router.get('/:id',
    requireRoles(MWAP_ROLES.MEMBER),
    controller.getProjectType.bind(controller)
  );

  router.patch('/:id',
    requireRoles(MWAP_ROLES.OWNER),
    controller.updateProjectType.bind(controller)
  );

  router.delete('/:id',
    requireRoles(MWAP_ROLES.OWNER),
    controller.deleteProjectType.bind(controller)
  );

  router.get('/',
    requireRoles(MWAP_ROLES.MEMBER),
    controller.listProjectTypes.bind(controller)
  );

  router.post('/:id/activate',
    requireRoles(MWAP_ROLES.OWNER),
    controller.activateProjectType.bind(controller)
  );

  router.post('/:id/deactivate',
    requireRoles(MWAP_ROLES.OWNER),
    controller.deactivateProjectType.bind(controller)
  );

  return router;
}

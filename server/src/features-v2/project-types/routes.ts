import { Router } from 'express';
import { requireRoles, MWAP_ROLES } from '../../../middleware-v2/auth/roles';
import { ProjectTypesController } from './controller';
import { ProjectTypesService } from './service';

export function createProjectTypesRouter(): Router {
  const router = Router();
  const service = new ProjectTypesService();
  const controller = new ProjectTypesController(service);

  router.post('/',
    requireRoles(MWAP_ROLES.OWNER),
    controller.createProjectTypes.bind(controller)
  );

  router.get('/:id',
    requireRoles(MWAP_ROLES.MEMBER),
    controller.getProjectTypes.bind(controller)
  );

  router.patch('/:id',
    requireRoles(MWAP_ROLES.OWNER),
    controller.updateProjectTypes.bind(controller)
  );

  router.delete('/:id',
    requireRoles(MWAP_ROLES.OWNER),
    controller.deleteProjectTypes.bind(controller)
  );

  router.get('/',
    requireRoles(MWAP_ROLES.MEMBER),
    controller.listProjectTypess.bind(controller)
  );

  return router;
}

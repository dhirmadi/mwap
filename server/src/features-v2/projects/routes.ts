import { Router } from 'express';
import { requireRoles, MWAP_ROLES } from '../../../middleware-v2/auth/roles';
import { ProjectsController } from './controller';
import { ProjectsService } from './service';

export function createProjectsRouter(): Router {
  const router = Router();
  const service = new ProjectsService();
  const controller = new ProjectsController(service);

  router.post('/',
    requireRoles(MWAP_ROLES.OWNER),
    controller.createProjects.bind(controller)
  );

  router.get('/:id',
    requireRoles(MWAP_ROLES.MEMBER),
    controller.getProjects.bind(controller)
  );

  router.patch('/:id',
    requireRoles(MWAP_ROLES.OWNER),
    controller.updateProjects.bind(controller)
  );

  router.delete('/:id',
    requireRoles(MWAP_ROLES.OWNER),
    controller.deleteProjects.bind(controller)
  );

  router.get('/',
    requireRoles(MWAP_ROLES.MEMBER),
    controller.listProjectss.bind(controller)
  );

  return router;
}

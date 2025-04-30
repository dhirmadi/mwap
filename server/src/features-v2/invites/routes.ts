import { Router } from 'express';
import { requireRoles, MWAP_ROLES } from '../../../middleware-v2/auth/roles';
import { InvitesController } from './controller';
import { InvitesService } from './service';

export function createInvitesRouter(): Router {
  const router = Router();
  const service = new InvitesService();
  const controller = new InvitesController(service);

  router.post('/',
    requireRoles(MWAP_ROLES.OWNER),
    controller.createInvites.bind(controller)
  );

  router.get('/:id',
    requireRoles(MWAP_ROLES.MEMBER),
    controller.getInvites.bind(controller)
  );

  router.patch('/:id',
    requireRoles(MWAP_ROLES.OWNER),
    controller.updateInvites.bind(controller)
  );

  router.delete('/:id',
    requireRoles(MWAP_ROLES.OWNER),
    controller.deleteInvites.bind(controller)
  );

  router.get('/',
    requireRoles(MWAP_ROLES.MEMBER),
    controller.listInvitess.bind(controller)
  );

  return router;
}

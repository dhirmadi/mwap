/**
 * This module uses core-v2 only
 */

import { Router } from 'express';
import { requireRoles, MWAP_ROLES } from '../../../middleware-v2/auth/roles';
import { InviteController } from './controller';
import { InviteService } from './service';

export function createInviteRouter(): Router {
  const router = Router();
  const service = new InviteService();
  const controller = new InviteController(service);

  router.post('/',
    requireRoles(MWAP_ROLES.OWNER),
    controller.createInvite.bind(controller)
  );

  router.get('/:id',
    requireRoles(MWAP_ROLES.MEMBER),
    controller.getInvite.bind(controller)
  );

  router.patch('/:id',
    requireRoles(MWAP_ROLES.OWNER),
    controller.updateInvite.bind(controller)
  );

  router.delete('/:id',
    requireRoles(MWAP_ROLES.OWNER),
    controller.deleteInvite.bind(controller)
  );

  router.get('/',
    requireRoles(MWAP_ROLES.MEMBER),
    controller.listInvites.bind(controller)
  );

  router.post('/:id/accept',
    requireRoles(MWAP_ROLES.MEMBER),
    controller.acceptInvite.bind(controller)
  );

  router.post('/:id/reject',
    requireRoles(MWAP_ROLES.MEMBER),
    controller.rejectInvite.bind(controller)
  );

  router.post('/:id/resend',
    requireRoles(MWAP_ROLES.OWNER),
    controller.resendInvite.bind(controller)
  );

  router.post('/:id/revoke',
    requireRoles(MWAP_ROLES.OWNER),
    controller.revokeInvite.bind(controller)
  );

  return router;
}

/**
 * This module uses core-v2 only
 */

import { Router } from 'express';
import { requireRoles, MWAP_ROLES } from '../../../middleware-v2/auth/roles';
import { TenantController } from './controller';
import { TenantService } from './service';

export function createTenantRouter(): Router {
  const router = Router();
  const service = new TenantService();
  const controller = new TenantController(service);

  router.post('/',
    requireRoles(MWAP_ROLES.OWNER),
    controller.createTenant.bind(controller)
  );

  router.get('/:id',
    requireRoles(MWAP_ROLES.MEMBER),
    controller.getTenant.bind(controller)
  );

  router.patch('/:id',
    requireRoles(MWAP_ROLES.OWNER),
    controller.updateTenant.bind(controller)
  );

  router.delete('/:id',
    requireRoles(MWAP_ROLES.OWNER),
    controller.deleteTenant.bind(controller)
  );

  router.get('/',
    requireRoles(MWAP_ROLES.MEMBER),
    controller.listTenants.bind(controller)
  );

  return router;
}

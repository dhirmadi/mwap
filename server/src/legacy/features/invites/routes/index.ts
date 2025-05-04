/** @deprecated Use equivalent functionality from v2 modules instead. This module will be removed in a future release. */

import { Router } from 'express';
import { InviteController } from '@features/invites/controllers';
import { validateToken } from '@core/middleware/auth/validateToken';
import { verifyProjectRole } from '@core/middleware/scoping/verifyProjectRole';
import { ProjectRole } from '@features/projects/schemas';

const router = Router();

// Create invite code (requires admin/deputy role)
router.post(
  '/invites',
  validateToken,
  verifyProjectRole([ProjectRole.OWNER, ProjectRole.DEPUTY]),
  InviteController.createInvite
);

// Redeem invite code (requires authentication)
router.post(
  '/invites/redeem',
  validateToken,
  InviteController.redeemInvite
);

export { router as inviteRoutes };
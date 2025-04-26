import { Router } from 'express';
import { InviteController } from '@features/invites/controllers';
import { auth } from '@core/middleware/auth';
import { requireProjectRole } from '@core/middleware/tenant';
import { ProjectRole } from '@features/projects/schemas';

const router = Router();

// Create invite code (requires admin/deputy role)
router.post(
  '/invites',
  auth.validateToken,
  requireProjectRole([ProjectRole.OWNER, ProjectRole.DEPUTY]),
  InviteController.createInvite
);

// Redeem invite code (requires authentication)
router.post(
  '/invites/redeem',
  auth.validateToken,
  InviteController.redeemInvite
);

export { router as inviteRoutes };
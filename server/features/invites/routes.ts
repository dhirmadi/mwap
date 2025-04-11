import { Router } from 'express';
import { InviteController } from './controller';
import { withAuth } from '../../middleware/auth';
import { requireProjectRole } from '../../middleware/tenant';

const router = Router();

// Create invite code (requires admin/deputy role)
router.post(
  '/invites',
  withAuth(),
  requireProjectRole(['admin', 'deputy']),
  InviteController.createInvite
);

// Redeem invite code (requires authentication)
router.post(
  '/invites/redeem',
  withAuth(),
  InviteController.redeemInvite
);

export { router };
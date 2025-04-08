import express from 'express';
import userRoutes from './users';
import { tenantRouter } from './tenant.routes';
import { inviteRouter } from './invite.routes';

const router = express.Router();

router.use('/users', userRoutes);
router.use('/tenants', tenantRouter);
router.use('/invites', inviteRouter);

export default router;
const express = require('express');
const userRoutes = require('./users');
const { tenantRouter } = require('./tenant.routes');
const { inviteRouter } = require('./invite.routes');

const router = express.Router();

router.use('/users', userRoutes);
router.use('/tenants', tenantRouter);
router.use('/invites', inviteRouter);

module.exports = router;
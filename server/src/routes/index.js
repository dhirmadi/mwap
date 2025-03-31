const express = require('express');
const router = express.Router();
const taskRoutes = require('./tasks');
const userRoutes = require('./users');
const tenantRoutes = require('./tenants');

router.use('/tasks', taskRoutes);
router.use('/users', userRoutes);
router.use('/tenants', tenantRoutes);

module.exports = router;
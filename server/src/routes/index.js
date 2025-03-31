const express = require('express');
const router = express.Router();
const taskRoutes = require('./tasks');
const userRoutes = require('./users');

router.use('/tasks', taskRoutes);
router.use('/users', userRoutes);

module.exports = router;
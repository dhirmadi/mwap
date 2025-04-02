const express = require('express');
const router = express.Router();
const { checkJwt } = require('../middleware/auth');

// Basic user info endpoint
router.get('/me', checkJwt, async (req, res) => {
  try {
    res.json({
      id: req.auth.sub,
      email: req.auth.email,
      name: req.auth.name,
      picture: req.auth.picture
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ 
      message: 'Error fetching user info',
      error: error.message 
    });
  }
});

module.exports = router;
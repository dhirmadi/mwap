const express = require('express');
const router = express.Router();
const { checkJwt } = require('../middleware/auth');
const User = require('../models/User');

// Get current user
router.get('/me', checkJwt, async (req, res) => {
  try {
    const user = await User.findOne({ auth0Id: req.auth.sub });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create or update user profile
router.post('/me', checkJwt, async (req, res) => {
  try {
    let user = await User.findOne({ auth0Id: req.auth.sub });
    if (user) {
      Object.assign(user, req.body);
      user = await user.save();
    } else {
      user = new User({
        auth0Id: req.auth.sub,
        ...req.body,
      });
      user = await user.save();
    }
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
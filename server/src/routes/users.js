const express = require('express');
const router = express.Router();
const { checkJwt } = require('../middleware/auth');
const User = require('../models/UserSchema');

// Validation middleware
const validateProfileUpdate = (req, res, next) => {
  const updates = req.body;
  const allowedUpdates = [
    'firstName', 'lastName', 'phoneNumber', 'title',
    'department', 'location', 'timezone', 'bio',
    'preferences', 'status'
  ];

  // Check for invalid fields
  const updateFields = Object.keys(updates);
  const isValidOperation = updateFields.every(field => 
    allowedUpdates.includes(field) || field.startsWith('preferences.')
  );

  if (!isValidOperation) {
    return res.status(400).json({ 
      message: 'Invalid updates',
      allowedFields: allowedUpdates
    });
  }

  // Validate specific fields
  if (updates.phoneNumber && !/^\+?[\d\s-()]{8,}$/.test(updates.phoneNumber)) {
    return res.status(400).json({ message: 'Invalid phone number format' });
  }

  if (updates.bio && updates.bio.length > 500) {
    return res.status(400).json({ message: 'Bio must be less than 500 characters' });
  }

  if (updates.preferences?.theme && 
      !['light', 'dark', 'system'].includes(updates.preferences.theme)) {
    return res.status(400).json({ message: 'Invalid theme preference' });
  }

  next();
};

// Get current user
router.get('/me', checkJwt, async (req, res) => {
  try {
    let user = await User.findByAuth0Id(req.auth.sub);
    
    // If user doesn't exist, create it with Auth0 data
    if (!user) {
      const auth0Data = {
        auth0Id: req.auth.sub,
        email: req.auth.email,
        name: req.auth.name,
        picture: req.auth.picture
      };

      user = new User({
        ...auth0Data,
        status: 'active'
      });
      await user.save();
    }
    // If it's been more than 1 hour since last sync, sync with Auth0
    else {
      const lastSync = new Date(user.lastAuth0Sync);
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      
      if (lastSync < oneHourAgo) {
        const auth0Data = {
          auth0Id: req.auth.sub,
          email: req.auth.email,
          name: req.auth.name,
          picture: req.auth.picture
        };
        user.syncWithAuth0Data(auth0Data);
        await user.save();
      }
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ 
      message: 'Error fetching user profile',
      error: error.message 
    });
  }
});

// Create or update user profile
router.patch('/me', checkJwt, validateProfileUpdate, async (req, res) => {
  try {
    let user = await User.findOne({ auth0Id: req.auth.sub });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Handle nested updates (e.g., preferences.theme)
    Object.keys(req.body).forEach(field => {
      if (field === 'preferences' && typeof req.body[field] === 'object') {
        user.preferences = {
          ...user.preferences,
          ...req.body.preferences
        };
      } else {
        user[field] = req.body[field];
      }
    });

    await user.save();
    res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(400).json({ 
      message: 'Error updating profile',
      error: error.message
    });
  }
});

// Create or sync user profile
router.post('/me', checkJwt, async (req, res) => {
  try {
    let user = await User.findOne({ auth0Id: req.auth.sub });
    const auth0Data = {
      auth0Id: req.auth.sub,
      email: req.body.email,
      name: req.body.name,
      picture: req.body.picture
    };

    if (user) {
      // Sync existing user with Auth0 data
      user.syncWithAuth0Data(auth0Data);
    } else {
      // Create new user with Auth0 data
      user = new User({
        ...auth0Data,
        status: 'active'
      });
    }

    await user.save();
    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(400).json({ 
      message: 'Error creating profile',
      error: error.message
    });
  }
});

// Get user preferences
router.get('/me/preferences', checkJwt, async (req, res) => {
  try {
    const user = await User.findOne({ auth0Id: req.auth.sub });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.preferences);
  } catch (error) {
    console.error('Error fetching preferences:', error);
    res.status(500).json({ 
      message: 'Error fetching preferences',
      error: error.message 
    });
  }
});

// Update user preferences
router.patch('/me/preferences', checkJwt, async (req, res) => {
  try {
    const user = await User.findOne({ auth0Id: req.auth.sub });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.preferences = {
      ...user.preferences,
      ...req.body
    };

    await user.save();
    res.json(user.preferences);
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(400).json({ 
      message: 'Error updating preferences',
      error: error.message 
    });
  }
});

module.exports = router;
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
    console.log('GET /me - Auth info:', {
      sub: req.auth.sub,
      email: req.auth.email,
      name: req.auth.name
    });

    let user = await User.findByAuth0Id(req.auth.sub);
    console.log('Found user:', user ? {
      id: user.id,
      email: user.email,
      name: user.name
    } : 'null');

    // If user doesn't exist, create it with Auth0 data
    if (!user) {
      console.log('Creating new user profile');
      const auth0Data = {
        auth0Id: req.auth.sub,
        email: req.auth.email,
        name: req.auth.name,
        picture: req.auth.picture
      };

      user = new User({
        ...auth0Data,
        status: 'active',
        preferences: {
          theme: 'system',
          notifications: {
            email: true,
            push: true
          },
          language: 'en'
        }
      });

      // Extract first/last name from full name
      if (auth0Data.name) {
        user.firstName = user.extractFirstName(auth0Data.name);
        user.lastName = user.extractLastName(auth0Data.name);
      }

      try {
        await user.save();
        console.log('Created new user:', {
          id: user.id,
          email: user.email,
          name: user.name
        });
      } catch (saveError) {
        console.error('Error saving new user:', {
          error: saveError.message,
          validation: saveError.errors
        });
        throw saveError;
      }
    }
    // If it's been more than 1 hour since last sync, sync with Auth0
    else {
      const lastSync = new Date(user.lastAuth0Sync);
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      
      if (lastSync < oneHourAgo) {
        console.log('Syncing user with Auth0 data');
        const auth0Data = {
          auth0Id: req.auth.sub,
          email: req.auth.email,
          name: req.auth.name,
          picture: req.auth.picture
        };
        user.syncWithAuth0Data(auth0Data);
        await user.save();
        console.log('User synced with Auth0');
      }
    }

    res.json(user);
  } catch (error) {
    console.error('Error in GET /me:', {
      error: error.message,
      stack: error.stack,
      validation: error.errors
    });
    res.status(500).json({ 
      message: 'Error fetching user profile',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.errors : undefined
    });
  }
});

// Update user profile
router.patch('/me', checkJwt, validateProfileUpdate, async (req, res) => {
  try {
    console.log('PATCH /me - Update data:', req.body);
    
    let user = await User.findByAuth0Id(req.auth.sub);
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

    // Validate before saving
    await user.validate();
    console.log('Validation passed');

    // Save the user
    const savedUser = await user.save();
    console.log('User updated successfully:', {
      id: savedUser.id,
      updatedFields: Object.keys(req.body)
    });

    res.json(savedUser);
  } catch (error) {
    console.error('Error updating user:', {
      error: error.message,
      stack: error.stack,
      validation: error.errors
    });

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => ({
          field: err.path,
          message: err.message,
          value: err.value
        }))
      });
    }

    res.status(500).json({ 
      message: 'Error updating profile',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.errors : undefined
    });
  }
});

// Get user preferences
router.get('/me/preferences', checkJwt, async (req, res) => {
  try {
    const user = await User.findByAuth0Id(req.auth.sub);
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

// Create user profile
router.post('/me', checkJwt, async (req, res) => {
  try {
    console.log('POST /me - Create profile:', {
      auth0Id: req.auth.sub,
      email: req.body.email,
      name: req.body.name
    });

    let user = await User.findByAuth0Id(req.auth.sub);
    if (user) {
      console.log('User already exists:', {
        id: user.id,
        email: user.email
      });
      return res.status(400).json({ 
        message: 'User profile already exists. Use PATCH to update.' 
      });
    }

    // Create new user with Auth0 data
    user = new User({
      auth0Id: req.auth.sub,
      email: req.body.email,
      name: req.body.name,
      picture: req.auth.picture,
      status: 'active',
      preferences: {
        theme: 'system',
        notifications: {
          email: true,
          push: true
        },
        language: 'en'
      }
    });

    // Extract first/last name from full name
    if (req.body.name) {
      user.firstName = user.extractFirstName(req.body.name);
      user.lastName = user.extractLastName(req.body.name);
    }

    await user.save();
    console.log('Created new user:', {
      id: user.id,
      email: user.email,
      name: user.name
    });
    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating user:', {
      error: error.message,
      stack: error.stack,
      validation: error.errors
    });

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => ({
          field: err.path,
          message: err.message,
          value: err.value
        }))
      });
    }

    res.status(500).json({ 
      message: 'Error creating profile',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.errors : undefined
    });
  }
});

// Update user preferences
router.patch('/me/preferences', checkJwt, async (req, res) => {
  try {
    const user = await User.findByAuth0Id(req.auth.sub);
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
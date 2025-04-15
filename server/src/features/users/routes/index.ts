import express, { Response } from 'express';
import { auth } from '@core/middleware/auth';
import { User, Auth0Claims, UserProfile } from '@core/types/auth';
import { AuthRequest } from '@core/types/express';

const router = express.Router();

// Basic user info endpoint
router.get('/me', auth.validateToken, (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({
        message: 'No authentication information found'
      });
      return;
    }

    const user = req.user as unknown as Auth0Claims;
    const userProfile: UserProfile = {
      id: user.sub,
      email: user.email,
      name: user.name,
      picture: user.picture,
      roles: ['user']
    };

    res.json(userProfile);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ 
      message: 'Error fetching user info',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
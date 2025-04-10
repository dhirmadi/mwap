import express, { Request, Response } from 'express';
import { checkJwt } from '../middleware/auth';
import { UserProfile, Auth0Claims } from '../types/user';

const router = express.Router();

// Basic user info endpoint
router.get('/me', checkJwt, (req: Request, res: Response) => {
  try {
    if (!req.auth) {
      res.status(401).json({
        message: 'No authentication information found'
      });
      return;
    }

    const auth = req.auth as unknown as Auth0Claims;
    const userProfile: UserProfile = {
      id: auth.sub,
      email: auth.email,
      name: auth.name,
      picture: auth.picture
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
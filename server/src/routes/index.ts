import express from 'express';
import userRoutes from '@features/users/routes';

const router = express.Router();

router.use('/users', userRoutes);

export default router;
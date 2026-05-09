import express from 'express';
import authRoutes from './auth.js';
import roomRoutes from './rooms.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/rooms', roomRoutes);

export default router;

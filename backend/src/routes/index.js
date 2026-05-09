import express from 'express';
import authRoutes from './auth.js';
import roomRoutes from './rooms.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/rooms', roomRoutes);

router.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

export default router;

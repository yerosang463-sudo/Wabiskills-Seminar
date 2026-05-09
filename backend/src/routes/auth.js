import express from 'express';
import passport from '../config/passport.js';
import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import { register, login, getMe } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { validate, registerSchema, loginSchema } from '../middleware/validation.js';

const router = express.Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.get('/me', authenticate, getMe);

// Google OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    const token = jwt.sign(
      { userId: req.user.id, email: req.user.email },
      config.jwt.secret,
      { expiresIn: config.jwt.expiry }
    );

    // Redirect to frontend with token
    res.redirect(`${config.cors.origin}?token=${token}`);
  }
);

export default router;

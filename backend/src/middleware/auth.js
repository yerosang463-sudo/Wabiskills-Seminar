import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import models from '../database/index.js';

const { User } = models;

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided. Please log in again.',
        code: 'NO_TOKEN'
      });
    }

    const token = authHeader.substring(7);
    
    if (!token || token.trim() === '') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token format. Please log in again.',
        code: 'INVALID_FORMAT'
      });
    }
    
    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      
      const user = await User.findByPk(decoded.userId);
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User account not found. Please register again.',
          code: 'USER_NOT_FOUND'
        });
      }

      req.user = user;
      next();
    } catch (jwtError) {
      // Token is invalid - could be expired, wrong secret, or malformed
      return res.status(401).json({
        success: false,
        message: 'Your session has expired. Please log in again.',
        code: jwtError.name === 'TokenExpiredError' ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN'
      });
    }
  } catch (error) {
    console.error('[AUTH] Unexpected authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication system error. Please try again.',
      code: 'AUTH_ERROR'
    });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      const user = await User.findByPk(decoded.userId);
      
      if (user) {
        req.user = user;
      }
    } catch (jwtError) {
      // Token invalid, but we continue without user
    }
    
    next();
  } catch (error) {
    console.error('Optional authentication error:', error);
    next();
  }
};

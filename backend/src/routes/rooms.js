import express from 'express';
import {
  createRoom,
  getRoom,
  joinRoom,
  leaveRoom,
  getUserRooms,
} from '../controllers/roomController.js';
import { authenticate } from '../middleware/auth.js';
import { validate, createRoomSchema } from '../middleware/validation.js';

const router = express.Router();

router.post('/', authenticate, validate(createRoomSchema), createRoom);
router.get('/my-rooms', authenticate, getUserRooms);
router.get('/:roomId', authenticate, getRoom);
router.post('/:roomId/join', authenticate, joinRoom);
router.post('/:roomId/leave', authenticate, leaveRoom);

export default router;

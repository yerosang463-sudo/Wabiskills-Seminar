import models from '../database/index.js';

const { Room, User, Message } = models;

const ROOM_ID_PATTERN = /^[a-z0-9]{3}-[a-z0-9]{4}-[a-z0-9]{3}$/;
const ROOM_ALPHABET = 'abcdefghijkmnopqrstuvwxyz23456789';

const randomSegment = (length) =>
  Array.from({ length }, () => ROOM_ALPHABET[Math.floor(Math.random() * ROOM_ALPHABET.length)]).join('');

export const normalizeRoomId = (roomId) => {
  if (typeof roomId !== 'string') return '';
  return roomId.trim().toLowerCase();
};

const generateMeetingRoomId = () => `${randomSegment(3)}-${randomSegment(4)}-${randomSegment(3)}`;

const generateUniqueRoomId = async () => {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const roomId = generateMeetingRoomId();
    // eslint-disable-next-line no-await-in-loop
    const existing = await Room.findOne({ where: { roomId } });
    if (!existing) return roomId;
  }

  throw Object.assign(new Error('Could not generate a unique meeting ID'), { status: 500 });
};

export const createRoom = async (req, res, next) => {
  try {
    const requestedRoomId = normalizeRoomId(req.body?.roomId);
    const finalRoomId = requestedRoomId || (await generateUniqueRoomId());

    if (!ROOM_ID_PATTERN.test(finalRoomId)) {
      return res.status(400).json({
        success: false,
        message: 'Room ID must use the format abc-defg-hij.',
      });
    }

    const existingRoom = await Room.findOne({ where: { roomId: finalRoomId } });
    if (existingRoom) {
      if (existingRoom.createdBy !== req.user.id) {
        return res.status(409).json({
          success: false,
          message: 'That room ID is already in use.',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Room already exists.',
        data: {
          id: existingRoom.id,
          roomId: existingRoom.roomId,
          createdBy: existingRoom.createdBy,
          isHost: true,
          created: false,
          createdAt: existingRoom.createdAt,
        },
      });
    }

    const room = await Room.create({
      roomId: finalRoomId,
      createdBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: 'Room created successfully.',
      data: {
        id: room.id,
        roomId: room.roomId,
        createdBy: room.createdBy,
        isHost: true,
        created: true,
        createdAt: room.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getRoom = async (req, res, next) => {
  try {
    const roomId = normalizeRoomId(req.params.roomId);

    const room = await Room.findOne({
      where: { roomId, isActive: true },
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'email'],
        },
      ],
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }

    res.json({
      success: true,
      data: {
        id: room.id,
        roomId: room.roomId,
        createdBy: room.createdBy,
        creator: room.creator,
        isHost: room.createdBy === req.user.id,
        isActive: room.isActive,
        createdAt: room.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const joinRoom = async (req, res, next) => {
  try {
    const roomId = normalizeRoomId(req.params.roomId);

    const room = await Room.findOne({
      where: { roomId, isActive: true },
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'email'],
        },
      ],
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }

    // Get recent messages for the room
    const messages = await Message.findAll({
      where: { roomId: room.id },
      include: [
        {
          model: User,
          as: 'senderUser',
          attributes: ['id', 'username'],
        },
      ],
      order: [['createdAt', 'ASC']],
      limit: 50,
    });

    res.json({
      success: true,
      data: {
        room: {
          id: room.id,
          roomId: room.roomId,
          createdBy: room.createdBy,
          creator: room.creator,
          isHost: room.createdBy === req.user.id,
          createdAt: room.createdAt,
        },
        messages: messages.map((msg) => ({
          id: msg.id,
          message: msg.message,
          sender: msg.sender,
          senderName: msg.senderUser?.username,
          timestamp: msg.createdAt,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const leaveRoom = async (req, res, next) => {
  try {
    const roomId = normalizeRoomId(req.params.roomId);

    const room = await Room.findOne({
      where: { roomId, isActive: true },
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }

    res.json({
      success: true,
      data: {
        message: 'Left room successfully',
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getUserRooms = async (req, res, next) => {
  try {
    const rooms = await Room.findAll({
      where: { createdBy: req.user.id },
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'email'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json({
      success: true,
      data: rooms,
    });
  } catch (error) {
    next(error);
  }
};

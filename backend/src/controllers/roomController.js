import models from '../database/index.js';
import { Op } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

const { Room, User, Message } = models;

export const createRoom = async (req, res, next) => {
  try {
    const { roomId } = req.body;
    const finalRoomId = roomId || uuidv4();

    const room = await Room.create({
      roomId: finalRoomId,
      createdBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      data: {
        id: room.id,
        roomId: room.roomId,
        createdBy: room.createdBy,
        createdAt: room.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getRoom = async (req, res, next) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findOne({
      where: { roomId },
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
      data: room,
    });
  } catch (error) {
    next(error);
  }
};

export const joinRoom = async (req, res, next) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findOne({
      where: { roomId },
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
    const { roomId } = req.params;

    const room = await Room.findOne({
      where: { roomId },
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

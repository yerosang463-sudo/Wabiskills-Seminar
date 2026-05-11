import { DataTypes } from 'sequelize';
import sequelize from '../database/sequelize.js';

const ROOM_ALPHABET = 'abcdefghijkmnopqrstuvwxyz23456789';
const randomSegment = (length) =>
  Array.from({ length }, () => ROOM_ALPHABET[Math.floor(Math.random() * ROOM_ALPHABET.length)]).join('');

const Room = sequelize.define(
  'Room',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    roomId: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      defaultValue: () => `${randomSegment(3)}-${randomSegment(4)}-${randomSegment(3)}`,
      validate: {
        notEmpty: true,
      },
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    maxParticipants: {
      type: DataTypes.INTEGER,
      defaultValue: 50,
    },
  },
  {
    timestamps: true,
  }
);

export default Room;

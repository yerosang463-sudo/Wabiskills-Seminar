import { DataTypes } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import sequelize from '../database/sequelize.js';

const Room = sequelize.define(
  'Room',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    roomId: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      defaultValue: () => uuidv4().slice(0, 8), // Shorter roomId for better UX
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

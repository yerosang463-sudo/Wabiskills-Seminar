import { DataTypes } from 'sequelize';
import sequelize from '../database/sequelize.js';

const Message = sequelize.define(
  'Message',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    roomId: {
      type: DataTypes.STRING(50),
      allowNull: false,
      // Note: This refers to Room.roomId, not Room.id
    },
    sender: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    messageType: {
      type: DataTypes.ENUM('text', 'system', 'file'),
      defaultValue: 'text',
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

export default Message;

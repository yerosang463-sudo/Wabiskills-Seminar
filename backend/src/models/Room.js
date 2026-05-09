import { DataTypes } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import sequelize from '../database/sequelize.js';

const Room = sequelize.define(
  'Room',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    roomId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      defaultValue: () => uuidv4(),
      validate: {
        notEmpty: true,
      },
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
  },
  {
    timestamps: true,
  }
);

export default Room;

import { DataTypes } from 'sequelize';
import bcryptjs from 'bcryptjs';
import sequelize from '../database/sequelize.js';

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [3, 50],
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [6, 255],
      },
    },
  },
  {
    timestamps: true,
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcryptjs.genSalt(10);
          user.password = await bcryptjs.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const salt = await bcryptjs.genSalt(10);
          user.password = await bcryptjs.hash(user.password, salt);
        }
      },
    },
  }
);

// Instance method to compare passwords
User.prototype.comparePassword = async function (password) {
  return bcryptjs.compare(password, this.password);
};

export default User;

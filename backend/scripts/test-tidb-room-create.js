import dotenv from 'dotenv';
import sequelize from '../src/database/sequelize.js';
import models from '../src/database/index.js';

dotenv.config();

const { User, Room, Message } = models;

const main = async () => {
  const suffix = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  const userPayload = {
    username: `tidb_room_test_${suffix}`,
    email: `tidb-room-test-${suffix}@example.invalid`,
    password: 'temporary-test-password',
  };
  const roomId = `tst-${String(Math.floor(1000 + Math.random() * 9000))}-tid`;

  let user = null;
  let room = null;
  let message = null;

  console.log('Testing TiDB room creation with app models...');
  await sequelize.authenticate();
  console.log('TiDB connection OK.');

  try {
    user = await User.create(userPayload);
    room = await Room.create({
      roomId,
      createdBy: user.id,
    });

    console.log('Temporary room created:', {
      id: room.id,
      roomId: room.roomId,
      createdBy: room.createdBy,
    });

    if (!room.id || String(room.id).length < 32) {
      throw new Error('Room primary key was not generated as a UUID-compatible value.');
    }

    const found = await Room.findOne({ where: { roomId } });
    if (!found) {
      throw new Error('Created room could not be read back from TiDB.');
    }

    message = await Message.create({
      roomId: room.id,
      sender: user.id,
      message: 'temporary TiDB message test',
    });

    if (!message.id || String(message.roomId) !== String(room.id)) {
      throw new Error('Message was not linked to the room UUID primary key.');
    }

    console.log('TiDB room create/read/message test passed.');
  } finally {
    if (message) await Message.destroy({ where: { id: message.id } });
    if (room) await Room.destroy({ where: { id: room.id } });
    if (user) await User.destroy({ where: { id: user.id } });
    await sequelize.close();
    console.log('Temporary TiDB test records cleaned up.');
  }
};

main().catch((error) => {
  console.error('TiDB room create test failed:', error.message);
  process.exitCode = 1;
});

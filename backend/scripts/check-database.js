import dotenv from 'dotenv';
import sequelize from '../src/database/sequelize.js';
import models from '../src/database/index.js';

// Load environment variables
dotenv.config();

console.log('🚀 Starting database check...');
console.log('📡 DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
console.log('🌍 NODE_ENV:', process.env.NODE_ENV);

const checkDatabaseData = async () => {
  try {
    console.log('🔍 Checking TiDB database data...');
    console.log('📡 DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection successful');

    // Check if tables exist and have data
    const [results] = await sequelize.query("SHOW TABLES");
    const tableNames = results.map(row => Object.values(row)[0]);
    console.log('📋 Available tables:', tableNames);

    if (tableNames.length === 0) {
      console.log('⚠️  No tables found. Please run: npm run db:init');
      return;
    }

    // Check Users table
    try {
      const userCount = await models.User.count();
      console.log(`👥 Users table: ${userCount} records`);
      
      if (userCount > 0) {
        const users = await models.User.findAll({ limit: 5 });
        console.log('Sample users:', users.map(u => ({
          id: u.id,
          username: u.username,
          email: u.email,
          googleId: u.googleId ? 'exists' : 'null'
        })));
      }
    } catch (err) {
      console.log('❌ Error checking Users table:', err.message);
    }

    // Check Rooms table
    try {
      const roomCount = await models.Room.count();
      console.log(`🏠 Rooms table: ${roomCount} records`);
      
      if (roomCount > 0) {
        const rooms = await models.Room.findAll({ limit: 5 });
        console.log('Sample rooms:', rooms.map(r => ({
          id: r.id,
          roomId: r.roomId,
          title: r.title,
          createdBy: r.createdBy,
          isActive: r.isActive
        })));
      }
    } catch (err) {
      console.log('❌ Error checking Rooms table:', err.message);
    }

    // Check Messages table
    try {
      const messageCount = await models.Message.count();
      console.log(`💬 Messages table: ${messageCount} records`);
      
      if (messageCount > 0) {
        const messages = await models.Message.findAll({ limit: 5 });
        console.log('Sample messages:', messages.map(m => ({
          id: m.id,
          roomId: m.roomId,
          sender: m.sender,
          message: m.message.substring(0, 50) + '...',
          timestamp: m.timestamp
        })));
      }
    } catch (err) {
      console.log('❌ Error checking Messages table:', err.message);
    }

    // Test database write operation
    console.log('🧪 Testing database write operation...');
    try {
      const testUser = await models.User.create({
        username: `test_user_${Date.now()}`,
        email: `test_${Date.now()}@example.com`,
        password: 'test_password'
      });
      console.log('✅ Test user created:', testUser.id, testUser.username);
      
      // Clean up test user
      await testUser.destroy();
      console.log('🧹 Test user cleaned up');
    } catch (err) {
      console.log('❌ Database write test failed:', err.message);
    }

    console.log('🎉 Database check complete!');
    
  } catch (error) {
    console.error('❌ Database check failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
};

// Run check
if (import.meta.url === `file://${process.argv[1]}`) {
  checkDatabaseData();
}

export default checkDatabaseData;

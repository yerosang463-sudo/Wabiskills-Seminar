import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

// Load environment variables
dotenv.config();

const checkData = async () => {
  try {
    console.log('🔍 Checking data in TiDB tables...');

    // Parse DATABASE_URL
    const parseDbUrl = (url) => {
      const match = url.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
      if (!match) {
        throw new Error('Invalid DATABASE_URL format');
      }
      return {
        username: match[1],
        password: match[2],
        host: match[3],
        port: parseInt(match[4], 10),
        database: match[5],
      };
    };

    const dbConfig = parseDbUrl(process.env.DATABASE_URL);

    // Create Sequelize instance
    const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
      host: dbConfig.host,
      port: dbConfig.port,
      dialect: 'mysql',
      logging: false, // Disable logging for cleaner output
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
    });

    await sequelize.authenticate();

    // Check Users table
    console.log('\n👥 USERS TABLE:');
    const [userCount] = await sequelize.query("SELECT COUNT(*) as count FROM Users");
    console.log(`Total users: ${userCount[0].count}`);
    
    if (userCount[0].count > 0) {
      const [users] = await sequelize.query("SELECT id, username, email, googleId, createdAt FROM Users LIMIT 5");
      users.forEach(user => {
        console.log(`  - ID: ${user.id}, Username: ${user.username}, Email: ${user.email}, Google: ${user.googleId ? 'Yes' : 'No'}, Created: ${user.createdAt}`);
      });
    }

    // Check Rooms table
    console.log('\n🏠 ROOMS TABLE:');
    const [roomCount] = await sequelize.query("SELECT COUNT(*) as count FROM Rooms");
    console.log(`Total rooms: ${roomCount[0].count}`);
    
    if (roomCount[0].count > 0) {
      const [rooms] = await sequelize.query("SELECT id, roomId, title, createdBy, isActive, createdAt FROM Rooms LIMIT 5");
      rooms.forEach(room => {
        console.log(`  - ID: ${room.id}, RoomID: ${room.roomId}, Title: ${room.title || 'No title'}, CreatedBy: ${room.createdBy}, Active: ${room.isActive}, Created: ${room.createdAt}`);
      });
    }

    // Check Messages table
    console.log('\n💬 MESSAGES TABLE:');
    const [messageCount] = await sequelize.query("SELECT COUNT(*) as count FROM Messages");
    console.log(`Total messages: ${messageCount[0].count}`);
    
    if (messageCount[0].count > 0) {
      const [messages] = await sequelize.query("SELECT id, roomId, sender, message, timestamp FROM Messages LIMIT 5");
      messages.forEach(msg => {
        console.log(`  - ID: ${msg.id}, RoomID: ${msg.roomId}, Sender: ${msg.sender}, Message: "${msg.message.substring(0, 50)}${msg.message.length > 50 ? '...' : ''}", Time: ${msg.timestamp}`);
      });
    }

    // Summary
    console.log('\n📊 SUMMARY:');
    console.log(`- Users: ${userCount[0].count} records`);
    console.log(`- Rooms: ${roomCount[0].count} records`);
    console.log(`- Messages: ${messageCount[0].count} records`);
    
    if (userCount[0].count === 0 && roomCount[0].count === 0 && messageCount[0].count === 0) {
      console.log('\n⚠️  No data found in tables. The application might not be saving data to TiDB.');
    } else {
      console.log('\n✅ Data is being stored in TiDB!');
    }

    await sequelize.close();

  } catch (error) {
    console.error('❌ Error checking data:', error);
    process.exit(1);
  }
};

checkData();

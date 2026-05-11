import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

// Load environment variables
dotenv.config();

const checkTableStructure = async () => {
  try {
    console.log('🔍 Checking TiDB table structure...');

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
      logging: false,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
    });

    await sequelize.authenticate();

    // Check Users table structure
    console.log('\n👥 USERS TABLE STRUCTURE:');
    const [usersColumns] = await sequelize.query("DESCRIBE Users");
    usersColumns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Key ? `(${col.Key})` : ''}`);
    });

    // Check Rooms table structure
    console.log('\n🏠 ROOMS TABLE STRUCTURE:');
    const [roomsColumns] = await sequelize.query("DESCRIBE Rooms");
    roomsColumns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Key ? `(${col.Key})` : ''}`);
    });

    // Check Messages table structure
    console.log('\n💬 MESSAGES TABLE STRUCTURE:');
    const [messagesColumns] = await sequelize.query("DESCRIBE Messages");
    messagesColumns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Key ? `(${col.Key})` : ''}`);
    });

    // Now check data with correct column names
    console.log('\n📊 CHECKING DATA:');
    
    // Check Users table data
    const [userCount] = await sequelize.query("SELECT COUNT(*) as count FROM Users");
    console.log(`\nTotal users: ${userCount[0].count}`);
    
    if (userCount[0].count > 0) {
      // Get column names first
      const userColumns = usersColumns.map(col => col.Field);
      const userSelect = userColumns.join(', ');
      const [users] = await sequelize.query(`SELECT ${userSelect} FROM Users LIMIT 5`);
      users.forEach(user => {
        console.log(`  User: ${JSON.stringify(user, null, 2)}`);
      });
    }

    // Check Rooms table data
    const [roomCount] = await sequelize.query("SELECT COUNT(*) as count FROM Rooms");
    console.log(`\nTotal rooms: ${roomCount[0].count}`);
    
    if (roomCount[0].count > 0) {
      const roomColumns = roomsColumns.map(col => col.Field);
      const roomSelect = roomColumns.join(', ');
      const [rooms] = await sequelize.query(`SELECT ${roomSelect} FROM Rooms LIMIT 5`);
      rooms.forEach(room => {
        console.log(`  Room: ${JSON.stringify(room, null, 2)}`);
      });
    }

    // Check Messages table data
    const [messageCount] = await sequelize.query("SELECT COUNT(*) as count FROM Messages");
    console.log(`\nTotal messages: ${messageCount[0].count}`);
    
    if (messageCount[0].count > 0) {
      const messageColumns = messagesColumns.map(col => col.Field);
      const messageSelect = messageColumns.join(', ');
      const [messages] = await sequelize.query(`SELECT ${messageSelect} FROM Messages LIMIT 5`);
      messages.forEach(msg => {
        console.log(`  Message: ${JSON.stringify(msg, null, 2)}`);
      });
    }

    await sequelize.close();

  } catch (error) {
    console.error('❌ Error checking table structure:', error);
    process.exit(1);
  }
};

checkTableStructure();

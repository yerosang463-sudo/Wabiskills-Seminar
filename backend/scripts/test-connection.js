import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

// Load environment variables
dotenv.config();

console.log('🚀 Testing TiDB connection...');
console.log('📡 DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');

const testConnection = async () => {
  try {
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
    console.log('🔗 Database config:', {
      host: dbConfig.host,
      port: dbConfig.port,
      database: dbConfig.database,
      username: dbConfig.username
    });

    // Create Sequelize instance
    const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
      host: dbConfig.host,
      port: dbConfig.port,
      dialect: 'mysql',
      logging: console.log,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
    });

    console.log('🔌 Attempting to connect...');
    
    // Test authentication
    await sequelize.authenticate();
    console.log('✅ Connection successful!');

    // Test basic query
    const [results] = await sequelize.query("SELECT 1 as test");
    console.log('📊 Test query result:', results);

    // Check tables
    const [tables] = await sequelize.query("SHOW TABLES");
    console.log('📋 Tables found:', tables.length);
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`  - ${tableName}`);
    });

    // Close connection
    await sequelize.close();
    console.log('🎉 Connection test complete!');

  } catch (error) {
    console.error('❌ Connection failed:', error);
    process.exit(1);
  }
};

testConnection();

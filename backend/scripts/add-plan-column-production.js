import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function addPlanColumn() {
  let sequelize;
  
  try {
    // Parse DATABASE_URL for MySQL connection
    const parseDbUrl = (url) => {
      const match = url.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
      if (!match) {
        throw new Error('Invalid DATABASE_URL format. Use mysql://user:password@host:port/database');
      }
      return {
        username: match[1],
        password: match[2],
        host: match[3],
        port: parseInt(match[4], 10),
        database: match[5],
      };
    };

    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL not found in environment variables');
      console.log('Please set DATABASE_URL in your .env file or environment');
      process.exit(1);
    }

    const dbConfig = parseDbUrl(process.env.DATABASE_URL);
    
    console.log(`🔗 Connecting to database: ${dbConfig.database} at ${dbConfig.host}`);

    sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
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

    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    console.log('\n🔧 Adding plan column to Users table...');

    const queryInterface = sequelize.getQueryInterface();
    
    // Check if column already exists
    const tableDescription = await queryInterface.describeTable('Users');
    
    if (tableDescription.plan) {
      console.log('✅ Plan column already exists!');
      
      console.log('\n📋 Current Users table structure:');
      Object.keys(tableDescription).forEach(column => {
        console.log(`  - ${column}: ${tableDescription[column].type}`);
      });
      
      await sequelize.close();
      process.exit(0);
    }

    // Add the plan column
    await sequelize.query(`
      ALTER TABLE Users 
      ADD COLUMN plan VARCHAR(255) NULL DEFAULT 'free'
    `);

    console.log('✅ Successfully added plan column to Users table!');
    
    // Verify the column was added
    const updatedDescription = await queryInterface.describeTable('Users');
    console.log('\n📋 Updated Users table structure:');
    Object.keys(updatedDescription).forEach(column => {
      console.log(`  - ${column}: ${updatedDescription[column].type}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    if (sequelize) {
      await sequelize.close();
    }
  }
}

addPlanColumn();
